const jwt = require('jsonwebtoken');
const {
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} = require('../config/env');
const zohoVaultService = require('../services/zohoVaultService');

let cachedAccessSecret = null;

/**
 * Resolves the JWT access secret, prioritizing Zoho Vault if configured.
 * @returns {Promise<string>}
 */
const getAccessSecret = async () => {
  if (cachedAccessSecret) {
    return cachedAccessSecret;
  }

  // Prioritize Zoho Vault if configured
  if (process.env.ZOHO_VAULT_ID_JWT_ACCESS_SECRET) {
    try {
      const secret = await zohoVaultService.getSecret('JWT_ACCESS_SECRET');
      if (secret) {
        cachedAccessSecret = secret;
        console.log('[JWT Utility] JWT_ACCESS_SECRET loaded successfully from Zoho Vault.');
        return cachedAccessSecret;
      }
    } catch (err) {
      console.error('[JWT Utility] Failed to load secret from Zoho Vault:', err.message);
    }
  }

  // Fallback to local process.env or default
  const localSecret = process.env.JWT_ACCESS_SECRET || 'tlu_food_access_secret_2024_xK9mP2nQ';
  cachedAccessSecret = localSecret;
  console.log('[JWT Utility] Using fallback JWT_ACCESS_SECRET.');
  return cachedAccessSecret;
};

/**
 * Generates a short-lived JWT access token.
 * @param {Object} payload - Data to encode (e.g., { id, email, role })
 * @returns {Promise<string>} Signed JWT access token
 */
const generateAccessToken = async (payload) => {
  const secret = await getAccessSecret();
  return jwt.sign(payload, secret, {
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
 * @returns {Promise<Object>} Decoded payload
 * @throws {JsonWebTokenError} If the token is invalid or expired
 */
const verifyAccessToken = async (token) => {
  const secret = await getAccessSecret();
  return jwt.verify(token, secret);
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
