const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Route cũ cho Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/moderation', adminController.getModerationPosts);
router.post('/moderation/action', adminController.handleModerationAction);
router.post('/moderation/action', adminController.calculateGrowth);
router.post('/moderation/bulk', adminController.handleBulkModeration);
module.exports = router;