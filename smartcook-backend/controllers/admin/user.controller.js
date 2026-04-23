const { poolPromise } = require('../../config/db');
const sql = require('mssql');

const getAllUsers = async (req, res) => {
    try {
        // 1. Nhận params phân trang và tìm kiếm
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const pool = await poolPromise;
        
        // 2. Query lấy tổng số lượng (để phục vụ phân trang ở UI)
        const countQuery = await pool.request()
            .input('search', sql.NVarChar, `%${search}%`)
            .query(`
                SELECT COUNT(*) as Total 
                FROM Users 
                WHERE (active != 0 OR active IS NULL)
                AND (FullName LIKE @search OR Email LIKE @search)
            `);
        const total = countQuery.recordset[0].Total;

        // 3. Query lấy dữ liệu theo trang
        const result = await pool.request()
            .input('search', sql.NVarChar, `%${search}%`)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(`
                SELECT 
                    ID as id, 
                    Email as email, 
                    FullName as fullName, 
                    RoleID as roleId, 
                    BanUntil as banUntil, 
                    CreatedAt as createdAt,
                    CASE 
                        WHEN BanUntil IS NOT NULL AND BanUntil > GETDATE() THEN 'suspended'
                        ELSE 'active'
                    END as status -- Để DB tự tính toán status
                FROM Users
                WHERE (active != 0 OR active IS NULL)
                AND (FullName LIKE @search OR Email LIKE @search)
                ORDER BY CreatedAt DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);

        // 4. Chuẩn hóa format trả về
        res.json({
            data: result.recordset,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("Lỗi lấy danh sách User:", err.message);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

const updateUserInfo = async (req, res) => {
    const { id } = req.params;
    const { status, active } = req.body; // Bỏ truyền ngày 2099 từ Frontend

    try {
        const pool = await poolPromise;
        
        // Xử lý logic Ban/Unban chuẩn hơn ở Backend
        let banUntilDate = undefined;
        if (status === 'suspended') {
            banUntilDate = new Date();
            banUntilDate.setFullYear(banUntilDate.getFullYear() + 100); // Khóa 100 năm thay vì hardcode chuỗi
        } else if (status === 'active') {
            banUntilDate = null;
        }

        await pool.request()
            .input('id', sql.Int, id)
            .input('ban', sql.DateTimeOffset, banUntilDate)
            .input('active', sql.Int, active === undefined ? null : active)
            .query(`
                UPDATE Users 
                SET 
                    BanUntil = CASE WHEN @ban IS NOT NULL THEN @ban WHEN @ban IS NULL AND '${status}' = 'active' THEN NULL ELSE BanUntil END,
                    active = CASE WHEN @active IS NOT NULL THEN @active ELSE active END,
                    UpdatedAt = GETDATE() -- Nên có trường này để track lịch sử
                WHERE ID = @id
            `);
        res.json({ message: "Cập nhật thành công" });
    } catch (err) {
        console.error("Lỗi updateUserInfo:", err.message);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

module.exports = { getAllUsers, updateUserInfo };