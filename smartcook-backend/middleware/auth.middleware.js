const jwt = require('jsonwebtoken');

// 1. Xác thực Token (Giữ nguyên của bạn)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Không tìm thấy Token xác thực!' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret_key_tam_thoi', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token đã hết hạn hoặc không hợp lệ!' });
        req.user = decoded; // decoded chứa userId và roleId
        next();
    });
};

// 2. Phân quyền Động (RBAC) - MỚI
// Cách dùng ở Route: checkRole([1, 2]) -> Chỉ Admin và Mod được vào
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