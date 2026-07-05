const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to protect routes and verify JWT tokens
 */
const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Split the header ("Bearer <token>") and extract the token
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our utility
      const decoded = verifyToken(token);

      // Attach user payload (containing the user ID) to the request object
      req.user = decoded;
      
      return next(); // Proceed to next middleware/controller
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        status: 'fail',
        message: 'Not authorized, token failed or expired'
      });
    }
  }

  // If no token is provided in the headers
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Not authorized, no token provided'
    });
  }
};

module.exports = { protect };
