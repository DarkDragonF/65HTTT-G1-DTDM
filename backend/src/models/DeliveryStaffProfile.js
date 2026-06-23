const { pool } = require('../config/db');

const DeliveryStaffProfile = {
  findOrCreate: async (userId) => {
    const [rows] = await pool.execute('SELECT * FROM delivery_staff_profiles WHERE user_id = ?', [userId]);
    if (rows.length > 0) {
      return rows[0];
    }
    await pool.execute('INSERT IGNORE INTO delivery_staff_profiles (user_id) VALUES (?)', [userId]);
    const [newRows] = await pool.execute('SELECT * FROM delivery_staff_profiles WHERE user_id = ?', [userId]);
    return newRows[0];
  },
  findAll: async () => {
    const [rows] = await pool.execute(
      `SELECT dsp.*, u.full_name, u.email, u.phone, u.status AS user_status
       FROM delivery_staff_profiles dsp
       JOIN users u ON dsp.user_id = u.id`
    );
    return rows;
  },
  findByUserId: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT dsp.*, u.full_name, u.email, u.phone, u.status AS user_status
       FROM delivery_staff_profiles dsp
       JOIN users u ON dsp.user_id = u.id
       WHERE dsp.user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  },
  incrementDeliveries: async (userId, isCompleted = true) => {
    if (isCompleted) {
      await pool.execute(
        `UPDATE delivery_staff_profiles 
         SET total_deliveries = total_deliveries + 1, completed_deliveries = completed_deliveries + 1
         WHERE user_id = ?`,
        [userId]
      );
    } else {
      await pool.execute(
        `UPDATE delivery_staff_profiles 
         SET total_deliveries = total_deliveries + 1, cancelled_deliveries = cancelled_deliveries + 1
         WHERE user_id = ?`,
        [userId]
      );
    }
  },
  updateAverageTime: async (userId, timeMins) => {
    const [rows] = await pool.execute('SELECT * FROM delivery_staff_profiles WHERE user_id = ?', [userId]);
    if (rows.length === 0) return;
    const profile = rows[0];
    const count = profile.completed_deliveries || 1;
    const currentTotalTime = profile.average_delivery_time_mins * (count - 1);
    const newAverage = Math.round((currentTotalTime + timeMins) / count);

    await pool.execute(
      'UPDATE delivery_staff_profiles SET average_delivery_time_mins = ? WHERE user_id = ?',
      [newAverage, userId]
    );
  }
};

module.exports = DeliveryStaffProfile;
