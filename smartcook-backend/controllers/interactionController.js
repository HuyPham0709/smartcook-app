const { sql, poolPromise } = require('../config/db');
const socketService = require('../services/socket.service');

const interactionController = {
    // 1. Toggle Like (Thích / Bỏ thích)
    toggleLike: async (req, res) => {
        try {
            const { recipeId } = req.params;
            const userId = req.user.userId;
            const pool = await poolPromise;

            // Lấy AuthorID (chủ nhân bài viết)
            const recipeData = await pool.request()
                .input('recipeId', sql.Int, recipeId)
                .query('SELECT UserID FROM Recipes WHERE ID = @recipeId');
            
            if (recipeData.recordset.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy công thức' });
            const authorId = recipeData.recordset[0].UserID;

            // Kiểm tra xem đã like chưa
            const checkLike = await pool.request()
                .input('userId', sql.Int, userId)
                .input('recipeId', sql.Int, recipeId)
                .query('SELECT * FROM Likes WHERE UserID = @userId AND RecipeID = @recipeId');

            if (checkLike.recordset.length > 0) {
                // ==========================================
                // ĐÃ LIKE -> BỎ LIKE
                // ==========================================
                await pool.request()
                    .input('userId', sql.Int, userId)
                    .input('recipeId', sql.Int, recipeId)
                    .query('DELETE FROM Likes WHERE UserID = @userId AND RecipeID = @recipeId');
                
                // SỬA LỖI SPAM: Khi bỏ like, phải thu hồi (xóa) luôn thông báo tương ứng
                if (authorId !== userId) {
                    await pool.request()
                        .input('authorId', sql.Int, authorId)
                        .input('senderId', sql.Int, userId)
                        .input('recipeId', sql.Int, recipeId)
                        .query(`DELETE FROM Notifications WHERE UserID = @authorId AND SenderID = @senderId AND RecipeID = @recipeId AND Type = 'LIKE'`);
                }

                return res.json({ success: true, message: 'Đã bỏ thích', isLiked: false });
            } 
            
            // ==========================================
            // CHƯA LIKE -> THÊM LIKE
            // ==========================================
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('recipeId', sql.Int, recipeId)
                .query('INSERT INTO Likes (UserID, RecipeID) VALUES (@userId, @recipeId)');

            if (authorId !== userId) {
                // Lấy Name và Avatar của người đang like để gửi Socket
                const userRes = await pool.request().input('uid', sql.Int, userId).query('SELECT FullName, AvatarURL FROM Users WHERE ID = @uid');
                const currentUser = userRes.recordset[0];

                // Đếm TỔNG SỐ lượt like hiện tại
                const countData = await pool.request().input('recipeId', sql.Int, recipeId).query('SELECT COUNT(*) as TotalLikes FROM Likes WHERE RecipeID = @recipeId');
                const totalLikes = countData.recordset[0].TotalLikes;

                let notifMessage = totalLikes <= 1 ? `đã thích công thức của bạn.` : `và ${totalLikes - 1} người khác đã thích công thức của bạn.`;

                // Kiểm tra xem đã CÓ thông báo LIKE của user này chưa
                const checkNotif = await pool.request()
                    .input('authorId', sql.Int, authorId)
                    .input('senderId', sql.Int, userId)
                    .input('recipeId', sql.Int, recipeId)
                    .query(`SELECT ID FROM Notifications WHERE UserID = @authorId AND SenderID = @senderId AND RecipeID = @recipeId AND Type = 'LIKE'`);

                let finalNotif;

                if (checkNotif.recordset.length > 0) {
                    // CÓ RỒI -> CẬP NHẬT (Không lưu SenderName/Avatar vào DB vì bảng không có cột này)
                    const notifId = checkNotif.recordset[0].ID;
                    finalNotif = await pool.request()
                        .input('notifId', sql.Int, notifId)
                        .input('message', sql.NVarChar, notifMessage)
                        .query(`
                            UPDATE Notifications 
                            SET Message = @message, IsRead = 0, CreatedAt = SYSDATETIMEOFFSET()
                            OUTPUT INSERTED.*
                            WHERE ID = @notifId
                        `);
                } else {
                    // CHƯA CÓ -> TẠO MỚI
                    finalNotif = await pool.request()
                        .input('authorId', sql.Int, authorId)
                        .input('senderId', sql.Int, userId)
                        .input('recipeId', sql.Int, recipeId)
                        .input('message', sql.NVarChar, notifMessage)
                        .query(`
                            INSERT INTO Notifications (UserID, SenderID, Type, RecipeID, Message, IsRead, CreatedAt)
                            OUTPUT INSERTED.*
                            VALUES (@authorId, @senderId, 'LIKE', @recipeId, @message, 0, SYSDATETIMEOFFSET())
                        `);
                }

                // Gửi Socket chuẩn: Khớp 100% với API getNotifications
                socketService.sendNotification(authorId, {
                    ...finalNotif.recordset[0],
                    SenderName: currentUser.FullName,
                    SenderAvatar: currentUser.AvatarURL
                });
            }

            return res.json({ success: true, message: 'Đã thích', isLiked: true });

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

            if (!content || content.trim() === '') return res.status(400).json({ success: false, message: 'Nội dung bình luận trống' });

            await pool.request()
                .input('userId', sql.Int, userId)
                .input('recipeId', sql.Int, recipeId)
                .input('content', sql.NVarChar, content)
                .input('parentId', sql.Int, parentCommentId || null)
                .query(`INSERT INTO Comments (UserID, RecipeID, Content, ParentCommentID) VALUES (@userId, @recipeId, @content, @parentId)`);

            const userRes = await pool.request().input('uid', sql.Int, userId).query('SELECT FullName, AvatarURL FROM Users WHERE ID = @uid');
            const currentUser = userRes.recordset[0];
            
            const recipeRes = await pool.request().input('rid', sql.Int, recipeId).query('SELECT UserID, Title FROM Recipes WHERE ID = @rid');
            const authorId = recipeRes.recordset[0]?.UserID;
            const recipeTitle = recipeRes.recordset[0]?.Title;

            if (authorId && authorId !== userId) {
                // SỬA LỖI LẶP TÊN: Bỏ ${currentUser.FullName} ở đầu câu đi
                const message = `đã bình luận: "${content}" trong công thức "${recipeTitle}"`;
                
                const notifInserted = await pool.request()
                    .input('authorId', sql.Int, authorId)
                    .input('senderId', sql.Int, userId)
                    .input('type', sql.NVarChar, 'COMMENT')
                    .input('recipeId', sql.Int, recipeId)
                    .input('msg', sql.NVarChar, message)
                    .query(`
                        INSERT INTO Notifications (UserID, SenderID, Type, RecipeID, Message, IsRead, CreatedAt)
                        OUTPUT INSERTED.*
                        VALUES (@authorId, @senderId, @type, @recipeId, @msg, 0, SYSDATETIMEOFFSET())
                    `);

                // SỬA LỖI SOCKET AVATAR TRẮNG
                socketService.sendNotification(authorId, {
                    ...notifInserted.recordset[0],
                    SenderName: currentUser.FullName,
                    SenderAvatar: currentUser.AvatarURL
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
            if (score < 1 || score > 5) return res.status(400).json({ success: false, message: 'Điểm đánh giá phải từ 1 đến 5' });

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
                    .query(`UPDATE Ratings SET Score = @score, Comment = @comment, CreatedAt = SYSDATETIMEOFFSET() WHERE UserID = @userId AND RecipeID = @recipeId`);
            } else {
                await pool.request()
                    .input('userId', sql.Int, userId)
                    .input('recipeId', sql.Int, recipeId)
                    .input('score', sql.Int, score)
                    .input('comment', sql.NVarChar, comment || '')
                    .query(`INSERT INTO Ratings (UserID, RecipeID, Score, Comment) VALUES (@userId, @recipeId, @score, @comment)`);
            }

            const userRes = await pool.request().input('uid', sql.Int, userId).query('SELECT FullName, AvatarURL FROM Users WHERE ID = @uid');
            const currentUser = userRes.recordset[0];
            
            const recipeRes = await pool.request().input('rid', sql.Int, recipeId).query('SELECT UserID, Title FROM Recipes WHERE ID = @rid');
            const authorId = recipeRes.recordset[0]?.UserID;
            const recipeTitle = recipeRes.recordset[0]?.Title;

            if (authorId && authorId !== userId) {
                // SỬA LỖI LẶP TÊN
                const message = `đã đánh giá ${score} sao cho công thức "${recipeTitle}"`;
                
                const notifInserted = await pool.request()
                    .input('authorId', sql.Int, authorId)
                    .input('senderId', sql.Int, userId)
                    .input('type', sql.NVarChar, 'RATING')
                    .input('recipeId', sql.Int, recipeId)
                    .input('msg', sql.NVarChar, message)
                    .query(`
                        INSERT INTO Notifications (UserID, SenderID, Type, RecipeID, Message, IsRead, CreatedAt)
                        OUTPUT INSERTED.*
                        VALUES (@authorId, @senderId, @type, @recipeId, @msg, 0, SYSDATETIMEOFFSET())
                    `);

                // SỬA LỖI SOCKET AVATAR TRẮNG
                socketService.sendNotification(authorId, {
                    ...notifInserted.recordset[0],
                    SenderName: currentUser.FullName,
                    SenderAvatar: currentUser.AvatarURL
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