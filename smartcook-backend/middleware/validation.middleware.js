// src/middleware/validation.middleware.js
const { body, validationResult } = require('express-validator');

// Hàm dùng chung để hứng lỗi validation
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Cấu hình luật cho Moderation Action
const validateModerationAction = [
    body('action')
        .notEmpty().withMessage('Action không được để trống')
        .isIn(['approve', 'delete', 'ban']).withMessage('Action chỉ được là: approve, delete, ban'),
    
    body('postId')
        .notEmpty().withMessage('Thiếu postId')
        .isInt().withMessage('postId phải là một số nguyên'),
    
    body('reason')
        .if(body('action').equals('ban'))
        .notEmpty().withMessage('Bắt buộc phải có lý do (reason) khi khóa người dùng!'),
    
    validateRequest
];

module.exports = { validateModerationAction };