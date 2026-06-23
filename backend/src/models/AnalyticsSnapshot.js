const { pool } = require('../config/db');

const AnalyticsSnapshot = {
  create: async ({ snapshotDate, totalOrders, totalRevenue, dailyActiveUsers }) => {
    const [result] = await pool.execute(
      `INSERT INTO analytics_snapshots (snapshot_date, total_orders, total_revenue, daily_active_users)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         total_orders = VALUES(total_orders),
         total_revenue = VALUES(total_revenue),
         daily_active_users = VALUES(daily_active_users)`,
      [snapshotDate, totalOrders, totalRevenue, dailyActiveUsers]
    );
    return result.insertId;
  },
  findRange: async (startDate, endDate) => {
    const [rows] = await pool.execute(
      `SELECT * FROM analytics_snapshots 
       WHERE snapshot_date BETWEEN ? AND ? 
       ORDER BY snapshot_date ASC`,
      [startDate, endDate]
    );
    return rows;
  }
};

module.exports = AnalyticsSnapshot;
