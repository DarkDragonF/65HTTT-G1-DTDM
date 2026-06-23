const { pool } = require('../config/db');

/**
 * Cart model — database operations on the `carts` table.
 */
const Cart = {
  /**
   * Finds an existing cart for user + canteen, or creates one if it doesn't exist.
   */
  findOrCreate: async (userId, canteenId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM carts WHERE user_id = ? AND canteen_id = ?',
      [userId, canteenId]
    );
    
    if (rows.length > 0) {
      return rows[0];
    }
    
    const [result] = await pool.execute(
      'INSERT INTO carts (user_id, canteen_id) VALUES (?, ?)',
      [userId, canteenId]
    );
    
    return { id: result.insertId, user_id: userId, canteen_id: canteenId };
  },

  /**
   * Gets all carts for a user with their canteen names and logos.
   */
  findByUserId: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT c.*, can.name AS canteen_name, can.logo_url AS canteen_logo_url
       FROM carts c
       JOIN canteens can ON c.canteen_id = can.id
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows;
  },

  /**
   * Gets a specific cart by user and canteen.
   */
  findByUserAndCanteen: async (userId, canteenId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM carts WHERE user_id = ? AND canteen_id = ?',
      [userId, canteenId]
    );
    return rows[0] || null;
  },

  /**
   * Gets a cart by ID.
   */
  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT c.*, can.name AS canteen_name, can.logo_url AS canteen_logo_url
       FROM carts c
       JOIN canteens can ON c.canteen_id = can.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Deletes a cart (associated cart items will cascade delete).
   */
  delete: async (id) => {
    await pool.execute('DELETE FROM carts WHERE id = ?', [id]);
  },
};

module.exports = Cart;
