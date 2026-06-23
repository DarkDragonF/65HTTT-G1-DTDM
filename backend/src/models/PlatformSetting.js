const { pool } = require('../config/db');

const PlatformSetting = {
  findAll: async () => {
    const [rows] = await pool.execute('SELECT * FROM platform_settings');
    return rows;
  },
  findByKey: async (key) => {
    const [rows] = await pool.execute('SELECT * FROM platform_settings WHERE setting_key = ?', [key]);
    return rows[0] || null;
  },
  update: async (key, value, adminId) => {
    const [result] = await pool.execute(
      `UPDATE platform_settings 
       SET setting_value = ?, updated_by = ? 
       WHERE setting_key = ?`,
      [value, adminId, key]
    );
    return result.affectedRows > 0;
  }
};

module.exports = PlatformSetting;
