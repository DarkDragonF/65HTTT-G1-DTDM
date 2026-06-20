const { pool } = require('../config/db');

const Contract = {
  create: async ({ canteenId, contractNumber, status = 'sent', fileUrl = null }) => {
    const [result] = await pool.execute(
      `INSERT INTO contracts (canteen_id, contract_number, status, file_url)
       VALUES (?, ?, ?, ?)`,
      [canteenId, contractNumber, status, fileUrl]
    );
    return result.insertId;
  },
  findByCanteenId: async (canteenId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM contracts WHERE canteen_id = ? ORDER BY created_at DESC',
      [canteenId]
    );
    return rows;
  },
  updateStatus: async (id, status, signedAt = null) => {
    await pool.execute(
      'UPDATE contracts SET status = ?, signed_at = ? WHERE id = ?',
      [status, signedAt, id]
    );
  },
  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM contracts WHERE id = ?', [id]);
    return rows[0] || null;
  }
};

module.exports = Contract;
