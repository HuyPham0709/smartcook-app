// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { validateModerationAction } = require('../middleware/validation.middleware');

const dashboardCtrl = require('../controllers/admin/dashboard.controller');
const auditCtrl = require('../controllers/admin/audit.controller');
const moderationCtrl = require('../controllers/admin/moderation.controller');
// CHỈ IMPORT ĐÚNG 1 CONTROLLER NÀY CHO USER MANAGEMENT
const userCtrl = require('../controllers/admin/user.controller'); 

// Gắn khiên bảo vệ
router.use(verifyToken, checkRole([1, 2]));

// --- ROUTES DASHBOARD, AUDIT, MODERATION (Giữ nguyên của bạn) ---
router.get('/dashboard', dashboardCtrl.getDashboardStats);
router.get('/audit-logs', auditCtrl.getAuditLogs);
router.get('/moderation', moderationCtrl.getModerationPosts);
router.post('/moderation/action', validateModerationAction, moderationCtrl.handleModerationAction);
router.post('/moderation/bulk', moderationCtrl.handleBulkModeration);


// ==============================================================
// --- ROUTES USER MANAGEMENT (ĐÃ DỌN DẸP SẠCH SẼ) ---
// ==============================================================
// 1. Lấy danh sách users
router.get('/users', userCtrl.getAllUsers);

// 2. Cập nhật user (Dùng chung cho cả Khóa (BanUntil) và Xóa (active = 0))
router.patch('/users/:id', userCtrl.updateUserInfo);

// (Nếu bạn có route đổi Role thì thêm ở dưới này)
// router.patch('/users/:id/role', userCtrl.changeRole);

module.exports = router;