const { verifyAccessToken } = require('../utils/jwt');
const { AppError } = require('./errorHandler');

/**
 * Middleware that verifies the JWT access token from the Authorization header.
 * On success, attaches the decoded user payload to `req.user`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const decoded = await verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    // JWT verification errors (expired, malformed, etc.)
    return next(new AppError('Invalid or expired token.', 401));
  }
};

/**
 * Middleware factory that restricts access to users with specific roles.
 * Must be used after `verifyToken` middleware.
 *
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'canteen_owner')
 * @returns {import('express').RequestHandler} Express middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Forbidden. You do not have permission to access this resource.', 403)
      );
    }

    next();
  };
};

module.exports = { verifyToken, requireRole };
