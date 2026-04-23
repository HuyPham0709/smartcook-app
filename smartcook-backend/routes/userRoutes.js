const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/profile', verifyToken, userController.getProfile); 
router.get('/', userController.getRecipes); 
router.get('/profile/:id', userController.getUserProfileById);

module.exports = router;