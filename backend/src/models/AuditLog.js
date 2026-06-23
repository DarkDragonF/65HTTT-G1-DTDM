const { pool } = require('../config/db');

const AuditLog = {
  create: async ({ userId, action, targetType, targetId, ipAddress, userAgent, details }) => {
    const [result] = await pool.execute(
      `INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, action, targetType, targetId || null, ipAddress || null, userAgent || null, details || null]
    );
    return result.insertId;
  },
  findAll: async ({ page = 1, limit = 50, action, targetType } = {}) => {
    const offset = (page - 1) * limit;
    let query = `
      SELECT al.*, u.full_name AS user_name, u.email AS user_email, u.role AS user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
    `;
    const conditions = [];
    const params = [];

    if (action) {
      conditions.push('al.action LIKE ?');
      params.push(`%${action}%`);
    }
    if (targetType) {
      conditions.push('al.target_type = ?');
      params.push(targetType);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(String(limit), String(offset));

    const [rows] = await pool.execute(query, params);
    return rows;
  }
};

module.exports = AuditLog;
