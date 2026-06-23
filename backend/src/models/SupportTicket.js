const { pool } = require('../config/db');

const SupportTicket = {
  create: async ({ userId, orderId, subject, description, priority = 'medium', status = 'open' }) => {
    const [result] = await pool.execute(
      `INSERT INTO support_tickets (user_id, order_id, subject, description, priority, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, orderId || null, subject, description, priority, status]
    );
    return result.insertId;
  },
  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT st.*, u.full_name AS user_name, u.email AS user_email,
              o.order_number AS order_number, o.status AS order_status,
              a.full_name AS assigned_to_name
       FROM support_tickets st
       JOIN users u ON st.user_id = u.id
       LEFT JOIN orders o ON st.order_id = o.id
       LEFT JOIN users a ON st.assigned_to = a.id
       WHERE st.id = ?`,
      [id]
    );
    return rows[0] || null;
  },
  findAll: async ({ status, priority, userId, assignedTo } = {}) => {
    let query = `
      SELECT st.*, u.full_name AS user_name, u.email AS user_email,
             a.full_name AS assigned_to_name
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      LEFT JOIN users a ON st.assigned_to = a.id
    `;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('st.status = ?');
      params.push(status);
    }
    if (priority) {
      conditions.push('st.priority = ?');
      params.push(priority);
    }
    if (userId) {
      conditions.push('st.user_id = ?');
      params.push(userId);
    }
    if (assignedTo) {
      conditions.push('st.assigned_to = ?');
      params.push(assignedTo);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY st.created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows;
  },
  updateStatus: async (id, status) => {
    await pool.execute(
      'UPDATE support_tickets SET status = ? WHERE id = ?',
      [status, id]
    );
  },
  assignTicket: async (id, adminId) => {
    await pool.execute(
      'UPDATE support_tickets SET assigned_to = ?, status = "in_progress" WHERE id = ?',
      [adminId, id]
    );
  }
};

module.exports = SupportTicket;
