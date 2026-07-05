const express = require('express');
const { getRecipes, getRecipeById, searchRecipesByIngredients, getShoppingList, getNutritionInfo } = require('../controllers/recipeController');

const router = express.Router();

/**
 * Route: GET /api/recipes
 * Description: Get all recipes
 * Access: Public
 */
router.get('/', getRecipes);

/**
 * Route: POST /api/recipes/search
 * Description: Find recipes based on ingredient matching algorithm
 * Access: Public
 */
router.post('/search', searchRecipesByIngredients);

/**
 * Route: GET /api/recipes/:id/shopping-list
 * Description: Generate a scaled shopping list for a specific recipe
 * Access: Public
 */
router.get('/:id/shopping-list', getShoppingList);

/**
 * Route: GET /api/recipes/:id/nutrition
 * Description: Retrieve USDA FoodData Central nutritional facts for a recipe
 * Access: Public
 */
router.get('/:id/nutrition', getNutritionInfo);

/**
 * Route: GET /api/recipes/:id
 * Description: Get a single recipe by its Mongoose ID
 * Access: Public
 */
router.get('/:id', getRecipeById);

module.exports = router;
