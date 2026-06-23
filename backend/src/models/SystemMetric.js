const { pool } = require('../config/db');

const SystemMetric = {
  create: async ({ metricName, value, unit }) => {
    const [result] = await pool.execute(
      `INSERT INTO system_metrics (metric_name, value, unit)
       VALUES (?, ?, ?)`,
      [metricName, value, unit]
    );
    return result.insertId;
  },
  findByName: async (name, limit = 50) => {
    const [rows] = await pool.execute(
      `SELECT * FROM system_metrics 
       WHERE metric_name = ? 
       ORDER BY timestamp DESC LIMIT ?`,
      [name, parseInt(limit, 10)]
    );
    return rows;
  },
  getLatestMetrics: async () => {
    const [rows] = await pool.execute(
      `SELECT sm1.* FROM system_metrics sm1
       JOIN (
         SELECT metric_name, MAX(timestamp) as max_ts
         FROM system_metrics
         GROUP BY metric_name
       ) sm2 ON sm1.metric_name = sm2.metric_name AND sm1.timestamp = sm2.max_ts`
    );
    return rows;
  }
};

module.exports = SystemMetric;
