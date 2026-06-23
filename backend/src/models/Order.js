const { pool } = require('../config/db');

/**
 * Order model — direct database operations on the `orders` table.
 * No ORM; uses raw SQL with parameterized queries for security.
 */
const Order = {
  /**
   * Creates a new order.
   * @param {Object} params
   * @param {string} params.orderNumber - Generated order number
   * @param {number} params.userId - Customer user ID
   * @param {number} params.canteenId - Canteen ID
   * @param {number} params.totalAmount - Total order amount
   * @param {string} [params.note] - Order note
   * @param {Object} [connection] - Optional database connection for transaction
   * @returns {Promise<number>} The inserted order's ID
   */
  create: async ({ orderNumber, userId, canteenId, totalAmount, note }, connection = null) => {
    const db = connection || pool;
    const [result] = await db.execute(
      `INSERT INTO orders (order_number, user_id, canteen_id, total_amount, note)
       VALUES (?, ?, ?, ?, ?)`,
      [orderNumber, userId, canteenId, totalAmount, note || null]
    );
    return result.insertId;
  },

  /**
   * Finds an order by ID with customer, canteen, and delivery staff info.
   * @param {number} id - Order ID
   * @returns {Promise<Object|null>} The order record or null
   */
  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT o.*, u.full_name AS customer_name, u.phone AS customer_phone,
              c.name AS canteen_name, ds.full_name AS delivery_staff_name, ds.phone AS delivery_staff_phone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN canteens c ON o.canteen_id = c.id
       LEFT JOIN users ds ON o.delivery_staff_id = ds.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Finds orders by canteen ID with filters and pagination.
   * @param {number} canteenId - Canteen ID
   * @param {Object} params
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.dateFrom] - Start date filter
   * @param {string} [params.dateTo] - End date filter
   * @returns {Promise<Object>} { orders, total, page, limit, totalPages }
   */
  findByCanteenId: async (canteenId, { status, page = 1, limit = 10, dateFrom, dateTo }) => {
    let query = `SELECT o.*, u.full_name AS customer_name, u.phone AS customer_phone
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 WHERE o.canteen_id = ?`;
    let countQuery = 'SELECT COUNT(*) AS total FROM orders o WHERE o.canteen_id = ?';
    const params = [canteenId];

    if (status) {
      query += ' AND o.status = ?';
      countQuery += ' AND o.status = ?';
      params.push(status);
    }

    if (dateFrom) {
      query += ' AND o.created_at >= ?';
      countQuery += ' AND o.created_at >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND o.created_at <= ?';
      countQuery += ' AND o.created_at <= ?';
      params.push(dateTo);
    }

    // Get total count
    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    const paginatedParams = [...params, String(limit), String(offset)];
    const [rows] = await pool.execute(query, paginatedParams);

    return {
      orders: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Finds orders by user ID with filters and pagination.
   * @param {number} userId - User ID
   * @param {Object} params
   * @param {string} [params.status] - Filter by status
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} { orders, total, page, limit, totalPages }
   */
  findByUserId: async (userId, { status, page = 1, limit = 10 }) => {
    let query = `SELECT o.*, c.name AS canteen_name
                 FROM orders o
                 JOIN canteens c ON o.canteen_id = c.id
                 WHERE o.user_id = ?`;
    let countQuery = 'SELECT COUNT(*) AS total FROM orders o WHERE o.user_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND o.status = ?';
      countQuery += ' AND o.status = ?';
      params.push(status);
    }

    // Get total count
    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    const paginatedParams = [...params, String(limit), String(offset)];
    const [rows] = await pool.execute(query, paginatedParams);

    return {
      orders: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Updates order status. If cancelled, also sets cancelled_by and cancel_reason.
   * @param {number} id - Order ID
   * @param {string} status - New status
   * @param {Object} [cancelInfo] - Cancellation info
   * @param {string} [cancelInfo.cancelledBy] - Who cancelled
   * @param {string} [cancelInfo.cancelReason] - Why cancelled
   * @param {Object} [connection] - Optional database connection for transaction
   * @returns {Promise<void>}
   */
  updateStatus: async (id, status, cancelInfo, connection = null) => {
    const db = connection || pool;
    if (status === 'cancelled' && cancelInfo) {
      await db.execute(
        'UPDATE orders SET status = ?, cancelled_by = ?, cancel_reason = ? WHERE id = ?',
        [status, cancelInfo.cancelledBy, cancelInfo.cancelReason, id]
      );
    } else {
      await db.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );
    }
  },

  /**
   * Finds an order by its order number.
   * @param {string} orderNumber - The unique order number string
   * @returns {Promise<Object|null>} The order or null
   */
  findByOrderNumber: async (orderNumber) => {
    const [rows] = await pool.execute(
      `SELECT o.*, u.full_name AS customer_name, u.phone AS customer_phone,
              c.name AS canteen_name, ds.full_name AS delivery_staff_name, ds.phone AS delivery_staff_phone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN canteens c ON o.canteen_id = c.id
       LEFT JOIN users ds ON o.delivery_staff_id = ds.id
       WHERE o.order_number = ?`,
      [orderNumber]
    );
    return rows[0] || null;
  },

  /**
   * Assigns a delivery staff member to an order and updates status to delivering.
   */
  assignDeliveryStaff: async (id, staffId) => {
    await pool.execute(
      'UPDATE orders SET delivery_staff_id = ?, status = ? WHERE id = ?',
      [staffId, 'delivering', id]
    );
  },

  /**
   * Finds all orders in 'ready_for_pickup' status.
   */
  findAvailableForPickup: async ({ page = 1, limit = 10 } = {}) => {
    let query = `SELECT o.*, c.name AS canteen_name, u.full_name AS customer_name
                 FROM orders o
                 JOIN canteens c ON o.canteen_id = c.id
                 JOIN users u ON o.user_id = u.id
                 WHERE o.status = 'ready_for_pickup'`;
    let countQuery = "SELECT COUNT(*) AS total FROM orders WHERE status = 'ready_for_pickup'";

    const [countRows] = await pool.execute(countQuery);
    const total = countRows[0].total;

    const offset = (page - 1) * limit;
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.execute(query, [String(limit), String(offset)]);

    return {
      orders: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Finds orders assigned to a specific delivery staff member.
   */
  findByDeliveryStaffId: async (staffId, { status, page = 1, limit = 10 } = {}) => {
    let query = `SELECT o.*, c.name AS canteen_name, u.full_name AS customer_name
                 FROM orders o
                 JOIN canteens c ON o.canteen_id = c.id
                 JOIN users u ON o.user_id = u.id
                 WHERE o.delivery_staff_id = ?`;
    let countQuery = 'SELECT COUNT(*) AS total FROM orders WHERE delivery_staff_id = ?';
    const params = [staffId];

    if (status) {
      query += ' AND o.status = ?';
      countQuery += ' AND o.status = ?';
      params.push(status);
    }

    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;

    const offset = (page - 1) * limit;
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    const paginatedParams = [...params, String(limit), String(offset)];
    const [rows] = await pool.execute(query, paginatedParams);

    return {
      orders: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Gets revenue statistics for a canteen.
   * @param {number} canteenId - Canteen ID
   * @param {string} period - 'daily' | 'weekly' | 'monthly'
   * @returns {Promise<Object>} Revenue stats
   */
  getRevenueStats: async (canteenId, period) => {
    // Get summary stats
    const [summaryRows] = await pool.execute(
      `SELECT 
         COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) AS totalRevenue,
         COUNT(*) AS totalOrders,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedOrders,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledOrders
       FROM orders WHERE canteen_id = ?`,
      [canteenId]
    );

    let periodQuery;
    if (period === 'daily') {
      periodQuery = `
        SELECT DATE(created_at) AS period,
               COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) AS revenue,
               SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS orderCount
        FROM orders
        WHERE canteen_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY period DESC`;
    } else if (period === 'weekly') {
      periodQuery = `
        SELECT YEARWEEK(created_at, 1) AS period,
               COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) AS revenue,
               SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS orderCount
        FROM orders
        WHERE canteen_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
        GROUP BY YEARWEEK(created_at, 1)
        ORDER BY period DESC`;
    } else {
      periodQuery = `
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS period,
               COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) AS revenue,
               SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS orderCount
        FROM orders
        WHERE canteen_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY period DESC`;
    }

    const [periodRows] = await pool.execute(periodQuery, [canteenId]);

    return {
      totalRevenue: summaryRows[0].totalRevenue,
      totalOrders: summaryRows[0].totalOrders,
      completedOrders: summaryRows[0].completedOrders,
      cancelledOrders: summaryRows[0].cancelledOrders,
      revenueByPeriod: periodRows,
    };
  },
};

module.exports = Order;
