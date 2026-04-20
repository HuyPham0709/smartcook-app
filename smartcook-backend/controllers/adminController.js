const { poolPromise } = require('../config/db');
const sql = require('mssql'); // Khai báo mssql để dùng cho việc truyền tham số

// Hàm tính % tăng trưởng
const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = ((current - previous) / previous) * 100;
    return (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%';
};

// --- 1. API DASHBOARD (Đã fix lỗi ID và thêm bộ lọc thời gian) ---
const getDashboardStats = async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Lấy bộ lọc thời gian từ query string, mặc định là 30 ngày
        const range = req.query.range || '30d';
        let days = 30;
        if (range === '1d') days = 1;
        else if (range === '7d') days = 7;
        else if (range === '1y') days = 365;

        // Query Stats với thời gian linh động
        const statsQuery = `
            DECLARE @CurrentStart DATETIME = DATEADD(day, -@days, GETDATE());
            DECLARE @PreviousStart DATETIME = DATEADD(day, -(@days * 2), GETDATE());

            SELECT 
                (SELECT COUNT(*) FROM Users) as totalUsers,
                (SELECT COUNT(*) FROM Users WHERE CreatedAt >= @PreviousStart AND CreatedAt < @CurrentStart) as prevTotalUsers,
                
                (SELECT COUNT(*) FROM Recipes WHERE Status = 'Published') as totalRecipes,
                (SELECT COUNT(*) FROM Recipes WHERE Status = 'Published' AND CreatedAt >= @PreviousStart AND CreatedAt < @CurrentStart) as prevTotalRecipes,
                
                (SELECT COUNT(*) FROM Users WHERE UpdatedAt >= @CurrentStart) as activeUsers,
                (SELECT COUNT(*) FROM Users WHERE UpdatedAt >= @PreviousStart AND UpdatedAt < @CurrentStart) as prevActiveUsers,
                
                (SELECT COUNT(*) FROM Reports WHERE Status = 'Pending') as flaggedPosts
        `;
        const statsResult = await pool.request()
            .input('days', sql.Int, days)
            .query(statsQuery);
        const stats = statsResult.recordset[0];

        // Biểu đồ tăng trưởng người dùng
        const growthQuery = `
            SELECT FORMAT(CreatedAt, 'MMM') as month, COUNT(ID) as users
            FROM Users
            GROUP BY FORMAT(CreatedAt, 'MMM'), MONTH(CreatedAt)
            ORDER BY MONTH(CreatedAt)
        `;
        const growthResult = await pool.request().query(growthQuery);

        // Biểu đồ danh mục
        const categoryQuery = `
            SELECT TOP 5 c.Name as name, COUNT(rcm.RecipeID) as value
            FROM Categories c
            LEFT JOIN RecipeCategoryMapping rcm ON c.ID = rcm.CategoryID
            GROUP BY c.Name
        `;
        const categoryResult = await pool.request().query(categoryQuery);

        // Bảng Top Recipes - ĐÃ FIX LỖI ID CỦA LIKES
        // Sử dụng Subquery chuẩn xác dựa trên schema của bạn
        const topRecipesQuery = `
            SELECT TOP 5
                r.ID as id, r.Title as title, u.FullName as author, 
                (SELECT COUNT(*) FROM Likes l WHERE l.RecipeID = r.ID) as likes,
                (SELECT COUNT(*) FROM Comments c WHERE c.RecipeID = r.ID) as comments
            FROM Recipes r
            INNER JOIN Users u ON r.UserID = u.ID
            WHERE r.Status = 'Published'
            ORDER BY likes DESC
        `;
        const topRecipesResult = await pool.request().query(topRecipesQuery);

        // Trả về Frontend với cấu trúc có chứa value và change (%)
        res.json({
            stats: {
                totalUsers: { value: stats.totalUsers || 0, change: calculateGrowth(stats.totalUsers, stats.prevTotalUsers) },
                totalRecipes: { value: stats.totalRecipes || 0, change: calculateGrowth(stats.totalRecipes, stats.prevTotalRecipes) },
                activeUsers: { value: stats.activeUsers || 0, change: calculateGrowth(stats.activeUsers, stats.prevActiveUsers) },
                flaggedPosts: { value: stats.flaggedPosts || 0, change: '0%' } // Tạm để 0% vì Flagged Posts mang tính thời điểm
            },
            userGrowth: growthResult.recordset,
            categoryData: categoryResult.recordset.map((item, index) => ({
                ...item,
                color: ['#FF8C42', '#7CBD92', '#3B82F6', '#EF4444', '#8B5CF6'][index % 5]
            })),
            topRecipes: topRecipesResult.recordset
        });
    } catch (err) {
        console.error("Lỗi API Dashboard:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
    }
};

// --- 2. CÁC API KHÁC GIỮ NGUYÊN ---
const getAuditLogs = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                a.ID as id,
                a.CreatedAt as timestamp,
                ISNULL(u.FullName, u.Email) as admin,
                a.Action as action,
                CAST(a.TargetID AS NVARCHAR) as target,
                a.ActionDetails as details
            FROM AuditLogs a
            JOIN Users u ON a.AdminID = u.ID
            ORDER BY a.CreatedAt DESC
        `);

        const logs = result.recordset.map(log => ({
            ...log,
            severity: log.action.includes('Delete') ? 'high' : 'low'
        }));

        res.json(logs);
    } catch (err) {
        console.error("Lỗi API Audit Logs:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};

const getModerationPosts = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                r.ID as id,
                rec.Title as recipeTitle,
                ISNULL(rec.ThumbnailURL, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400') as recipeImage,
                ISNULL(uAuthor.FullName, uAuthor.Email) as author,
                uAuthor.ID as authorId, -- Lấy thêm ID tác giả để xử phạt
                ISNULL(uReporter.FullName, uReporter.Email) as flaggedBy,
                -- Giả sử Hệ thống (AI) dùng tài khoản RoleID = 1 (Admin) hoặc ReporterID = 1 để Report
                CASE WHEN uReporter.RoleID = 1 THEN 'AI' ELSE 'User' END as source,
                ISNULL(r.Reason, 'Inappropriate Content') as reason,
                FORMAT(r.CreatedAt, 'MMM dd, yyyy HH:mm') as flaggedAt,
                ISNULL(r.Reason, 'No description provided') as description
            FROM Reports r
            JOIN Recipes rec ON r.TargetID = rec.ID AND r.TargetType = 'Recipe'
            JOIN Users uAuthor ON rec.UserID = uAuthor.ID
            JOIN Users uReporter ON r.ReporterID = uReporter.ID
            WHERE r.Status = 'Pending'
            ORDER BY r.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi API Moderation:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};

const handleModerationAction = async (req, res) => {
    // Nhận thêm warnUser, banUserDays, authorId từ Frontend
    const { reportId, action, adminId, warnUser, banUserDays, authorId } = req.body; 
    
    try {
        const pool = await poolPromise;
        const transaction = new (require('mssql')).Transaction(pool);
        await transaction.begin();

        try {
            if (action === 'approve') {
                await transaction.request()
                    .input('reportId', require('mssql').Int, reportId)
                    .query("UPDATE Reports SET Status = 'Dismissed' WHERE ID = @reportId");
            } 
            else if (action === 'delete') {
                const reportData = await transaction.request()
                    .input('reportId', require('mssql').Int, reportId)
                    .query("SELECT TargetID FROM Reports WHERE ID = @reportId");
                
                const recipeId = reportData.recordset[0].TargetID;

                // 1. Xóa bài viết
                await transaction.request()
                    .input('recipeId', require('mssql').Int, recipeId)
                    .query("UPDATE Recipes SET Status = 'Deleted' WHERE ID = @recipeId");

                // 2. Cập nhật trạng thái Report
                await transaction.request()
                    .input('recipeId', require('mssql').Int, recipeId)
                    .query("UPDATE Reports SET Status = 'Resolved' WHERE TargetID = @recipeId AND TargetType = 'Recipe'");
                
                // 3. XỬ PHẠT NGƯỜI DÙNG (MỚI)
                if (warnUser) {
                    await transaction.request()
                        .input('authorId', require('mssql').Int, authorId)
                        .query("UPDATE Users SET WarningCount = ISNULL(WarningCount, 0) + 1 WHERE ID = @authorId");
                }

                if (banUserDays && banUserDays > 0) {
                    await transaction.request()
                        .input('authorId', require('mssql').Int, authorId)
                        .input('days', require('mssql').Int, banUserDays)
                        .query("UPDATE Users SET BanUntil = DATEADD(day, @days, SYSDATETIMEOFFSET()) WHERE ID = @authorId");
                }
            }

            await transaction.commit();
            res.json({ message: "Thao tác thành công" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error("Lỗi xử lý hành động Moderation:", err.message);
        res.status(500).json({ error: "Lỗi xử lý dữ liệu" });
    }
};
const handleBulkModeration = async (req, res) => {
    const { reportIds, action, adminId } = req.body;
    if (!reportIds || reportIds.length === 0) return res.status(400).json({ error: "Không có báo cáo nào được chọn" });

    try {
        const pool = await poolPromise;
        const transaction = new (require('mssql')).Transaction(pool);
        await transaction.begin();

        try {
            for (const id of reportIds) {
                if (action === 'approve') {
                    await transaction.request().input('id', require('mssql').Int, id)
                        .query("UPDATE Reports SET Status = 'Dismissed' WHERE ID = @id");
                } else if (action === 'delete') {
                    const reportData = await transaction.request().input('id', require('mssql').Int, id)
                        .query("SELECT TargetID FROM Reports WHERE ID = @id");
                    
                    if (reportData.recordset.length > 0) {
                        const recipeId = reportData.recordset[0].TargetID;
                        await transaction.request().input('recipeId', require('mssql').Int, recipeId)
                            .query("UPDATE Recipes SET Status = 'Deleted' WHERE ID = @recipeId");
                        await transaction.request().input('recipeId', require('mssql').Int, recipeId)
                            .query("UPDATE Reports SET Status = 'Resolved' WHERE TargetID = @recipeId AND TargetType = 'Recipe'");
                    }
                }
            }
            await transaction.commit();
            res.json({ message: "Xử lý hàng loạt thành công" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error("Lỗi Bulk Moderation:", err.message);
        res.status(500).json({ error: "Lỗi xử lý dữ liệu" });
    }
};
module.exports = {
    getDashboardStats,
    getAuditLogs,
    getModerationPosts,
    handleModerationAction,
    handleBulkModeration,
    calculateGrowth
};