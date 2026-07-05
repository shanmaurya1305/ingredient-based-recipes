const mongoose = require('mongoose');
const recipeService = require('../services/recipeService');
const nutritionService = require('../services/nutritionService');

/**
 * Controller for retrieving all recipes (Public)
 */
const getRecipes = async (req, res, next) => {
  try {
    // Pass query parameters to service to support search/filters (category, cuisine)
    const recipes = await recipeService.getAllRecipes(req.query);
    
    res.status(200).json({
      status: 'success',
      results: recipes.length,
      data: {
        recipes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for retrieving a single recipe by its ID (Public)
 */
const getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid Mongoose ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid recipe ID format');
      error.status = 400; // Bad Request
      throw error;
    }

    const recipe = await recipeService.getRecipeById(id);

    res.status(200).json({
      status: 'success',
      data: {
        recipe
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for searching recipes based on available ingredients
 */
const searchRecipesByIngredients = async (req, res, next) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients) {
      const error = new Error('Ingredients field is required');
      error.status = 400;
      throw error;
    }

    // Support both an array of strings and a comma-separated string
    let ingredientsArray = ingredients;
    if (typeof ingredients === 'string') {
      ingredientsArray = ingredients
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }

    const recommended = await recipeService.recommendRecipes(ingredientsArray);

    res.status(200).json({
      status: 'success',
      results: recommended.length,
      data: {
        recipes: recommended
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for generating and scaling a recipe's shopping list
 */
const getShoppingList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { servings } = req.query;

    // Validate recipe ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid recipe ID format');
      error.status = 400;
      throw error;
    }

    // Call service to get scaled list
    const shoppingList = await recipeService.generateShoppingList(id, servings);

    res.status(200).json({
      status: 'success',
      data: shoppingList
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for retrieving USDA nutrition information for a recipe
 */
const getNutritionInfo = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate recipe ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid recipe ID format');
      error.status = 400;
      throw error;
    }

    const nutritionData = await nutritionService.getRecipeNutrition(id);

    res.status(200).json({
      status: 'success',
      data: nutritionData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  searchRecipesByIngredients,
  getShoppingList,
  getNutritionInfo
};
