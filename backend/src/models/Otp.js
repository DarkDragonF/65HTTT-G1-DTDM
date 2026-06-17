const { pool } = require('../config/db');

/**
 * OTP model — manages one-time password codes in the `otp_codes` table.
 */
const Otp = {
  /**
   * Creates a new OTP code, invalidating any previous unused OTPs
   * for the same user and type.
   * @param {Object} params
   * @param {number} params.userId - The user ID
   * @param {string} params.code - The 6-digit OTP code
   * @param {string} params.type - OTP type ('email_verification' or 'password_reset')
   * @param {Date} params.expiresAt - When the OTP expires
   * @returns {Promise<number>} The inserted OTP record's ID
   */
  create: async ({ userId, code, type, expiresAt }) => {
    // Invalidate any previous unused OTPs for the same user and type
    await pool.execute(
      `UPDATE otp_codes SET is_used = TRUE
       WHERE user_id = ? AND type = ? AND is_used = FALSE`,
      [userId, type]
    );

    const [result] = await pool.execute(
      `INSERT INTO otp_codes (user_id, code, type, expires_at)
       VALUES (?, ?, ?, ?)`,
      [userId, code, type, expiresAt]
    );
    return result.insertId;
  },

  /**
   * Finds a valid (unused and not expired) OTP for a given user.
   * @param {number} userId - The user ID
   * @param {string} code - The OTP code to validate
   * @param {string} type - The OTP type
   * @returns {Promise<Object|null>} The OTP record or null
   */
  findValid: async (userId, code, type) => {
    const [rows] = await pool.execute(
      `SELECT * FROM otp_codes
       WHERE user_id = ? AND code = ? AND type = ? AND is_used = FALSE AND expires_at > NOW()`,
      [userId, code, type]
    );
    return rows[0] || null;
  },

  /**
   * Marks an OTP as used so it cannot be reused.
   * @param {number} id - The OTP record ID
   * @returns {Promise<void>}
   */
  markUsed: async (id) => {
    await pool.execute(
      'UPDATE otp_codes SET is_used = TRUE WHERE id = ?',
      [id]
    );
  },
};

module.exports = Otp;
