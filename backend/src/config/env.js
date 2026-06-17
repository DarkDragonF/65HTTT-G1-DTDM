const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Required environment variables for the application.
 * The server will refuse to start if any of these are missing.
 */
const requiredVars = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_PORT',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
];

// Validate that all required environment variables are defined
const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
    'Please check your .env file.'
  );
}

/** @type {number} Server port */
const PORT = Number(process.env.PORT) || 5000;

/** @type {string} Database host */
const DB_HOST = process.env.DB_HOST;

/** @type {string} Database user */
const DB_USER = process.env.DB_USER;

/** @type {string} Database password */
const DB_PASSWORD = process.env.DB_PASSWORD;

/** @type {string} Database name */
const DB_NAME = process.env.DB_NAME;

/** @type {number} Database port */
const DB_PORT = Number(process.env.DB_PORT) || 3306;

/** @type {string} JWT access token secret */
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

/** @type {string} JWT refresh token secret */
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/** @type {string} JWT access token expiry (e.g., '15m') */
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;

/** @type {string} JWT refresh token expiry (e.g., '7d') */
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

/** @type {string} Current Node environment */
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  PORT,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  NODE_ENV,
};
