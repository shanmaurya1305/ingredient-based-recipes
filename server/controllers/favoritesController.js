const mongoose = require('mongoose');
const userService = require('../services/userService');

/**
 * Controller for retrieving the authenticated user's favorite recipes
 */
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favorites = await userService.getFavoriteRecipes(userId);
    
    res.status(200).json({
      status: 'success',
      results: favorites.length,
      data: {
        favorites
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for adding a recipe to the user's favorites list
 */
const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;

    // Validate recipe ID format
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      const error = new Error('Invalid recipe ID format');
      error.status = 400;
      throw error;
    }

    const updatedFavorites = await userService.addFavoriteRecipe(userId, recipeId);

    res.status(200).json({
      status: 'success',
      message: 'Recipe added to favorites',
      data: {
        favorites: updatedFavorites
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for removing a recipe from the user's favorites list
 */
const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;

    // Validate recipe ID format
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      const error = new Error('Invalid recipe ID format');
      error.status = 400;
      throw error;
    }

    const updatedFavorites = await userService.removeFavoriteRecipe(userId, recipeId);

    res.status(200).json({
      status: 'success',
      message: 'Recipe removed from favorites',
      data: {
        favorites: updatedFavorites
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite
};
