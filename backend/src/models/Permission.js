const { pool } = require('../config/db');

const Permission = {
  findAll: async () => {
    const [rows] = await pool.execute('SELECT * FROM permissions ORDER BY name ASC');
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM permissions WHERE id = ?', [id]);
    return rows[0] || null;
  }
};

module.exports = Permission;
