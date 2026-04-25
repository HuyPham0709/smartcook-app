const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Không tìm thấy Token xác thực!' });

    // Giữ nguyên logic cũ của bạn, thêm async vào callback để check DB
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key_tam_thoi', async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token đã hết hạn hoặc không hợp lệ!' });
        
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                // Theo comment của bạn, decoded chứa userId
                .input('userId', sql.Int, decoded.userId) 
                .query(`
                    SELECT active, BanUntil, BanReason 
                    FROM Users 
                    WHERE ID = @userId
                `);

            if (result.recordset.length > 0) {
                const user = result.recordset[0];
                const now = new Date();
                const banUntilDate = user.BanUntil ? new Date(user.BanUntil) : null;
                
                // User bị khóa nếu active = 0 hoặc vẫn đang trong thời hạn BanUntil
                const isBanned = user.active === 0 || (banUntilDate && banUntilDate > now);

                if (isBanned) {
                    return res.status(403).json({
                        success: false,
                        code: "USER_BANNED",
                        message: "Tài khoản của bạn đã bị khóa.",
                        details: {
                            reason: user.BanReason || "Vi phạm chính sách cộng đồng của SmartCook.",
                            bannedUntil: user.BanUntil || "Vĩnh viễn"
                        }
                    });
                }
            } else {
                return res.status(404).json({ message: 'Người dùng không tồn tại trong hệ thống!' });
            }
            // ----------------------------------------

            // Giữ nguyên logic gán user và next() của bạn
            req.user = decoded; // decoded chứa userId và roleId
            next();
        } catch (error) {
            console.error("Lỗi xác thực middleware DB:", error);
            return res.status(500).json({ message: 'Lỗi server khi xác thực tài khoản!' });
        }
    });
};

// 2. Phân quyền Động (RBAC) - GIỮ NGUYÊN HOÀN TOÀN
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roleId) {
            return res.status(403).json({ message: 'Không thể xác thực quyền hạn!' });
        }

        if (!allowedRoles.includes(req.user.roleId)) {
            return res.status(403).json({ message: 'Từ chối truy cập! Bạn không có quyền thực hiện hành động này.' });
        }
        
        next();
    };
};

module.exports = { verifyToken, checkRole };