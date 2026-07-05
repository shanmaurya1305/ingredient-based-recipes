const express = require('express');
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoritesController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to protect all routes in this file
router.use(protect);

/**
 * Route: GET /api/favorites
 * Description: Get all favorite recipes for the logged-in user
 * Access: Private (Requires Auth Token)
 */
router.get('/', getFavorites);

/**
 * Route: POST /api/favorites/:recipeId
 * Description: Add a recipe to user's favorites
 * Access: Private (Requires Auth Token)
 */
router.post('/:recipeId', addFavorite);

/**
 * Route: DELETE /api/favorites/:recipeId
 * Description: Remove a recipe from user's favorites
 * Access: Private (Requires Auth Token)
 */
router.delete('/:recipeId', removeFavorite);

module.exports = router;
