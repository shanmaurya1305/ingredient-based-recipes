const userService = require('../services/userService');
const { generateToken } = require('../utils/jwt');

/**
 * Controller for handling user registration requests
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Register user via service
    const user = await userService.registerUser({ username, email, password });
    
    // Generate JWT token containing the user id as payload
    const token = generateToken({ id: user._id });
    
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error); // Forward error to central error handler
  }
};

/**
 * Controller for handling user login requests
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Verify credentials via service
    const user = await userService.loginUser({ email, password });
    
    // Generate JWT token
    const token = generateToken({ id: user._id });
    
    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for retrieving the authenticated user's profile information
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is populated by the authMiddleware
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
