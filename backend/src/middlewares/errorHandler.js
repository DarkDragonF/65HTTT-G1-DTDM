const { NODE_ENV } = require('../config/env');

/**
 * Custom application error class with HTTP status codes.
 * Use this for expected/operational errors (e.g., validation, not found).
 */
class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default 500)
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware.
 * Distinguishes between operational (AppError) and programming errors.
 * Includes stack traces in development mode.
 *
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  const response = {
    success: false,
    statusCode,
    message,
  };

  // Include stack trace in development for debugging
  if (NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Log unexpected errors for monitoring
  if (!err.isOperational) {
    console.error('❌ Unexpected Error:', err);
  }

  res.status(statusCode).json(response);
};

module.exports = { AppError, errorHandler };
