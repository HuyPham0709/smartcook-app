const { poolPromise } = require('../../config/db');
const sql = require('mssql'); // Thêm dòng này để dùng sql.Int cho tham số

// Hàm tính % tăng trưởng
const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = ((current - previous) / previous) * 100;
    return (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%';
};

const getDashboardStats = async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Lấy bộ lọc thời gian từ query string, mặc định là 30 ngày
        const range = req.query.range || '30d';
        let days = 30;
        if (range === '1d') days = 1;
        else if (range === '7d') days = 7;
        else if (range === '1y') days = 365;

        // 1. Query Stats (Sử dụng tham số @days an toàn)
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

        // 2. Biểu đồ tăng trưởng người dùng
        const growthQuery = `
            SELECT FORMAT(CreatedAt, 'MMM') as month, COUNT(ID) as users
            FROM Users
            GROUP BY FORMAT(CreatedAt, 'MMM'), MONTH(CreatedAt)
            ORDER BY MONTH(CreatedAt)
        `;
        const growthResult = await pool.request().query(growthQuery);

        // 3. Biểu đồ danh mục
        const categoryQuery = `
            SELECT TOP 5 c.Name as name, COUNT(rcm.RecipeID) as value
            FROM Categories c
            LEFT JOIN RecipeCategoryMapping rcm ON c.ID = rcm.CategoryID
            GROUP BY c.Name
        `;
        const categoryResult = await pool.request().query(categoryQuery);

        // 4. Bảng Top Recipes
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

        // 5. Trả về Frontend
        res.json({
            stats: {
                totalUsers: { value: stats.totalUsers || 0, change: calculateGrowth(stats.totalUsers, stats.prevTotalUsers) },
                totalRecipes: { value: stats.totalRecipes || 0, change: calculateGrowth(stats.totalRecipes, stats.prevTotalRecipes) },
                activeUsers: { value: stats.activeUsers || 0, change: calculateGrowth(stats.activeUsers, stats.prevActiveUsers) },
                flaggedPosts: { value: stats.flaggedPosts || 0, change: '0%' } 
            },
            userGrowth: growthResult.recordset,
            categoryData: categoryResult.recordset.map((item, index) => ({
                ...item,
                color: ['#FF8C42', '#7CBD92', '#3B82F6', '#EF4444', '#8B5CF6'][index % 5] // Tự động gán màu cho biểu đồ tròn
            })),
            topRecipes: topRecipesResult.recordset
        });
    } catch (err) {
        console.error("Lỗi API Dashboard:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống", detail: err.message });
    }
};

module.exports = { 
    getDashboardStats, 
    calculateGrowth 
};