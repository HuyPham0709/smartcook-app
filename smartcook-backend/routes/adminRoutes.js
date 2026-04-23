// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { validateModerationAction } = require('../middleware/validation.middleware');

const dashboardCtrl = require('../controllers/admin/dashboard.controller');
const auditCtrl = require('../controllers/admin/audit.controller');
const moderationCtrl = require('../controllers/admin/moderation.controller');

// Import đúng controller cho user management
const userCtrl = require('../controllers/admin/user.controller'); 

// Gắn khiên bảo vệ
router.use(verifyToken, checkRole([1, 2]));

// --- ROUTES DASHBOARD, AUDIT, MODERATION ---
router.get('/dashboard', dashboardCtrl.getDashboardStats);
router.get('/audit-logs', auditCtrl.getAuditLogs);
router.get('/moderation', moderationCtrl.getModerationPosts);
router.post('/moderation/action', validateModerationAction, moderationCtrl.handleModerationAction);
router.post('/moderation/bulk', moderationCtrl.handleBulkModeration);


// ==============================================================
// --- ROUTES USER MANAGEMENT ---
// ==============================================================
// 1. Lấy danh sách users
router.get('/users', userCtrl.getAllUsers);

// 2. Cập nhật user (Khớp với frontend đang dùng PUT)
// Đổi userController thành userCtrl
router.put('/users/:id', userCtrl.updateUserInfo);

module.exports = router;