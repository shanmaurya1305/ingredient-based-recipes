const Recipe = require('../models/Recipe');

/**
 * Retrieves all recipes from the database, with optional filters
 * @param {Object} query - Object containing filters (e.g., category, cuisine)
 * @returns {Promise<Array>} - Array of recipe documents
 */
const getAllRecipes = async (query = {}) => {
  const filters = {};
  
  // Support category filtering
  if (query.category) {
    filters.category = { $regex: new RegExp(query.category, 'i') };
  }
  
  // Support cuisine filtering
  if (query.cuisine) {
    filters.cuisine = { $regex: new RegExp(query.cuisine, 'i') };
  }

  // Find all recipes matching filters
  return await Recipe.find(filters);
};

/**
 * Retrieves a single recipe document by ID
 * @param {string} recipeId - Mongoose ObjectId of the recipe
 * @returns {Promise<Object>} - Recipe document
 */
const getRecipeById = async (recipeId) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error = new Error('Recipe not found');
    error.status = 404;
    throw error;
  }
  return recipe;
};

/**
 * Recommends recipes based on user inputs of available ingredients
 * @param {Array<string>} userIngredients - List of ingredients provided by the user
 * @returns {Promise<Array>} - Sorted array of recipe objects with match percentages
 */
const recommendRecipes = async (userIngredients) => {
  if (!userIngredients || !Array.isArray(userIngredients) || userIngredients.length === 0) {
    const error = new Error('Please provide a valid list of ingredients');
    error.status = 400;
    throw error;
  }

  // Normalize user inputs (lowercase and trimmed)
  const normalizedInputs = userIngredients
    .map(ing => ing.toLowerCase().trim())
    .filter(ing => ing.length > 0);

  if (normalizedInputs.length === 0) {
    const error = new Error('Please provide non-empty ingredient names');
    error.status = 400;
    throw error;
  }

  // Fetch all recipes from DB
  const recipes = await Recipe.find({});

  // Map recipes to calculate their match percentage
  const matchingRecipes = recipes.map(recipe => {
    const recipeObject = recipe.toObject();
    
    // Extract recipe ingredient names in lowercase
    const recipeIngNames = recipeObject.ingredients.map(ing => ing.name.toLowerCase().trim());
    
    // Count matches using fuzzy lookup (includes) to support plurals / detail strings
    let matchCount = 0;
    const matchedNames = [];

    recipeIngNames.forEach(recipeIng => {
      // Check if any user ingredient matches the recipe ingredient (or vice-versa)
      const isMatch = normalizedInputs.some(userInput => 
        recipeIng.includes(userInput) || userInput.includes(recipeIng)
      );
      if (isMatch) {
        matchCount++;
        matchedNames.push(recipeIng);
      }
    });

    // Calculate match percentage
    const totalIngredients = recipeIngNames.length;
    const matchPercentage = totalIngredients > 0 ? (matchCount / totalIngredients) * 100 : 0;

    return {
      ...recipeObject,
      matchCount,
      matchPercentage: Math.round(matchPercentage * 10) / 10 // Round to 1 decimal place (e.g. 66.7)
    };
  });

  // Filter out recipes with 0 matching ingredients, and sort by highest percentage descending
  return matchingRecipes
    .filter(recipe => recipe.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};

/**
 * Generates a scaled shopping list for a specific recipe
 * @param {string} recipeId - Recipe Mongoose ID
 * @param {number} [targetServings] - Desired servings count for scaling
 * @returns {Promise<Object>} - Shopping list details with scaled ingredients
 */
const generateShoppingList = async (recipeId, targetServings) => {
  const recipe = await getRecipeById(recipeId);
  
  // Calculate scaling multiplier (default to 1 if target servings is not specified)
  let multiplier = 1;
  if (targetServings && !isNaN(targetServings) && targetServings > 0) {
    multiplier = Number(targetServings) / recipe.servings;
  }

  // Map and scale ingredients
  const shoppingList = recipe.ingredients.map(ing => {
    // Round to 2 decimal places to avoid long floating point results (e.g. 0.3333333333)
    const scaledQuantity = Math.round((ing.quantity * multiplier) * 100) / 100;
    
    return {
      name: ing.name,
      quantity: scaledQuantity,
      unit: ing.unit,
      displayText: `${scaledQuantity} ${ing.unit} ${ing.name}`
    };
  });

  return {
    recipeId: recipe._id,
    recipeTitle: recipe.title,
    originalServings: recipe.servings,
    targetServings: targetServings ? Number(targetServings) : recipe.servings,
    shoppingList
  };
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  recommendRecipes,
  generateShoppingList
};
