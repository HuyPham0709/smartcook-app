const { sql, poolPromise } = require('../config/db');
const socketService = require('../services/socket.service');

// Map lưu trữ tạm thời để chặn user spam click liên tục (Rate limiting)
const actionLocks = new Map();

const interactionController = {
    // 1. Toggle Like (Thích / Bỏ thích)
    toggleLike: async (req, res) => {
        try {
            const { recipeId } = req.params;
            const userId = req.user.userId;
            
            // --- HẠN CHẾ SPAM ---
            const lockKey = `like-${userId}-${recipeId}`;
            if (actionLocks.has(lockKey)) {
                if (Date.now() - actionLocks.get(lockKey) < 1000) { 
                    return res.status(429).json({ success: false, message: 'Thao tác quá nhanh, vui lòng chậm lại.' });
                }
            }
            actionLocks.set(lockKey, Date.now());
            setTimeout(() => actionLocks.delete(lockKey), 1000); 

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
                
                if (authorId !== userId) {
                    const countData = await pool.request().input('recipeId', sql.Int, recipeId).query('SELECT COUNT(*) as TotalLikes FROM Likes WHERE RecipeID = @recipeId');
                    const totalLikes = countData.recordset[0].TotalLikes;

                    if (totalLikes === 0) {
                        const deletedNotif = await pool.request()
                            .input('authorId', sql.Int, authorId)
                            .input('recipeId', sql.Int, recipeId)
                            .query(`
                                DELETE FROM Notifications 
                                OUTPUT DELETED.*
                                WHERE UserID = @authorId AND RecipeID = @recipeId AND Type = 'LIKE'
                            `);
                            
                        if (deletedNotif.recordset.length > 0) {
                             socketService.sendNotification(authorId, {
                                RecipeID: recipeId,
                                Type: 'LIKE',
                                ActionType: 'DELETE' 
                            });
                        }
                    } else {
                        // FIX: Bỏ 'ORDER BY CreatedAt DESC' vì bảng Likes có thể không có cột này gây crash ngầm
                        const otherLiker = await pool.request()
                            .input('recipeId', sql.Int, recipeId)
                            .query('SELECT TOP 1 UserID FROM Likes WHERE RecipeID = @recipeId');
                            
                        if (otherLiker.recordset.length > 0) {
                            const newSenderId = otherLiker.recordset[0].UserID;
                            let notifMessage = totalLikes <= 1 ? `đã thích công thức của bạn.` : `và ${totalLikes - 1} người khác đã thích công thức của bạn.`;
                            
                            const updatedNotif = await pool.request()
                                .input('authorId', sql.Int, authorId)
                                .input('senderId', sql.Int, newSenderId)
                                .input('recipeId', sql.Int, recipeId)
                                .input('message', sql.NVarChar, notifMessage)
                                .query(`
                                    UPDATE Notifications 
                                    SET Message = @message, SenderID = @senderId
                                    OUTPUT INSERTED.*
                                    WHERE UserID = @authorId AND RecipeID = @recipeId AND Type = 'LIKE'
                                `);

                            if (updatedNotif.recordset.length > 0) {
                                const newSenderData = await pool.request().input('uid', sql.Int, newSenderId).query('SELECT FullName, AvatarURL FROM Users WHERE ID = @uid');
                                const senderInfo = newSenderData.recordset[0];

                                socketService.sendNotification(authorId, {
                                    ...updatedNotif.recordset[0],
                                    SenderName: senderInfo.FullName,
                                    SenderAvatar: senderInfo.AvatarURL,
                                    ActionType: 'UPDATE'
                                });
                            }
                        }
                    }
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
                const userRes = await pool.request().input('uid', sql.Int, userId).query('SELECT FullName, AvatarURL FROM Users WHERE ID = @uid');
                const currentUser = userRes.recordset[0];

                const countData = await pool.request().input('recipeId', sql.Int, recipeId).query('SELECT COUNT(*) as TotalLikes FROM Likes WHERE RecipeID = @recipeId');
                const totalLikes = countData.recordset[0].TotalLikes;

                let notifMessage = totalLikes <= 1 ? `đã thích công thức của bạn.` : `và ${totalLikes - 1} người khác đã thích công thức của bạn.`;

                const checkNotif = await pool.request()
                    .input('authorId', sql.Int, authorId)
                    .input('recipeId', sql.Int, recipeId)
                    .query(`SELECT TOP 1 ID FROM Notifications WHERE UserID = @authorId AND RecipeID = @recipeId AND Type = 'LIKE'`);

                let finalNotif;
                let actionType = 'UPDATE'; 

                if (checkNotif.recordset.length > 0) {
                    const notifId = checkNotif.recordset[0].ID;
                    
                    // FIX MẠNH TAY: DỌN RÁC DATABASE 
                    // Xóa toàn bộ các thông báo LIKE bị trùng lặp của bài viết này (sinh ra do test code cũ)
                    await pool.request()
                        .input('authorId', sql.Int, authorId)
                        .input('recipeId', sql.Int, recipeId)
                        .input('notifId', sql.Int, notifId)
                        .query(`DELETE FROM Notifications WHERE UserID = @authorId AND RecipeID = @recipeId AND Type = 'LIKE' AND ID != @notifId`);
                    
                    // Chỉ để lại duy nhất 1 dòng chuẩn và Cập nhật nó
                    finalNotif = await pool.request()
                        .input('notifId', sql.Int, notifId)
                        .input('senderId', sql.Int, userId)
                        .input('message', sql.NVarChar, notifMessage)
                        .query(`
                            UPDATE Notifications 
                            SET Message = @message, SenderID = @senderId, IsRead = 0, CreatedAt = SYSDATETIMEOFFSET()
                            OUTPUT INSERTED.*
                            WHERE ID = @notifId
                        `);
                } else {
                    actionType = 'INSERT';
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

                socketService.sendNotification(authorId, {
                    ...finalNotif.recordset[0],
                    SenderName: currentUser.FullName,
                    SenderAvatar: currentUser.AvatarURL,
                    ActionType: actionType
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
            
            const lockKey = `cmt-${userId}-${recipeId}`;
            if (actionLocks.has(lockKey)) {
                if (Date.now() - actionLocks.get(lockKey) < 2000) { 
                    return res.status(429).json({ success: false, message: 'Vui lòng chờ vài giây trước khi bình luận tiếp.' });
                }
            }
            actionLocks.set(lockKey, Date.now());
            setTimeout(() => actionLocks.delete(lockKey), 2000);

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

                socketService.sendNotification(authorId, {
                    ...notifInserted.recordset[0],
                    SenderName: currentUser.FullName,
                    SenderAvatar: currentUser.AvatarURL,
                    ActionType: 'INSERT'
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
                const message = `đã đánh giá ${score} sao cho công thức "${recipeTitle}"`;
                
                const checkNotif = await pool.request()
                    .input('authorId', sql.Int, authorId)
                    .input('senderId', sql.Int, userId)
                    .input('recipeId', sql.Int, recipeId)
                    .query(`SELECT TOP 1 ID FROM Notifications WHERE UserID = @authorId AND SenderID = @senderId AND RecipeID = @recipeId AND Type = 'RATING'`);

                let notifInserted;
                let actionType = 'INSERT';

                if (checkNotif.recordset.length > 0) {
                    actionType = 'UPDATE';
                    notifInserted = await pool.request()
                        .input('notifId', sql.Int, checkNotif.recordset[0].ID)
                        .input('msg', sql.NVarChar, message)
                        .query(`
                            UPDATE Notifications 
                            SET Message = @msg, IsRead = 0, CreatedAt = SYSDATETIMEOFFSET()
                            OUTPUT INSERTED.*
                            WHERE ID = @notifId
                        `);
                } else {
                    notifInserted = await pool.request()
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
                }

                socketService.sendNotification(authorId, {
                    ...notifInserted.recordset[0],
                    SenderName: currentUser.FullName,
                    SenderAvatar: currentUser.AvatarURL,
                    ActionType: actionType
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
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const pool = await poolPromise;
            
            // FIX: Đổi n.* thành khai báo tường minh để tránh dính cột rác phá hỏng Avatar
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit)
                .query(`
                    SELECT 
                        n.ID, n.UserID, n.SenderID, n.Type, n.RecipeID, n.Message, n.IsRead, n.CreatedAt,
                        u.FullName as SenderName, 
                        u.AvatarURL as SenderAvatar
                    FROM Notifications n
                    LEFT JOIN Users u ON n.SenderID = u.ID
                    WHERE n.UserID = @userId
                    ORDER BY n.CreatedAt DESC
                    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
                `);
            
            const countResult = await pool.request()
                .input('userId', sql.Int, userId)
                .query('SELECT COUNT(*) as Total FROM Notifications WHERE UserID = @userId');

            res.json({
                data: result.recordset,
                total: countResult.recordset[0].Total,
                page,
                limit
            });
        } catch (error) {
            console.error('Lỗi getNotifications:', error);
            res.status(500).json({ message: 'Lỗi lấy thông báo' });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const userId = req.user.userId;
            const pool = await poolPromise;
            await pool.request()
                .input('userId', sql.Int, userId)
                .query('UPDATE Notifications SET IsRead = 1 WHERE UserID = @userId AND IsRead = 0');
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi cập nhật' });
        }
    }
};

module.exports = interactionController;