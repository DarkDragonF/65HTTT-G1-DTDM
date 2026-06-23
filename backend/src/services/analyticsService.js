const { pool } = require('../config/db');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');
const zohoAnalyticsService = require('./zohoAnalyticsService');

const analyticsService = {
  getDashboardSummary: async () => {
    // 1. Calculate user counts by role
    const [userCounts] = await pool.execute(
      `SELECT role, COUNT(*) as count 
       FROM users 
       GROUP BY role`
    );

    const counts = {
      users: 0,
      students: 0,
      lecturers: 0,
      canteens: 0,
      deliveryStaff: 0,
      orders: 0,
      revenue: 0.00
    };

    userCounts.forEach(row => {
      counts.users += row.count;
      if (row.role === 'student') counts.students = row.count;
      else if (row.role === 'lecturer') counts.lecturers = row.count;
      else if (row.role === 'delivery_staff') counts.deliveryStaff = row.count;
    });

    // 2. Count canteens
    const [canteenCount] = await pool.execute('SELECT COUNT(*) as count FROM canteens');
    counts.canteens = canteenCount[0].count;

    // 3. Calculate orders & revenue totals (completed orders only)
    const [orderStats] = await pool.execute(
      `SELECT COUNT(*) as count, SUM(total_amount) as total_revenue 
       FROM orders 
       WHERE status = 'completed'`
    );
    counts.orders = orderStats[0].count || 0;
    counts.revenue = parseFloat(orderStats[0].total_revenue || 0).toFixed(2);

    // 4. Calculate periodic revenues (daily, weekly, monthly)
    const [dailyRev] = await pool.execute(
      `SELECT SUM(total_amount) as rev 
       FROM orders 
       WHERE status = 'completed' AND DATE(created_at) = CURDATE()`
    );
    const [weeklyRev] = await pool.execute(
      `SELECT SUM(total_amount) as rev 
       FROM orders 
       WHERE status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    const [monthlyRev] = await pool.execute(
      `SELECT SUM(total_amount) as rev 
       FROM orders 
       WHERE status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    return {
      totals: counts,
      revenueTrends: {
        daily: parseFloat(dailyRev[0].rev || 0).toFixed(2),
        weekly: parseFloat(weeklyRev[0].rev || 0).toFixed(2),
        monthly: parseFloat(monthlyRev[0].rev || 0).toFixed(2)
      }
    };
  },

  getRevenueAnalytics: async ({ startDate, endDate } = {}) => {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Fetch dynamic revenue report aggregated by date
    const [rows] = await pool.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as ordersCount, SUM(total_amount) as dailyRevenue
       FROM orders
       WHERE status = 'completed' AND DATE(created_at) BETWEEN ? AND ?
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      [start, end]
    );

    return rows.map(r => {
      let dateString;
      if (r.date instanceof Date) {
        dateString = r.date.toISOString().split('T')[0];
      } else {
        dateString = String(r.date);
      }
      return {
        date: dateString,
        ordersCount: r.ordersCount,
        dailyRevenue: parseFloat(r.dailyRevenue || 0).toFixed(2)
      };
    });
  },

  generateDailySnapshot: async (dateStr) => {
    const date = dateStr || new Date().toISOString().split('T')[0];

    const [stats] = await pool.execute(
      `SELECT COUNT(*) as count, SUM(total_amount) as revenue 
       FROM orders 
       WHERE status = 'completed' AND DATE(created_at) = ?`,
      [date]
    );

    // Calculate mock daily active users (count of distinct logins/active sessions)
    const [userActivity] = await pool.execute(
      `SELECT COUNT(DISTINCT user_id) as dau 
       FROM refresh_tokens 
       WHERE DATE(created_at) = ?`,
      [date]
    );

    const totalOrders = stats[0].count || 0;
    const totalRevenue = stats[0].revenue || 0.00;
    const dailyActiveUsers = userActivity[0].dau || 0;

    await AnalyticsSnapshot.create({
      snapshotDate: date,
      totalOrders,
      totalRevenue,
      dailyActiveUsers
    });

    // Sync snapshot to Zoho Analytics
    await zohoAnalyticsService.syncRevenueData(date, totalOrders, totalRevenue);

    return { date, totalOrders, totalRevenue, dailyActiveUsers };
  }
};

module.exports = analyticsService;
