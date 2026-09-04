const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Recipe = require('../models/Recipe');

let localRecipesCache = null;

/**
 * Reads local fallback recipes from server/recipes.json with valid MongoDB ObjectIDs
 */
const getLocalRecipes = () => {
  if (!localRecipesCache) {
    try {
      const filePath = path.join(__dirname, '../recipes.json');
      if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(rawData);
        localRecipesCache = parsed.map((item, index) => {
          // Generate a valid 24-character hex ObjectId string for each fallback item
          const hexIndex = (index + 1).toString(16).padStart(24, '0');
          return {
            _id: item._id || hexIndex,
            ...item,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString()
          };
        });
      } else {
        localRecipesCache = [];
      }
    } catch (err) {
      console.error('Error reading server/recipes.json fallback:', err.message);
      localRecipesCache = [];
    }
  }
  return localRecipesCache;
};

/**
 * Fetches recipes from MongoDB if connected and populated, otherwise falls back to recipes.json
 */
const fetchRecipesFromDBOrFallback = async (filters = {}) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const recipes = await Recipe.find(filters).exec();
      if (recipes && recipes.length > 0) {
        return recipes;
      }
    } catch (err) {
      console.warn('MongoDB query failed, using local JSON fallback:', err.message);
    }
  }

  // Filter in-memory fallback recipes
  let local = getLocalRecipes();

  if (filters.category && filters.category.$regex) {
    local = local.filter(r => r.category && filters.category.$regex.test(r.category));
  }
  if (filters.cuisine && filters.cuisine.$regex) {
    local = local.filter(r => r.cuisine && filters.cuisine.$regex.test(r.cuisine));
  }
  if (filters.region && filters.region.$regex) {
    local = local.filter(r => r.region && filters.region.$regex.test(r.region));
  }
  if (filters.isVegetarian !== undefined) {
    local = local.filter(r => r.isVegetarian === filters.isVegetarian);
  }

  return local;
};

/**
 * Retrieves all recipes from the database, with optional filters and automatic fallback
 */
const getAllRecipes = async (query = {}) => {
  const filters = {};
  
  if (query.category) {
    filters.category = { $regex: new RegExp(query.category, 'i') };
  }
  
  if (query.cuisine) {
    filters.cuisine = { $regex: new RegExp(query.cuisine, 'i') };
  }

  if (query.isVegetarian !== undefined) {
    filters.isVegetarian = query.isVegetarian === 'true' || query.isVegetarian === true;
  }

  if (query.region) {
    filters.region = { $regex: new RegExp(query.region, 'i') };
  }

  return await fetchRecipesFromDBOrFallback(filters);
};

/**
 * Retrieves a single recipe document by ID with fallback support
 */
const getRecipeById = async (recipeId) => {
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(recipeId)) {
    try {
      const recipe = await Recipe.findById(recipeId).exec();
      if (recipe) return recipe;
    } catch (err) {
      console.warn('MongoDB findById failed, using local fallback:', err.message);
    }
  }

  const localList = getLocalRecipes();
  const recipe = localList.find(r => String(r._id) === String(recipeId));
  if (!recipe) {
    const error = new Error('Recipe not found');
    error.status = 404;
    throw error;
  }
  return recipe;
};

/**
 * Recommends recipes based on user inputs of available ingredients
 */
const recommendRecipes = async (userIngredients) => {
  if (!userIngredients || !Array.isArray(userIngredients) || userIngredients.length === 0) {
    const error = new Error('Please provide a valid list of ingredients');
    error.status = 400;
    throw error;
  }

  const normalizedInputs = userIngredients
    .map(ing => ing.toLowerCase().trim())
    .filter(ing => ing.length > 0);

  if (normalizedInputs.length === 0) {
    const error = new Error('Please provide non-empty ingredient names');
    error.status = 400;
    throw error;
  }

  const recipes = await fetchRecipesFromDBOrFallback({});

  const matchingRecipes = recipes.map(recipe => {
    const recipeObject = typeof recipe.toObject === 'function' ? recipe.toObject() : recipe;
    
    const recipeIngNames = recipeObject.ingredients.map(ing => ing.name.toLowerCase().trim());
    
    let matchCount = 0;
    const matchedNames = [];

    recipeIngNames.forEach(recipeIng => {
      const isMatch = normalizedInputs.some(userInput => 
        recipeIng.includes(userInput) || userInput.includes(recipeIng)
      );
      if (isMatch) {
        matchCount++;
        matchedNames.push(recipeIng);
      }
    });

    const totalIngredients = recipeIngNames.length;
    const matchPercentage = totalIngredients > 0 ? (matchCount / totalIngredients) * 100 : 0;

    return {
      ...recipeObject,
      matchCount,
      matchPercentage: Math.round(matchPercentage * 10) / 10
    };
  });

  return matchingRecipes
    .filter(recipe => recipe.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};

/**
 * Generates a scaled shopping list for a specific recipe
 */
const generateShoppingList = async (recipeId, targetServings) => {
  const recipe = await getRecipeById(recipeId);
  
  let multiplier = 1;
  if (targetServings && !isNaN(targetServings) && targetServings > 0) {
    multiplier = Number(targetServings) / recipe.servings;
  }

  const shoppingList = recipe.ingredients.map(ing => {
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
