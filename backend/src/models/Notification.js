const { pool } = require('../config/db');

/**
 * Notification model — database operations on the `notifications` table.
 */
const Notification = {
  /**
   * Creates a notification record in the database.
   */
  create: async ({ userId, type, title, message, referenceId = null, referenceType = null }) => {
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, referenceId, referenceType]
    );
    return result.insertId;
  },

  /**
   * Finds notifications for a specific user, with optional isRead filtering and pagination.
   */
  findByUserId: async (userId, { page = 1, limit = 10, isRead } = {}) => {
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    let countQuery = 'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (isRead !== undefined) {
      const isReadVal = isRead === 'true' || isRead === true ? 1 : 0;
      query += ' AND is_read = ?';
      countQuery += ' AND is_read = ?';
      params.push(isReadVal);
    }

    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;

    const offset = (page - 1) * limit;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    // Convert limit/offset to strings because of mysql2 parameter binding defaults or cast appropriately
    const paginatedParams = [...params, String(limit), String(offset)];
    const [rows] = await pool.execute(query, paginatedParams);

    return {
      notifications: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Marks a single notification as read if it belongs to the user.
   */
  markAsRead: async (id, userId) => {
    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Marks all unread notifications of a user as read.
   */
  markAllAsRead: async (userId) => {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
  },

  /**
   * Gets the count of unread notifications for a user.
   */
  getUnreadCount: async (userId) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return rows[0].count;
  },

  /**
   * Deletes a notification if it belongs to the user.
   */
  delete: async (id, userId) => {
    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Notification;
