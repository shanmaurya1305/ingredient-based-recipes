const Recipe = require('../models/Recipe');

// Simple in-memory cache to save USDA API queries and prevent rate-limiting (DEMO_KEY limits)
const nutritionCache = new Map();

/**
 * Maps common recipe units to their estimated weight in grams
 * @param {string} unit - Ingredient unit (e.g. pieces, tbsp, g)
 * @param {number} quantity - Ingredient quantity
 * @returns {number} - Estimated weight in grams
 */
const estimateWeightInGrams = (unit, quantity) => {
  const normUnit = unit.toLowerCase().trim();
  
  switch (normUnit) {
    case 'g':
    case 'gram':
    case 'grams':
      return quantity;
    case 'kg':
    case 'kilogram':
    case 'kilograms':
      return quantity * 1000;
    case 'ml':
    case 'milliliter':
    case 'milliliters':
      return quantity; // Appx 1g per ml
    case 'tbsp':
    case 'tablespoon':
    case 'tablespoons':
      return quantity * 15;
    case 'tsp':
    case 'teaspoon':
    case 'teaspoons':
      return quantity * 5;
    case 'piece':
    case 'pieces':
      return quantity * 100; // Appx 100g per medium item (tomato, lemon, avocado)
    case 'clove':
    case 'cloves':
      return quantity * 5; // Appx 5g per garlic clove
    case 'leaf':
    case 'leaves':
      return quantity * 0.5; // Appx 0.5g per leaf (basil, parsley)
    case 'slice':
    case 'slices':
      return quantity * 40; // Appx 40g per slice of bread
    case 'baguette':
      return quantity * 250;
    default:
      return quantity * 50; // Fallback estimate for general units
  }
};

/**
 * Extracts specific nutrient values from USDA nutrient array
 * USDA nutrient names are standard but IDs can differ. We search by name.
 */
const getNutrientValue = (nutrients, nameSearch) => {
  const nutrient = nutrients.find(n => 
    n.nutrientName.toLowerCase().includes(nameSearch.toLowerCase())
  );
  return nutrient ? Number(nutrient.value) : 0;
};

/**
 * Generates mock nutrition fallback data based on recipe characteristics
 */
const generateMockNutrition = (recipe) => {
  console.log(`Generating mock nutrition data fallback for: ${recipe.title}`);
  
  let baseCalories = 350;
  let baseProtein = 12;
  let baseFat = 10;
  let baseCarbs = 45;

  const category = recipe.category.toLowerCase();
  
  if (category.includes('dinner') || recipe.title.toLowerCase().includes('pasta') || recipe.title.toLowerCase().includes('stir')) {
    baseCalories = 550;
    baseProtein = 28;
    baseFat = 18;
    baseCarbs = 65;
  } else if (category.includes('breakfast') || recipe.title.toLowerCase().includes('toast')) {
    baseCalories = 380;
    baseProtein = 14;
    baseFat = 12;
    baseCarbs = 48;
  } else if (category.includes('lunch') || recipe.title.toLowerCase().includes('salad') || recipe.title.toLowerCase().includes('guac')) {
    baseCalories = 220;
    baseProtein = 5;
    baseFat = 15;
    baseCarbs = 18;
  }

  // Add small pseudo-random variations based on serving count
  const multiplier = recipe.servings;
  
  return {
    isMock: true,
    recipeId: recipe._id,
    recipeTitle: recipe.title,
    servings: recipe.servings,
    totals: {
      calories: Math.round(baseCalories * multiplier),
      protein: Math.round(baseProtein * multiplier * 10) / 10,
      fat: Math.round(baseFat * multiplier * 10) / 10,
      carbohydrates: Math.round(baseCarbs * multiplier * 10) / 10
    },
    perServing: {
      calories: Math.round(baseCalories),
      protein: Math.round(baseProtein * 10) / 10,
      fat: Math.round(baseFat * 10) / 10,
      carbohydrates: Math.round(baseCarbs * 10) / 10
    }
  };
};

/**
 * Fetches nutrition details from USDA FoodData Central and aggregates them for the recipe
 * @param {string} recipeId - Recipe ID
 * @returns {Promise<Object>} - Nutrients total and per serving
 */
const getRecipeNutrition = async (recipeId) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error = new Error('Recipe not found');
    error.status = 404;
    throw error;
  }

  const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
  
  // Nutrient aggregators
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  try {
    for (const ingredient of recipe.ingredients) {
      const ingredientName = ingredient.name.toLowerCase().trim();
      let foodData = null;

      // 1. Check in-memory Cache
      if (nutritionCache.has(ingredientName)) {
        foodData = nutritionCache.get(ingredientName);
      } else {
        // 2. Fetch from USDA API
        const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(ingredientName)}&pageSize=1`;
        
        const response = await fetch(url);
        
        // Handle rate limiting or other HTTP errors
        if (!response.ok) {
          if (response.status === 429) {
            console.warn('USDA API rate limit reached. Triggering mock fallback.');
          } else {
            console.warn(`USDA API responded with status ${response.status}. Triggering mock fallback.`);
          }
          return generateMockNutrition(recipe);
        }

        const data = await response.json();
        
        if (data.foods && data.foods.length > 0) {
          foodData = data.foods[0];
          // Cache the USDA response
          nutritionCache.set(ingredientName, foodData);
        }
      }

      // 3. Process nutrients (USDA returns value per 100g of food item)
      if (foodData && foodData.foodNutrients) {
        const weightInGrams = estimateWeightInGrams(ingredient.unit, ingredient.quantity);
        
        // Extract values per 100g
        const calPer100g = getNutrientValue(foodData.foodNutrients, 'Energy');
        const proteinPer100g = getNutrientValue(foodData.foodNutrients, 'Protein');
        const fatPer100g = getNutrientValue(foodData.foodNutrients, 'Total lipid (fat)');
        const carbsPer100g = getNutrientValue(foodData.foodNutrients, 'Carbohydrate, by difference');

        // Scale to ingredient weight
        totalCalories += (calPer100g / 100) * weightInGrams;
        totalProtein += (proteinPer100g / 100) * weightInGrams;
        totalFat += (fatPer100g / 100) * weightInGrams;
        totalCarbs += (carbsPer100g / 100) * weightInGrams;
      } else {
        // Local default estimates if USDA has no matching foods
        const fallbackWeight = estimateWeightInGrams(ingredient.unit, ingredient.quantity);
        totalCalories += (100 / 100) * fallbackWeight; // Appx 1 kcal/g fallback
        totalCarbs += (15 / 100) * fallbackWeight;
      }
    }

    const servings = recipe.servings > 0 ? recipe.servings : 1;

    return {
      isMock: false,
      recipeId: recipe._id,
      recipeTitle: recipe.title,
      servings,
      totals: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
        carbohydrates: Math.round(totalCarbs * 10) / 10
      },
      perServing: {
        calories: Math.round(totalCalories / servings),
        protein: Math.round((totalProtein / servings) * 10) / 10,
        fat: Math.round((totalFat / servings) * 10) / 10,
        carbohydrates: Math.round((totalCarbs / servings) * 10) / 10
      }
    };

  } catch (error) {
    console.error('Error fetching/calculating USDA nutrition:', error.message);
    // Return mock data fallback so user interface never breaks
    return generateMockNutrition(recipe);
  }
};

module.exports = {
  getRecipeNutrition
};
