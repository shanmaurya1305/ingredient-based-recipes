const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for a given user payload
 * @param {Object} payload - User information payload (typically containing userId)
 * @returns {string} - Signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token remains valid for 30 days
  });
};

/**
 * Verifies and decodes a given JWT token
 * @param {string} token - Signed JWT
 * @returns {Object} - Decoded payload if verified
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};
