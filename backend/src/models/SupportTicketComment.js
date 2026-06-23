const { pool } = require('../config/db');

const SupportTicketComment = {
  create: async ({ ticketId, userId, message, isInternal = false }) => {
    const [result] = await pool.execute(
      `INSERT INTO support_ticket_comments (ticket_id, user_id, message, is_internal)
       VALUES (?, ?, ?, ?)`,
      [ticketId, userId, message, isInternal]
    );
    return result.insertId;
  },
  findByTicketId: async (ticketId, includeInternal = false) => {
    let query = `
      SELECT stc.*, u.full_name AS user_name, u.role AS user_role, u.email AS user_email
      FROM support_ticket_comments stc
      JOIN users u ON stc.user_id = u.id
      WHERE stc.ticket_id = ?
    `;
    const params = [ticketId];

    if (!includeInternal) {
      query += ' AND stc.is_internal = FALSE';
    }

    query += ' ORDER BY stc.created_at ASC';
    const [rows] = await pool.execute(query, params);
    return rows;
  }
};

module.exports = SupportTicketComment;
