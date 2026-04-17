// controllers/adminController.js
const { poolPromise } = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // 1. Lấy các con số tổng quan (Stats)
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM Users) as totalUsers,
                (SELECT COUNT(*) FROM Recipes WHERE Status = 'Published') as totalRecipes,
                (SELECT COUNT(*) FROM Users WHERE UpdatedAt >= DATEADD(day, -30, GETDATE())) as activeUsers,
                (SELECT COUNT(*) FROM Reports WHERE Status = 'Pending') as flaggedPosts
        `;
        const statsResult = await pool.request().query(statsQuery);
        const stats = statsResult.recordset[0];

        // 2. Lấy dữ liệu tăng trưởng người dùng (Biểu đồ đường)
        const growthQuery = `
            SELECT 
                FORMAT(CreatedAt, 'MMM') as month, 
                COUNT(ID) as users
            FROM Users
            GROUP BY FORMAT(CreatedAt, 'MMM'), MONTH(CreatedAt)
            ORDER BY MONTH(CreatedAt)
        `;
        const growthResult = await pool.request().query(growthQuery);

        // 3. Lấy dữ liệu phân loại danh mục (Biểu đồ tròn)
        const categoryQuery = `
            SELECT TOP 5
                c.Name as name, 
                COUNT(rcm.RecipeID) as value
            FROM Categories c
            LEFT JOIN RecipeCategoryMapping rcm ON c.ID = rcm.CategoryID
            GROUP BY c.Name
            ORDER BY value DESC
        `;
        const categoryResult = await pool.request().query(categoryQuery);

        // 4. Lấy Top 5 Recipes (Bảng)
        const topRecipesQuery = `
            SELECT TOP 5
                r.ID as id, 
                r.Title as title, 
                u.FullName as author, 
                (SELECT COUNT(*) FROM Likes l WHERE l.RecipeID = r.ID) as likes,
                (SELECT COUNT(*) FROM Comments c WHERE c.RecipeID = r.ID) as comments
            FROM Recipes r
            INNER JOIN Users u ON r.UserID = u.ID
            WHERE r.Status = 'Published'
            ORDER BY likes DESC
        `;
        const topRecipesResult = await pool.request().query(topRecipesQuery);

        // Trả về toàn bộ dữ liệu cho Frontend
        res.json({
            stats: {
                totalUsers: stats.totalUsers || 0,
                totalRecipes: stats.totalRecipes || 0,
                activeUsers: stats.activeUsers || 0,
                flaggedPosts: stats.flaggedPosts || 0
            },
            userGrowth: growthResult.recordset,
            categoryData: categoryResult.recordset.map((item, index) => ({
                ...item,
                // Gán màu cố định cho biểu đồ tròn
                color: ['#FF8C42', '#7CBD92', '#3B82F6', '#EF4444', '#8B5CF6'][index % 5]
            })),
            topRecipes: topRecipesResult.recordset
        });

    } catch (err) {
        console.error("Lỗi API Dashboard:", err.message);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};

module.exports = { getDashboardStats };