const { pool } = require('../config/db');

/**
 * FoodCategory model — direct database operations on the `food_categories` table.
 * No ORM; uses raw SQL with parameterized queries for security.
 */
const FoodCategory = {
  /**
   * Creates a new food category.
   * @param {Object} params
   * @param {string} params.name - Category name
   * @param {string} [params.description] - Category description
   * @param {string} [params.icon] - Category icon (emoji)
   * @param {number} [params.sortOrder] - Sort order
   * @returns {Promise<number>} The inserted category's ID
   */
  create: async ({ name, description, icon, sortOrder }) => {
    const [result] = await pool.execute(
      `INSERT INTO food_categories (name, description, icon, sort_order)
       VALUES (?, ?, ?, ?)`,
      [name, description || null, icon || null, sortOrder || 0]
    );
    return result.insertId;
  },

  /**
   * Finds all food categories ordered by sort_order.
   * @returns {Promise<Array>} Array of category records
   */
  findAll: async () => {
    const [rows] = await pool.execute(
      'SELECT * FROM food_categories ORDER BY sort_order ASC'
    );
    return rows;
  },

  /**
   * Finds a food category by ID.
   * @param {number} id - Category ID
   * @returns {Promise<Object|null>} The category record or null
   */
  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM food_categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Updates a food category.
   * @param {number} id - Category ID
   * @param {Object} data - Fields to update
   * @returns {Promise<void>}
   */
  update: async (id, data) => {
    const allowedFields = ['name', 'description', 'icon', 'sort_order'];
    const updates = [];
    const params = [];

    const fieldMap = {
      name: 'name',
      description: 'description',
      icon: 'icon',
      sortOrder: 'sort_order',
    };

    for (const [key, value] of Object.entries(data)) {
      const dbField = fieldMap[key] || key;
      if (allowedFields.includes(dbField)) {
        updates.push(`${dbField} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) return;

    params.push(id);
    await pool.execute(
      `UPDATE food_categories SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  },

  /**
   * Deletes a food category.
   * @param {number} id - Category ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    await pool.execute('DELETE FROM food_categories WHERE id = ?', [id]);
  },
};

module.exports = FoodCategory;
