const User = require('../models/User');
const { pool } = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const auditService = require('./auditService');

const adminUserService = {
  getUsersList: async ({ page = 1, limit = 50, search, role, status } = {}) => {
    const offset = (page - 1) * limit;
    let query = 'SELECT id, full_name, email, phone, role, is_verified, status, created_at, updated_at FROM users';
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const likeSearch = `%${search}%`;
      params.push(likeSearch, likeSearch, likeSearch);
    }
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  updateUserStatus: async (targetUserId, status, reason, adminId) => {
    const user = await User.findById(targetUserId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'super_admin') {
      throw new AppError('Action forbidden. Cannot suspend or lock a Super Admin account.', 403);
    }

    await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, targetUserId]);

    await auditService.logAction({
      userId: adminId,
      action: `user.${status}`,
      targetType: 'users',
      targetId: targetUserId,
      details: JSON.stringify({ reason })
    });

    return { userId: targetUserId, status };
  },

  updateUserRole: async (targetUserId, role, adminId) => {
    const user = await User.findById(targetUserId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'super_admin' && role !== 'super_admin') {
      throw new AppError('Action forbidden. Super Admin status modifications are restricted.', 403);
    }

    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, targetUserId]);

    await auditService.logAction({
      userId: adminId,
      action: 'role.update',
      targetType: 'users',
      targetId: targetUserId,
      details: JSON.stringify({ oldRole: user.role, newRole: role })
    });

    return { userId: targetUserId, role };
  }
};

module.exports = adminUserService;
