const { pool } = require('../config/db');

/**
 * OrderStatusLog model — database operations on the `order_status_logs` table.
 */
const OrderStatusLog = {
  /**
   * Creates a status log entry. Optionally takes a transaction connection.
   */
  create: async ({ orderId, fromStatus, toStatus, changedBy, note }, connection = null) => {
    const db = connection || pool;
    const [result] = await db.execute(
      `INSERT INTO order_status_logs (order_id, from_status, to_status, changed_by, note)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, fromStatus || null, toStatus, changedBy, note || null]
    );
    return result.insertId;
  },

  /**
   * Retrieves the status transition timeline for a specific order.
   */
  findByOrderId: async (orderId) => {
    const [rows] = await pool.execute(
      `SELECT osl.*, u.full_name AS changed_by_name, u.role AS changed_by_role
       FROM order_status_logs osl
       JOIN users u ON osl.changed_by = u.id
       WHERE osl.order_id = ?
       ORDER BY osl.created_at ASC`,
      [orderId]
    );
    return rows;
  },
};

module.exports = OrderStatusLog;
