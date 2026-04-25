const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { verifyToken } = require('../middleware/auth.middleware');

// Các API này đều yêu cầu đăng nhập (verifyToken)
router.post('/:recipeId/like', verifyToken, interactionController.toggleLike);
router.post('/:recipeId/comment', verifyToken, interactionController.addComment);
router.post('/:recipeId/rating', verifyToken, interactionController.addRating);
router.get('/notifications', verifyToken, interactionController.getNotifications);
router.put('/notifications/mark-read', verifyToken, interactionController.markAsRead);
module.exports = router;