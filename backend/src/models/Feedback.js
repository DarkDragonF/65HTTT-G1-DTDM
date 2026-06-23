const { pool } = require('../config/db');

/**
 * Feedback model — raw SQL operations on the `feedbacks` table.
 */
const Feedback = {
  /**
   * Creates a new feedback record.
   * @param {Object} params
   * @param {string} [params.canteenName] - Name of the canteen
   * @param {number} params.rating - Star rating (1-5)
   * @param {string} params.comments - Suggestions/comments text
   * @param {string} [params.userEmail] - Submitter email address
   * @param {string} [params.source] - Submission source ('direct' or 'zoho_forms')
   * @returns {Promise<number>} Inserted record ID
   */
  create: async ({ canteenName, rating, comments, userEmail, source }) => {
    const [result] = await pool.execute(
      `INSERT INTO feedbacks (canteen_name, rating, comments, user_email, source)
       VALUES (?, ?, ?, ?, ?)`,
      [
        canteenName || null,
        rating,
        comments,
        userEmail || null,
        source || 'direct'
      ]
    );
    return result.insertId;
  },

  /**
   * Retrieves all feedback records sorted by newest first.
   * @returns {Promise<Array>} List of feedback records
   */
  findAll: async () => {
    const [rows] = await pool.execute(
      'SELECT id, canteen_name, rating, comments, user_email, source, created_at FROM feedbacks ORDER BY created_at DESC'
    );
    return rows;
  }
};

module.exports = Feedback;
