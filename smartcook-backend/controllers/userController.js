const { poolPromise } = require('../config/db');

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

// Đảm bảo export đúng tên hàm getRecipes
module.exports = {
    getRecipes
};