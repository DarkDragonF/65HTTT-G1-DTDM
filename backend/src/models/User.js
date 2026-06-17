const { pool } = require('../config/db');

/**
 * User model — direct database operations on the `users` table.
 * No ORM; uses raw SQL with parameterized queries for security.
 */
const User = {
  /**
   * Creates a new user in the database.
   * @param {Object} params
   * @param {string} params.fullName - User's full name
   * @param {string} params.email - User's email address
   * @param {string} params.passwordHash - Bcrypt-hashed password
   * @param {string} [params.phone] - User's phone number
   * @param {string} [params.role] - User's role (defaults to 'student')
   * @returns {Promise<number>} The inserted user's ID
   */
  create: async ({ fullName, email, passwordHash, phone, role }) => {
    const [result] = await pool.execute(
      `INSERT INTO users (full_name, email, password_hash, phone, role)
       VALUES (?, ?, ?, ?, ?)`,
      [fullName, email, passwordHash, phone || null, role || 'student']
    );
    return result.insertId;
  },

  /**
   * Finds a user by their email address (includes password_hash for auth).
   * @param {string} email - Email to search for
   * @returns {Promise<Object|null>} The user record or null
   */
  findByEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Finds a user by their ID (excludes password_hash for safety).
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} The user record (without password) or null
   */
  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT id, full_name, email, phone, role, is_verified, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Updates the email verification status of a user.
   * @param {number} id - User ID
   * @param {boolean} isVerified - New verification status
   * @returns {Promise<void>}
   */
  updateVerificationStatus: async (id, isVerified) => {
    await pool.execute(
      'UPDATE users SET is_verified = ? WHERE id = ?',
      [isVerified, id]
    );
  },
};

module.exports = User;
