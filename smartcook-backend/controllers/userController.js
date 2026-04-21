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

module.exports = {
    getRecipes,     
    getAllUsers,     
    toggleBanUser,
    updateUserRole
};