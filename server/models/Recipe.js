const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    trim: true,
    lowercase: true // Automatically normalizes ingredient names to lowercase
  },
  quantity: {
    type: Number,
    required: [true, 'Ingredient quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Ingredient unit is required'],
    trim: true
  }
});

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Recipe description is required'],
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Recipe image URL is required'],
      trim: true
    },
    ingredients: {
      type: [ingredientSchema],
      validate: [
        {
          validator: function (val) {
            return val && val.length > 0;
          },
          message: 'A recipe must have at least one ingredient'
        }
      ]
    },
    instructions: {
      type: [String],
      required: [true, 'Instructions are required'],
      validate: [
        {
          validator: function (val) {
            return val && val.length > 0;
          },
          message: 'A recipe must have at least one instruction step'
        }
      ]
    },
    cookingTime: {
      type: Number,
      required: [true, 'Cooking time (in minutes) is required'],
      min: [1, 'Cooking time must be at least 1 minute']
    },
    servings: {
      type: Number,
      required: [true, 'Servings count is required'],
      min: [1, 'Servings must be at least 1']
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: '{VALUE} is not a valid difficulty'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    cuisine: {
      type: String,
      required: [true, 'Cuisine type is required'],
      trim: true
    },
    isVegetarian: {
      type: Boolean,
      default: true
    },
    region: {
      type: String,
      required: [true, 'Region classification is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Add index on ingredient names to optimize recommendation lookup queries
recipeSchema.index({ 'ingredients.name': 1 });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
