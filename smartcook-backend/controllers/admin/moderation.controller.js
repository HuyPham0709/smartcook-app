const { poolPromise } = require('../../config/db');
const sql = require('mssql');

const getModerationPosts = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                r.ID as id, 
                re.Title as recipeTitle, 
                re.ThumbnailURL as recipeImage,
                u.FullName as author, 
                u.ID as authorId, 
                ru.FullName as flaggedBy, 
                'User' as source, 
                r.Reason as reason, 
                r.CreatedAt as flaggedAt, 
                r.Reason as description 
            FROM Reports r
            JOIN Recipes re ON r.TargetID = re.ID
            JOIN Users u ON re.UserID = u.ID
            LEFT JOIN Users ru ON r.ReporterID = ru.ID
            WHERE r.Status = 'Pending' AND r.TargetType = 'Recipe'
            ORDER BY r.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi getModerationPosts:", err.message);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const handleModerationAction = async (req, res) => {
    try {
        const { action, postId, reason } = req.body;
        const adminId = req.user?.userId || 1; 

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            if (action === 'approve') {
                await transaction.request()
                    .input('postId', sql.Int, postId)
                    .query("UPDATE Reports SET Status = 'Dismissed' WHERE TargetID = @postId AND TargetType = 'Recipe'");
                
                await transaction.request()
                    .input('userId', sql.Int, adminId)
                    .input('desc', sql.NVarChar, `Approved recipe ID ${postId}`)
                    .query("INSERT INTO AuditLogs (AdminID, Action, TargetID, ActionDetails) VALUES (@userId, 'Approve', @postId, @desc)");

            } else if (action === 'delete') {
                await transaction.request()
                    .input('postId', sql.Int, postId)
                    .query("UPDATE Recipes SET Status = 'Deleted' WHERE ID = @postId");

                await transaction.request()
                    .input('postId', sql.Int, postId)
                    .query("UPDATE Reports SET Status = 'Resolved' WHERE TargetID = @postId AND TargetType = 'Recipe'");

                await transaction.request()
                    .input('userId', sql.Int, adminId)
                    .input('desc', sql.NVarChar, `Deleted recipe ID ${postId}. Reason: ${reason}`)
                    .query("INSERT INTO AuditLogs (AdminID, Action, TargetID, ActionDetails) VALUES (@userId, 'Delete', @postId, @desc)");

            } else if (action === 'ban') {
                const authorResult = await transaction.request()
                    .input('postId', sql.Int, postId)
                    .query("SELECT UserID FROM Recipes WHERE ID = @postId");
                
                if (authorResult.recordset.length > 0) {
                    const authorId = authorResult.recordset[0].UserID;
                    const banDays = req.body.banDays || 7;

                    await transaction.request()
                        .input('authorId', sql.Int, authorId)
                        .query("UPDATE Users SET Status = 'Banned' WHERE ID = @authorId");

                    await transaction.request()
                        .input('authorId', sql.Int, authorId)
                        .input('reason', sql.NVarChar, reason)
                        .input('banDays', sql.Int, banDays)
                        .query("UPDATE UserProfiles SET BanReason = @reason, BanUntil = DATEADD(day, @banDays, GETDATE()) WHERE UserID = @authorId");

                    await transaction.request()
                        .input('postId', sql.Int, postId)
                        .query("UPDATE Reports SET Status = 'Resolved' WHERE TargetID = @postId AND TargetType = 'Recipe'");

                    await transaction.request()
                        .input('userId', sql.Int, adminId)
                        .input('authorId', sql.Int, authorId)
                        .input('desc', sql.NVarChar, `Banned user ID ${authorId} for ${banDays} days. Reason: ${reason}`)
                        .query("INSERT INTO AuditLogs (AdminID, Action, TargetID, ActionDetails) VALUES (@userId, 'Ban', @authorId, @desc)");
                }
            }

            await transaction.commit();
            res.json({ message: "Xử lý thành công" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error("Lỗi Moderation Action:", err.message);
        res.status(500).json({ error: "Lỗi xử lý dữ liệu" });
    }
};

const handleBulkModeration = async (req, res) => {
    try {
        const { postIds, action } = req.body;
        const adminId = req.user?.userId || 1; 

        if (!Array.isArray(postIds) || postIds.length === 0) {
            return res.status(400).json({ message: "Không có bài viết nào được chọn" });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            for (const id of postIds) {
                if (action === 'approve') {
                    await transaction.request()
                        .input('id', sql.Int, id)
                        .query("UPDATE Reports SET Status = 'Dismissed' WHERE ID = @id");
                } else if (action === 'delete') {
                    const reportData = await transaction.request()
                        .input('id', sql.Int, id)
                        .query("SELECT TargetID FROM Reports WHERE ID = @id");
                    
                    if (reportData.recordset.length > 0) {
                        const recipeId = reportData.recordset[0].TargetID;
                        await transaction.request()
                            .input('recipeId', sql.Int, recipeId)
                            .query("UPDATE Recipes SET Status = 'Deleted' WHERE ID = @recipeId");
                        
                        await transaction.request()
                            .input('recipeId', sql.Int, recipeId)
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

module.exports = { getModerationPosts, handleModerationAction, handleBulkModeration };