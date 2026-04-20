const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// Đã sửa getUsers thành getRecipes để khớp với file Controller
router.get('/', userController.getRecipes); 

module.exports = router;