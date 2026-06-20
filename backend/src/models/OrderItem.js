const { pool } = require('../config/db');

/**
 * OrderItem model — direct database operations on the `order_items` table.
 * No ORM; uses raw SQL with parameterized queries for security.
 */
const OrderItem = {
  /**
   * Creates multiple order items in a batch.
   * @param {number} orderId - Order ID
   * @param {Array<Object>} items - Array of { foodId, quantity, unitPrice, subtotal }
   * @returns {Promise<void>}
   */
  createMany: async (orderId, items, connection = null) => {
    if (!items || items.length === 0) return;

    const db = connection || pool;
    const placeholders = items.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const params = [];

    items.forEach((item) => {
      params.push(orderId, item.foodId, item.quantity, item.unitPrice, item.subtotal);
    });

    await db.execute(
      `INSERT INTO order_items (order_id, food_id, quantity, unit_price, subtotal)
       VALUES ${placeholders}`,
      params
    );
  },

  /**
   * Finds all order items for an order with food details.
   * @param {number} orderId - Order ID
   * @returns {Promise<Array>} Array of order item records
   */
  findByOrderId: async (orderId) => {
    const [rows] = await pool.execute(
      `SELECT oi.*, f.name AS food_name, f.image_url AS food_image_url
       FROM order_items oi
       JOIN foods f ON oi.food_id = f.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows;
  },
};

module.exports = OrderItem;
