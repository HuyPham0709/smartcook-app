const { sql, poolPromise } = require('../config/db');

const interactionController = {
    // 1. Toggle Like (Thích / Bỏ thích)
    toggleLike: async (req, res) => {
        try {
            const { recipeId } = req.params;
            const userId = req.user.userId; // Lấy từ auth.middleware
            const pool = await poolPromise;

            // Kiểm tra xem đã like chưa
            const checkLike = await pool.request()
                .input('userId', sql.Int, userId)
                .input('recipeId', sql.Int, recipeId)
                .query('SELECT * FROM Likes WHERE UserID = @userId AND RecipeID = @recipeId');

            if (checkLike.recordset.length > 0) {
                // Đã like -> Bỏ like (Unlike)
                await pool.request()
                    .input('userId', sql.Int, userId)
                    .input('recipeId', sql.Int, recipeId)
                    .query('DELETE FROM Likes WHERE UserID = @userId AND RecipeID = @recipeId');
                return res.json({ success: true, message: 'Đã bỏ thích công thức', isLiked: false });
            } else {
                // Chưa like -> Thêm like
                await pool.request()
                    .input('userId', sql.Int, userId)
                    .input('recipeId', sql.Int, recipeId)
                    .query('INSERT INTO Likes (UserID, RecipeID) VALUES (@userId, @recipeId)');
                return res.json({ success: true, message: 'Đã thích công thức', isLiked: true });
            }
        } catch (error) {
            console.error('Lỗi toggleLike:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },

    // 2. Thêm bình luận
    addComment: async (req, res) => {
        try {
            const { recipeId } = req.params;
            const { content, parentCommentId } = req.body;
            const userId = req.user.userId;
            const pool = await poolPromise;

            if (!content || content.trim() === '') {
                return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống' });
            }

            await pool.request()
                .input('userId', sql.Int, userId)
                .input('recipeId', sql.Int, recipeId)
                .input('content', sql.NVarChar, content)
                .input('parentId', sql.Int, parentCommentId || null) // Hỗ trợ reply (tùy chọn)
                .query(`
                    INSERT INTO Comments (UserID, RecipeID, Content, ParentCommentID) 
                    VALUES (@userId, @recipeId, @content, @parentId)
                `);

            res.json({ success: true, message: 'Đã thêm bình luận' });
        } catch (error) {
            console.error('Lỗi addComment:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },

    // 3. Gửi đánh giá (Rating)
    addRating: async (req, res) => {
        try {
            const { recipeId } = req.params;
            const { score, comment } = req.body;
            const userId = req.user.userId;
            
            if (score < 1 || score > 5) {
                return res.status(400).json({ success: false, message: 'Điểm đánh giá phải từ 1 đến 5' });
            }

            const pool = await poolPromise;

            // Kiểm tra xem user đã đánh giá công thức này chưa (Mỗi user chỉ 1 rating/1 recipe)
            const checkRating = await pool.request()
                .input('userId', sql.Int, userId)
                .input('recipeId', sql.Int, recipeId)
                .query('SELECT ID FROM Ratings WHERE UserID = @userId AND RecipeID = @recipeId');

            if (checkRating.recordset.length > 0) {
                // Đã đánh giá -> Update
                await pool.request()
                    .input('userId', sql.Int, userId)
                    .input('recipeId', sql.Int, recipeId)
                    .input('score', sql.Int, score)
                    .input('comment', sql.NVarChar, comment || '')
                    .query(`
                        UPDATE Ratings 
                        SET Score = @score, Comment = @comment, CreatedAt = SYSDATETIMEOFFSET()
                        WHERE UserID = @userId AND RecipeID = @recipeId
                    `);
            } else {
                // Chưa đánh giá -> Insert
                await pool.request()
                    .input('userId', sql.Int, userId)
                    .input('recipeId', sql.Int, recipeId)
                    .input('score', sql.Int, score)
                    .input('comment', sql.NVarChar, comment || '')
                    .query(`
                        INSERT INTO Ratings (UserID, RecipeID, Score, Comment) 
                        VALUES (@userId, @recipeId, @score, @comment)
                    `);
            }

            res.json({ success: true, message: 'Đã lưu đánh giá' });
        } catch (error) {
            console.error('Lỗi addRating:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
};

module.exports = interactionController;