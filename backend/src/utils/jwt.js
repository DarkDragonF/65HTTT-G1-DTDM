const jwt = require('jsonwebtoken');
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} = require('../config/env');

/**
 * Generates a short-lived JWT access token.
 * @param {Object} payload - Data to encode (e.g., { id, email, role })
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
};

/**
 * Generates a long-lived JWT refresh token.
 * @param {Object} payload - Data to encode (e.g., { id })
 * @returns {string} Signed JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verifies and decodes a JWT access token.
 * @param {string} token - The access token to verify
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError} If the token is invalid or expired
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_ACCESS_SECRET);
};

/**
 * Verifies and decodes a JWT refresh token.
 * @param {string} token - The refresh token to verify
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError} If the token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
