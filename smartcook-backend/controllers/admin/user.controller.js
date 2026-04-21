const { poolPromise } = require('../../config/db');
const sql = require('mssql');

// 1. LẤY DANH SÁCH NGƯỜI DÙNG (Admin)
const getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                ID, Email, FullName, AvatarURL, RoleID, 
                BanUntil, active, CreatedAt
            FROM Users
            WHERE active != 0 OR active IS NULL -- Ẩn những người đã bị xóa mềm
            ORDER BY CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi lấy danh sách User:", err.message);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

// 2. CẬP NHẬT TRẠNG THÁI (Khóa/Mở Khóa & Xóa Mềm)
const updateUserInfo = async (req, res) => {
    const { id } = req.params;
    const { BanUntil, active } = req.body; 

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('ban', sql.DateTimeOffset, BanUntil === undefined ? null : BanUntil)
            .input('active', sql.Int, active === undefined ? null : active)
            .query(`
                UPDATE Users 
                SET 
                    BanUntil = CASE WHEN @ban IS NOT NULL THEN @ban ELSE BanUntil END,
                    active = CASE WHEN @active IS NOT NULL THEN @active ELSE active END
                WHERE ID = @id
            `);
        res.json({ message: "Cập nhật người dùng thành công" });
    } catch (err) {
        console.error("Lỗi updateUserInfo:", err.message);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

module.exports = { 
    getAllUsers,
    updateUserInfo 
};