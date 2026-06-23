const { pool } = require('../config/db');

/**
 * Canteen model — direct database operations on the `canteens` table.
 * No ORM; uses raw SQL with parameterized queries for security.
 */
const Canteen = {
  /**
   * Creates a new canteen.
   * @param {Object} params
   * @param {number} params.ownerId - Owner user ID
   * @param {string} params.name - Canteen name
   * @param {string} [params.address] - Canteen address
   * @param {string} [params.description] - Canteen description
   * @param {string} [params.phone] - Contact phone
   * @param {string} [params.openingHours] - Opening hours
   * @param {string} [params.logoUrl] - Logo URL
   * @returns {Promise<number>} The inserted canteen's ID
   */
  create: async ({ ownerId, name, address, description, phone, openingHours, logoUrl }) => {
    const [result] = await pool.execute(
      `INSERT INTO canteens (owner_id, name, address, description, phone, opening_hours, logo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ownerId, name, address || null, description || null, phone || null, openingHours || null, logoUrl || null]
    );
    return result.insertId;
  },

  /**
   * Finds a canteen by ID, including owner's full_name.
   * @param {number} id - Canteen ID
   * @returns {Promise<Object|null>} The canteen record or null
   */
  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT c.*, u.full_name AS owner_name
       FROM canteens c
       JOIN users u ON c.owner_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Finds all canteens owned by a specific user.
   * @param {number} ownerId - Owner user ID
   * @returns {Promise<Array>} Array of canteen records
   */
  findByOwnerId: async (ownerId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM canteens WHERE owner_id = ?',
      [ownerId]
    );
    return rows;
  },

  /**
   * Finds all canteens with optional filters and pagination.
   * @param {Object} params
   * @param {string} [params.status] - Filter by status (null = all)
   * @param {string} [params.search] - Search by name
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} { canteens, total, page, limit, totalPages }
   */
  findAll: async ({ status, search, page = 1, limit = 10 }) => {
    let query = 'SELECT c.*, u.full_name AS owner_name FROM canteens c JOIN users u ON c.owner_id = u.id';
    let countQuery = 'SELECT COUNT(*) AS total FROM canteens c';
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('c.name LIKE ?');
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      const where = ' WHERE ' + conditions.join(' AND ');
      query += where;
      countQuery += where;
    }

    // Get total count
    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    const paginatedParams = [...params, String(limit), String(offset)];
    const [rows] = await pool.execute(query, paginatedParams);

    return {
      canteens: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Updates a canteen with only the provided fields.
   * @param {number} id - Canteen ID
   * @param {Object} data - Fields to update
   * @returns {Promise<void>}
   */
  update: async (id, data) => {
    const allowedFields = ['name', 'address', 'description', 'phone', 'opening_hours', 'logo_url'];
    const updates = [];
    const params = [];

    // Map camelCase to snake_case
    const fieldMap = {
      name: 'name',
      address: 'address',
      description: 'description',
      phone: 'phone',
      openingHours: 'opening_hours',
      logoUrl: 'logo_url',
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
      `UPDATE canteens SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  },

  /**
   * Updates canteen status.
   * @param {number} id - Canteen ID
   * @param {string} status - New status ('active', 'inactive', 'pending')
   * @returns {Promise<void>}
   */
  updateStatus: async (id, status) => {
    await pool.execute(
      'UPDATE canteens SET status = ? WHERE id = ?',
      [status, id]
    );
  },

  /**
   * Deletes a canteen.
   * @param {number} id - Canteen ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    await pool.execute('DELETE FROM canteens WHERE id = ?', [id]);
  },

  /**
   * Counts canteens for a specific owner.
   * @param {number} ownerId - Owner user ID
   * @returns {Promise<number>} Count of canteens
   */
  countByOwnerId: async (ownerId) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS count FROM canteens WHERE owner_id = ?',
      [ownerId]
    );
    return rows[0].count;
  },
};

module.exports = Canteen;
