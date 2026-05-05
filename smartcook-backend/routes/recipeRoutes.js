const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Tạm thời tắt verifyToken để bạn test luồng lưu data trước
// Khi nào làm xong auth thì bạn đổi thành: router.post('/', verifyToken, recipeController.createRecipe);
router.post('/', recipeController.createRecipe);
router.get('/', recipeController.getAllRecipes);
router.get('/:recipeId', recipeController.getRecipeById);
router.post('/estimate-nutrition', recipeController.estimateNutrition);
module.exports = router;