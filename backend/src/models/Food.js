const { pool } = require('../config/db');

/**
 * Food model — direct database operations on the `foods` table.
 * No ORM; uses raw SQL with parameterized queries for security.
 */
const Food = {
  /**
   * Creates a new food item.
   * @param {Object} params
   * @param {number} params.canteenId - Canteen ID
   * @param {number} params.categoryId - Food category ID
   * @param {string} params.name - Food name
   * @param {string} [params.description] - Food description
   * @param {number} params.price - Food price
   * @param {number} [params.quantity] - Available quantity
   * @param {string} [params.imageUrl] - Image URL
   * @returns {Promise<number>} The inserted food item's ID
   */
  create: async ({ canteenId, categoryId, name, description, price, quantity, imageUrl, zohoItemId }) => {
    const [result] = await pool.execute(
      `INSERT INTO foods (canteen_id, category_id, name, description, price, quantity, image_url, zoho_item_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [canteenId, categoryId, name, description || null, price, quantity || 0, imageUrl || null, zohoItemId || null]
    );
    return result.insertId;
  },

  /**
   * Finds a food item by ID with canteen and category joins.
   * @param {number} id - Food ID
   * @returns {Promise<Object|null>} The food record or null
   */
  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT f.*, c.name AS canteen_name, fc.name AS category_name
       FROM foods f
       JOIN canteens c ON f.canteen_id = c.id
       JOIN food_categories fc ON f.category_id = fc.id
       WHERE f.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Finds foods by canteen ID with optional filters and pagination.
   * @param {number} canteenId - Canteen ID
   * @param {Object} params
   * @param {number} [params.categoryId] - Filter by category
   * @param {string} [params.status] - Filter by status
   * @param {string} [params.search] - Search by name
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} { foods, total, page, limit, totalPages }
   */
  findByCanteenId: async (canteenId, { categoryId, status, search, page = 1, limit = 10 }) => {
    let query = `SELECT f.*, fc.name AS category_name
                 FROM foods f
                 JOIN food_categories fc ON f.category_id = fc.id
                 WHERE f.canteen_id = ?`;
    let countQuery = 'SELECT COUNT(*) AS total FROM foods f WHERE f.canteen_id = ?';
    const params = [canteenId];

    if (categoryId) {
      query += ' AND f.category_id = ?';
      countQuery += ' AND f.category_id = ?';
      params.push(categoryId);
    }

    if (status) {
      query += ' AND f.status = ?';
      countQuery += ' AND f.status = ?';
      params.push(status);
    } else {
      // Exclude deleted by default
      query += " AND f.status != 'deleted'";
      countQuery += " AND f.status != 'deleted'";
    }

    if (search) {
      query += ' AND f.name LIKE ?';
      countQuery += ' AND f.name LIKE ?';
      params.push(`%${search}%`);
    }

    // Get total count
    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
    const paginatedParams = [...params, String(limit), String(offset)];
    const [rows] = await pool.execute(query, paginatedParams);

    return {
      foods: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Finds all available foods with filters (public browse).
   * @param {Object} params
   * @param {number} [params.canteenId] - Filter by canteen
   * @param {number} [params.categoryId] - Filter by category
   * @param {string} [params.search] - Search by name
   * @param {number} [params.minPrice] - Minimum price
   * @param {number} [params.maxPrice] - Maximum price
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} { foods, total, page, limit, totalPages }
   */
  findAll: async ({ canteenId, categoryId, search, minPrice, maxPrice, page = 1, limit = 10 }) => {
    let query = `SELECT f.*, c.name AS canteen_name, fc.name AS category_name
                 FROM foods f
                 JOIN canteens c ON f.canteen_id = c.id
                 JOIN food_categories fc ON f.category_id = fc.id
                 WHERE f.status = 'available' AND c.status = 'active'`;
    let countQuery = `SELECT COUNT(*) AS total FROM foods f
                      JOIN canteens c ON f.canteen_id = c.id
                      WHERE f.status = 'available' AND c.status = 'active'`;
    const params = [];

    if (canteenId) {
      query += ' AND f.canteen_id = ?';
      countQuery += ' AND f.canteen_id = ?';
      params.push(canteenId);
    }

    if (categoryId) {
      query += ' AND f.category_id = ?';
      countQuery += ' AND f.category_id = ?';
      params.push(categoryId);
    }

    if (search) {
      query += ' AND f.name LIKE ?';
      countQuery += ' AND f.name LIKE ?';
      params.push(`%${search}%`);
    }

    if (minPrice) {
      query += ' AND f.price >= ?';
      countQuery += ' AND f.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND f.price <= ?';
      countQuery += ' AND f.price <= ?';
      params.push(maxPrice);
    }

    // Get total count
    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
    const paginatedParams = [...params, String(limit), String(offset)];
    const [rows] = await pool.execute(query, paginatedParams);

    return {
      foods: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Updates a food item with only the provided fields.
   * @param {number} id - Food ID
   * @param {Object} data - Fields to update
   * @returns {Promise<void>}
   */
  update: async (id, data) => {
    const allowedFields = ['name', 'description', 'category_id', 'price', 'quantity', 'image_url', 'zoho_item_id'];
    const updates = [];
    const params = [];

    const fieldMap = {
      name: 'name',
      description: 'description',
      categoryId: 'category_id',
      price: 'price',
      quantity: 'quantity',
      imageUrl: 'image_url',
      zohoItemId: 'zoho_item_id',
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
      `UPDATE foods SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  },

  /**
   * Updates food status.
   * @param {number} id - Food ID
   * @param {string} status - New status ('available', 'unavailable')
   * @returns {Promise<void>}
   */
  updateStatus: async (id, status) => {
    await pool.execute(
      'UPDATE foods SET status = ? WHERE id = ?',
      [status, id]
    );
  },

  /**
   * Soft deletes a food item by setting status to 'deleted'.
   * @param {number} id - Food ID
   * @returns {Promise<void>}
   */
  softDelete: async (id) => {
    await pool.execute(
      "UPDATE foods SET status = 'deleted' WHERE id = ?",
      [id]
    );
  },
};

module.exports = Food;
