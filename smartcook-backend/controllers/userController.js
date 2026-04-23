const { poolPromise, sql } = require('../config/db'); // THÊM 'sql' vào đây

// ==========================================
// CODE CŨ CỦA BẠN (Giữ nguyên 100% logic)
// ==========================================
const getRecipes = async (req, res) => {
    try {
        const pool = await poolPromise;
        
        const result = await pool.request().query(`
            SELECT 
                r.ID as id, 
                r.Title as title, 
                r.ThumbnailURL as image, 
                CAST(r.CookingTime AS VARCHAR) + ' mins' as prepTime,
                u.FullName as authorName, 
                u.AvatarURL as authorAvatar, 
                CAST(CASE WHEN u.RoleID = 4 THEN 1 ELSE 0 END AS BIT) as isKOL,
                (SELECT COUNT(*) FROM Likes l WHERE l.RecipeID = r.ID) as likes,
                (SELECT COUNT(*) FROM Comments c WHERE c.RecipeID = r.ID) as comments,
                (SELECT COUNT(*) FROM Recipes rm WHERE rm.ParentRecipeID = r.ID) as remixes
            FROM Recipes r
            INNER JOIN Users u ON r.UserID = u.ID
            WHERE r.Status = 'Published' AND r.ParentRecipeID IS NULL
            ORDER BY likes DESC
        `);
        
        const formattedRecipes = result.recordset.map(row => ({
            id: row.id,
            title: row.title,
            image: row.image,
            prepTime: row.prepTime,
            likes: row.likes,
            comments: row.comments,
            remixes: row.remixes,
            author: {
                name: row.authorName,
                avatar: row.authorAvatar,
                isKOL: row.isKOL
            }
        }));

        res.json(formattedRecipes);
    } catch (err) {
        console.error("Lỗi truy vấn Recipe:", err.message);
        res.status(500).send("Lỗi truy vấn: " + err.message);
    }
};
const getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT u.ID, u.Email, u.FullName, u.AvatarURL, u.RoleID, r.RoleName, u.CreatedAt, u.BanUntil, u.BanReason, u.WarningCount
            FROM Users u
            INNER JOIN Roles r ON u.RoleID = r.ID
            ORDER BY u.CreatedAt DESC
        `);
        
        res.json({ users: result.recordset });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
};

const toggleBanUser = async (req, res) => {
    const { targetUserId, isBan, banDays, banReason } = req.body; 
    const adminId = req.user.userId;

    if (!targetUserId) return res.status(400).json({ message: 'Thiếu ID người dùng!' });

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        let actionLog = '';
        let queryStr = '';

        if (isBan) {
            if (!banDays || !banReason) throw new Error("Cần cung cấp số ngày khóa và lý do!");
            queryStr = `UPDATE Users SET BanUntil = DATEADD(day, @BanDays, SYSDATETIMEOFFSET()), BanReason = @BanReason WHERE ID = @TargetID`;
            actionLog = `Banned user for ${banDays} days. Reason: ${banReason}`;
            request.input('BanDays', sql.Int, banDays);
            request.input('BanReason', sql.NVarChar, banReason);
        } else {
            queryStr = `UPDATE Users SET BanUntil = NULL, BanReason = NULL WHERE ID = @TargetID`;
            actionLog = `Unbanned user`;
        }

        request.input('TargetID', sql.Int, targetUserId);
        request.input('AdminID', sql.Int, adminId);
        request.input('ActionName', sql.NVarChar, isBan ? 'BanUser' : 'UnbanUser');
        request.input('ActionDetails', sql.NVarChar, actionLog);

        await request.query(queryStr);
        await request.query(`
            INSERT INTO AuditLogs (AdminID, Action, TargetID, ActionDetails)
            VALUES (@AdminID, @ActionName, @TargetID, @ActionDetails)
        `);

        await transaction.commit();
        res.json({ message: isBan ? 'Khóa tài khoản thành công!' : 'Đã mở khóa tài khoản!' });

    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ message: 'Lỗi khi xử lý: ' + err.message });
    }
};

const updateUserRole = async (req, res) => {
    const { targetUserId, newRoleId } = req.body;
    const adminId = req.user.userId;

    if (!targetUserId || !newRoleId) return res.status(400).json({ message: 'Dữ liệu không hợp lệ!' });
    if (targetUserId === adminId) return res.status(400).json({ message: 'Không thể tự đổi quyền của chính mình!' });

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        await request
            .input('TargetID', sql.Int, targetUserId)
            .input('NewRoleID', sql.Int, newRoleId)
            .query(`UPDATE Users SET RoleID = @NewRoleID WHERE ID = @TargetID`);

        await request
            .input('AdminID', sql.Int, adminId)
            .input('ActionName', sql.NVarChar, 'ChangeRole')
            .input('ActionDetails', sql.NVarChar, `Changed Role to ID: ${newRoleId}`)
            .query(`
                INSERT INTO AuditLogs (AdminID, Action, TargetID, ActionDetails)
                VALUES (@AdminID, @ActionName, @TargetID, @ActionDetails)
            `);

        await transaction.commit();
        res.json({ message: 'Cập nhật phân quyền thành công!' });

    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ message: 'Lỗi hệ thống: ' + err.message });
    }
};
const getProfile = async (req, res) => {
    try {
        console.log("User ID từ Token:", req.user.userId); // Kiểm tra log ở terminal/cmd của server
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.user.userId) // Ép kiểu sql.Int để chắc chắn
            .query('SELECT ID as id, FullName as name, Email as email, AvatarURL as avatar FROM Users WHERE ID = @id');

        if (result.recordset.length === 0) {
            console.log("Không tìm thấy User với ID này trong DB");
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Lỗi SQL:", err.message);
        res.status(500).json({ error: err.message });
    }
};
const getUserProfileById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        
        // Sử dụng Multi-statement Query để lấy 4 bảng kết quả trong 1 lần kết nối DB
        const result = await pool.request()
            .input('userId', sql.Int, id)
            .query(`
                -- 1. Lấy thông tin cơ bản & Thống kê
                SELECT 
                    u.ID as id, u.FullName as name, u.AvatarURL as avatar, u.Bio as bio, u.Email as username,
                    CAST(CASE WHEN u.RoleID = 4 THEN 1 ELSE 0 END AS BIT) as isKOL,
                    (SELECT COUNT(*) FROM Recipes WHERE UserID = @userId AND Status = 'Published') as totalRecipes,
                    (SELECT COUNT(*) FROM Follows WHERE FollowingID = @userId) as followers,
                    (SELECT COUNT(*) FROM Follows WHERE FollowerID = @userId) as following,
                    ISNULL((SELECT COUNT(*) FROM Likes l JOIN Recipes r ON l.RecipeID = r.ID WHERE r.UserID = @userId), 0) as totalLikes
                FROM Users u WHERE u.ID = @userId;

                -- 2. Lấy danh sách huy hiệu
                SELECT b.ID as id, b.Name as name, b.Icon as icon, b.Description as description, b.Color as color
                FROM Badges b 
                JOIN UserBadges ub ON b.ID = ub.BadgeID
                WHERE ub.UserID = @userId;

                -- 3. Lấy công thức tự tạo (My Recipes)
                SELECT 
                    r.ID as id, r.Title as title, r.ThumbnailURL as image, 
                    CAST(r.CookingTime AS VARCHAR) + ' mins' as prepTime,
                    (SELECT COUNT(*) FROM Likes l WHERE l.RecipeID = r.ID) as likes,
                    (SELECT COUNT(*) FROM Comments c WHERE c.RecipeID = r.ID) as comments,
                    (SELECT COUNT(*) FROM Recipes rm WHERE rm.ParentRecipeID = r.ID) as remixes
                FROM Recipes r
                WHERE r.UserID = @userId AND r.Status = 'Published'
                ORDER BY r.CreatedAt DESC;

                -- 4. Lấy công thức đã lưu (Saved Recipes)
                SELECT 
                    r.ID as id, r.Title as title, r.ThumbnailURL as image, 
                    CAST(r.CookingTime AS VARCHAR) + ' mins' as prepTime,
                    u.FullName as authorName, u.AvatarURL as authorAvatar,
                    CAST(CASE WHEN u.RoleID = 4 THEN 1 ELSE 0 END AS BIT) as isKOL,
                    (SELECT COUNT(*) FROM Likes l WHERE l.RecipeID = r.ID) as likes,
                    (SELECT COUNT(*) FROM Comments c WHERE c.RecipeID = r.ID) as comments,
                    (SELECT COUNT(*) FROM Recipes rm WHERE rm.ParentRecipeID = r.ID) as remixes
                FROM SavedRecipes sr
                JOIN Recipes r ON sr.RecipeID = r.ID
                JOIN Users u ON r.UserID = u.ID
                WHERE sr.UserID = @userId
                ORDER BY sr.SavedAt DESC;
            `);

        // Check xem user có tồn tại không
        if (!result.recordsets[0] || result.recordsets[0].length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        // Tách các Recordset thành từng mảng riêng biệt
        const userInfo = result.recordsets[0][0];
        const badges = result.recordsets[1];
        const myRecipesRaw = result.recordsets[2];
        const savedRecipesRaw = result.recordsets[3];

        // Format lại Response để chuẩn hóa với cấu trúc Frontend yêu cầu
        const responseData = {
            name: userInfo.name,
            username: userInfo.username, // Có thể format lại chuỗi nếu muốn
            avatar: userInfo.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', // Default fallback
            bio: userInfo.bio || 'Chưa có tiểu sử',
            isKOL: userInfo.isKOL,
            stats: {
                recipes: userInfo.totalRecipes,
                followers: userInfo.followers,
                following: userInfo.following,
                totalLikes: userInfo.totalLikes
            },
            badges: badges,
            myRecipes: myRecipesRaw.map(r => ({
                id: r.id,
                title: r.title,
                image: r.image,
                prepTime: r.prepTime,
                likes: r.likes,
                comments: r.comments,
                remixes: r.remixes,
                author: {
                    name: userInfo.name,
                    avatar: userInfo.avatar,
                    isKOL: userInfo.isKOL
                }
            })),
            savedRecipes: savedRecipesRaw.map(r => ({
                id: r.id,
                title: r.title,
                image: r.image,
                prepTime: r.prepTime,
                likes: r.likes,
                comments: r.comments,
                remixes: r.remixes,
                author: {
                    name: r.authorName,
                    avatar: r.authorAvatar,
                    isKOL: r.isKOL
                }
            }))
        };

        res.json(responseData);
    } catch (err) {
        console.error("Lỗi get user profile by ID:", err.message);
        res.status(500).json({ error: err.message });
    }
};
module.exports = {
    getRecipes,     
    getAllUsers,     
    toggleBanUser,
    updateUserRole,
    getProfile,
    getUserProfileById
};