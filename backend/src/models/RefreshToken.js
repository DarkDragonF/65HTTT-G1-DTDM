const { pool } = require('../config/db');

/**
 * RefreshToken model — manages refresh tokens in the `refresh_tokens` table.
 */
const RefreshToken = {
  /**
   * Stores a new refresh token in the database.
   * @param {Object} params
   * @param {number} params.userId - The user ID this token belongs to
   * @param {string} params.token - The JWT refresh token string
   * @param {Date} params.expiresAt - Token expiration timestamp
   * @returns {Promise<number>} The inserted record's ID
   */
  create: async ({ userId, token, expiresAt }) => {
    const [result] = await pool.execute(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [userId, token, expiresAt]
    );
    return result.insertId;
  },

  /**
   * Finds a refresh token record by its token string.
   * @param {string} token - The refresh token to look up
   * @returns {Promise<Object|null>} The token record or null
   */
  findByToken: async (token) => {
    const [rows] = await pool.execute(
      'SELECT * FROM refresh_tokens WHERE token = ?',
      [token]
    );
    return rows[0] || null;
  },

  /**
   * Deletes all refresh tokens belonging to a specific user.
   * Used during logout to invalidate all sessions.
   * @param {number} userId - The user ID
   * @returns {Promise<void>}
   */
  deleteByUserId: async (userId) => {
    await pool.execute(
      'DELETE FROM refresh_tokens WHERE user_id = ?',
      [userId]
    );
  },

  /**
   * Removes all expired refresh tokens from the database.
   * Should be called periodically for cleanup.
   * @returns {Promise<number>} Number of deleted records
   */
  deleteExpired: async () => {
    const [result] = await pool.execute(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );
    return result.affectedRows;
  },
};

module.exports = RefreshToken;
