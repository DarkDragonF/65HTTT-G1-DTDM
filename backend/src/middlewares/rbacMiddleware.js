const { pool } = require('../config/db');
const { AppError } = require('./errorHandler');

/**
 * Middleware factory to check if a user has a specific permission.
 * Must be used after verifyToken.
 * 
 * @param {string} requiredPermission 
 * @returns {import('express').RequestHandler}
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Access denied. No token provided.', 401);
      }

      const { role } = req.user;

      // Super admins bypass all permission checks
      if (role === 'super_admin') {
        return next();
      }

      // Query database to check if role has the required permission
      const [rows] = await pool.execute(
        `SELECT p.name 
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role = ? AND p.name = ?`,
        [role, requiredPermission]
      );

      if (rows.length === 0) {
        throw new AppError('Forbidden. You do not have permission to perform this action.', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkPermission };
