const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Route: POST /api/auth/register
 * Description: Register a new user
 * Access: Public
 */
router.post('/register', registerValidator, register);

/**
 * Route: POST /api/auth/login
 * Description: Authenticate user & get token
 * Access: Public
 */
router.post('/login', loginValidator, login);

/**
 * Route: GET /api/auth/me
 * Description: Get current authenticated user details
 * Access: Private (Requires Bearer Token)
 */
router.get('/me', protect, getMe);

module.exports = router;
