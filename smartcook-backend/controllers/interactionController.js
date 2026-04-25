const { sql, poolPromise } = require('../config/db');
const socketService = require('../services/socket.service'); // THÊM IMPORT SOCKET SERVICE

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

                // 🔥 REAL-TIME: XỬ LÝ THÔNG BÁO CHO TÁC GIẢ
                const userRes = await pool.request().input('uid', sql.Int, userId).query('SELECT FullName, AvatarURL FROM Users WHERE ID = @uid');
                const currentUser = userRes.recordset[0];
                
                const recipeRes = await pool.request().input('rid', sql.Int, recipeId).query('SELECT UserID, Title FROM Recipes WHERE ID = @rid');
                const authorId = recipeRes.recordset[0]?.UserID;
                const recipeTitle = recipeRes.recordset[0]?.Title;

                if (authorId && authorId !== userId) { // Không tự thông báo cho chính mình
                    const message = `${currentUser.FullName} đã thích công thức "${recipeTitle}" của bạn`;
                    
                    // Lưu DB
                    await pool.request()
                        .input('authorId', sql.Int, authorId)
                        .input('senderId', sql.Int, userId)
                        .input('type', sql.NVarChar, 'LIKE')
                        .input('recipeId', sql.Int, recipeId)
                        .input('msg', sql.NVarChar, message)
                        .query(`INSERT INTO Notifications (UserID, SenderID, Type, RecipeID, Message) VALUES (@authorId, @senderId, @type, @recipeId, @msg)`);

                    // Phát Socket.io
                    socketService.sendNotification(authorId, {
                        type: 'LIKE',
                        message: message,
                        avatar: currentUser.AvatarURL,
                        time: 'Vừa xong'
                    });
                }

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
                .input('parentId', sql.Int, parentCommentId || null)
                .query(`
                    INSERT INTO Comments (UserID, RecipeID, Content, ParentCommentID) 
                    VALUES (@userId, @recipeId, @content, @parentId)
                `);

            // 🔥 REAL-TIME: XỬ LÝ THÔNG BÁO CHO TÁC GIẢ
            const userRes = await pool.request().input('uid', sql.Int, userId).query('SELECT FullName, AvatarURL FROM Users WHERE ID = @uid');
            const currentUser = userRes.recordset[0];
            
            const recipeRes = await pool.request().input('rid', sql.Int, recipeId).query('SELECT UserID, Title FROM Recipes WHERE ID = @rid');
            const authorId = recipeRes.recordset[0]?.UserID;
            const recipeTitle = recipeRes.recordset[0]?.Title;

            if (authorId && authorId !== userId) {
                const message = `${currentUser.FullName} đã bình luận: "${content}" trong công thức "${recipeTitle}"`;
                
                await pool.request()
                    .input('authorId', sql.Int, authorId)
                    .input('senderId', sql.Int, userId)
                    .input('type', sql.NVarChar, 'COMMENT')
                    .input('recipeId', sql.Int, recipeId)
                    .input('msg', sql.NVarChar, message)
                    .query(`INSERT INTO Notifications (UserID, SenderID, Type, RecipeID, Message) VALUES (@authorId, @senderId, @type, @recipeId, @msg)`);

                socketService.sendNotification(authorId, {
                    type: 'COMMENT',
                    message: message,
                    avatar: currentUser.AvatarURL,
                    time: 'Vừa xong'
                });
            }

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

            const checkRating = await pool.request()
                .input('userId', sql.Int, userId)
                .input('recipeId', sql.Int, recipeId)
                .query('SELECT ID FROM Ratings WHERE UserID = @userId AND RecipeID = @recipeId');

            if (checkRating.recordset.length > 0) {
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

            // 🔥 REAL-TIME: XỬ LÝ THÔNG BÁO CHO TÁC GIẢ
            const userRes = await pool.request().input('uid', sql.Int, userId).query('SELECT FullName, AvatarURL FROM Users WHERE ID = @uid');
            const currentUser = userRes.recordset[0];
            
            const recipeRes = await pool.request().input('rid', sql.Int, recipeId).query('SELECT UserID, Title FROM Recipes WHERE ID = @rid');
            const authorId = recipeRes.recordset[0]?.UserID;
            const recipeTitle = recipeRes.recordset[0]?.Title;

            if (authorId && authorId !== userId) {
                const message = `${currentUser.FullName} đã đánh giá ${score} sao cho công thức "${recipeTitle}"`;
                
                await pool.request()
                    .input('authorId', sql.Int, authorId)
                    .input('senderId', sql.Int, userId)
                    .input('type', sql.NVarChar, 'RATING')
                    .input('recipeId', sql.Int, recipeId)
                    .input('msg', sql.NVarChar, message)
                    .query(`INSERT INTO Notifications (UserID, SenderID, Type, RecipeID, Message) VALUES (@authorId, @senderId, @type, @recipeId, @msg)`);

                socketService.sendNotification(authorId, {
                    type: 'RATING',
                    message: message,
                    avatar: currentUser.AvatarURL,
                    time: 'Vừa xong'
                });
            }

            res.json({ success: true, message: 'Đã lưu đánh giá' });
        } catch (error) {
            console.error('Lỗi addRating:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },
    getNotifications: async (req, res) => {
        try {
            const userId = req.user.userId;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT n.*, u.FullName as SenderName, u.AvatarURL as SenderAvatar
                    FROM Notifications n
                    JOIN Users u ON n.SenderID = u.ID
                    WHERE n.UserID = @userId
                    ORDER BY n.CreatedAt DESC
                `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi lấy thông báo' });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const userId = req.user.userId;
            const pool = await poolPromise;
            await pool.request()
                .input('userId', sql.Int, userId)
                .query('UPDATE Notifications SET IsRead = 1 WHERE UserID = @userId');
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi cập nhật' });
        }
    }
};

module.exports = interactionController;