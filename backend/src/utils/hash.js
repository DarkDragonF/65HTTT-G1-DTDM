const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Hashes a plain-text password using bcryptjs.
 * @param {string} password - The plain-text password to hash
 * @returns {Promise<string>} The hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plain-text password against a bcrypt hash.
 * @param {string} password - The plain-text password
 * @param {string} hash - The bcrypt hash to compare against
 * @returns {Promise<boolean>} True if the password matches the hash
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
