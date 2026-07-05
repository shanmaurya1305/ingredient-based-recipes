const User = require('../models/User');

/**
 * Creates a new user record in MongoDB
 * @param {Object} userData - User details { username, email, password }
 * @returns {Promise<Object>} - Saved user document (excluding password)
 */
const registerUser = async (userData) => {
  const { username, email, password } = userData;

  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    const error = new Error('Email is already registered');
    error.status = 400;
    throw error;
  }

  // Check if username already exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    const error = new Error('Username is already taken');
    error.status = 400;
    throw error;
  }

  // Instantiate and save user document (password is hashed in pre-save hook)
  const user = new User({ username, email, password });
  await user.save();

  // Convert mongoose document to object and remove password before returning
  const userObject = user.toObject();
  delete userObject.password;
  
  return userObject;
};

/**
 * Validates login credentials and returns matching user details
 * @param {Object} credentials - User credentials { email, password }
 * @returns {Promise<Object>} - User document (excluding password)
 */
const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401; // Unauthorized
    throw error;
  }

  // Verify password using schema instance comparison method
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const userObject = user.toObject();
  delete userObject.password;
  
  return userObject;
};

/**
 * Retrieves user details by Mongoose ID
 * @param {string} userId - User document ID
 * @returns {Promise<Object>} - User document (excluding password)
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
};

/**
 * Adds a recipe to the user's favorites array (ensures no duplicates)
 * @param {string} userId - User document ID
 * @param {string} recipeId - Recipe document ID
 * @returns {Promise<Array>} - Updated favorites array
 */
const addFavoriteRecipe = async (userId, recipeId) => {
  // Verify recipe exists first
  const Recipe = require('../models/Recipe');
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error = new Error('Recipe not found');
    error.status = 404;
    throw error;
  }

  // Use Mongoose findByIdAndUpdate with $addToSet to prevent duplicates atomically
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favorites: recipeId } },
    { new: true } // Returns the updated user document
  ).populate('favorites');

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return user.favorites;
};

/**
 * Removes a recipe from the user's favorites array
 * @param {string} userId - User document ID
 * @param {string} recipeId - Recipe document ID
 * @returns {Promise<Array>} - Updated favorites array
 */
const removeFavoriteRecipe = async (userId, recipeId) => {
  // Use Mongoose findByIdAndUpdate with $pull to remove the item atomically
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { favorites: recipeId } },
    { new: true }
  ).populate('favorites');

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return user.favorites;
};

/**
 * Retrieves all favorite recipe details for a specific user
 * @param {string} userId - User document ID
 * @returns {Promise<Array>} - Populated array of favorite recipes
 */
const getFavoriteRecipes = async (userId) => {
  const user = await User.findById(userId).populate('favorites');
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user.favorites;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  addFavoriteRecipe,
  removeFavoriteRecipe,
  getFavoriteRecipes
};
