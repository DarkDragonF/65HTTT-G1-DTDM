const { pool } = require('../config/db');

/**
 * CartItem model — database operations on the `cart_items` table.
 */
const CartItem = {
  /**
   * Adds an item to a cart. If the food item already exists in the cart, increments the quantity.
   */
  addItem: async (cartId, foodId, quantity) => {
    const [result] = await pool.execute(
      `INSERT INTO cart_items (cart_id, food_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [cartId, foodId, quantity, quantity]
    );
    return result.insertId;
  },

  /**
   * Updates the quantity of a specific cart item.
   */
  updateQuantity: async (id, quantity) => {
    await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, id]
    );
  },

  /**
   * Removes a specific item from the cart.
   */
  removeItem: async (id) => {
    await pool.execute('DELETE FROM cart_items WHERE id = ?', [id]);
  },

  /**
   * Finds all items in a cart, joining with food details.
   */
  findByCartId: async (cartId) => {
    const [rows] = await pool.execute(
      `SELECT ci.*, f.name AS food_name, f.price AS food_price, 
              f.image_url AS food_image_url, f.status AS food_status, 
              f.quantity AS food_stock
       FROM cart_items ci
       JOIN foods f ON ci.food_id = f.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );
    return rows;
  },

  /**
   * Clears all items in a cart.
   */
  clearCart: async (cartId) => {
    await pool.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  },

  /**
   * Counts the total number of items (sum of quantities) in a cart.
   */
  countItems: async (cartId) => {
    const [rows] = await pool.execute(
      'SELECT COALESCE(SUM(quantity), 0) AS total_items FROM cart_items WHERE cart_id = ?',
      [cartId]
    );
    return rows[0].total_items;
  },
  
  /**
   * Finds a specific cart item by ID.
   */
  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT ci.*, c.user_id FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ?`,
      [id]
    );
    return rows[0] || null;
  }
};

module.exports = CartItem;
