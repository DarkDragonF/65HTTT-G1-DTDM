const { pool } = require('../config/db');
const { hashPassword } = require('./hash');

/**
 * Database migration script.
 * Creates all required tables and seeds the default admin user.
 * Run with: node src/utils/migrate.js
 */
const migrate = async () => {
  console.log('🚀 Starting database migration...\n');

  try {
    // ─── 1. Create users table ──────────────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('student', 'lecturer', 'canteen_owner', 'delivery_staff', 'admin') DEFAULT 'student',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "users" created successfully');

    // ─── 2. Create refresh_tokens table ─────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table "refresh_tokens" created successfully');

    // ─── 3. Create otp_codes table ──────────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        code VARCHAR(6) NOT NULL,
        type ENUM('email_verification', 'password_reset') DEFAULT 'email_verification',
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table "otp_codes" created successfully');

    // ─── 4. Seed admin user ─────────────────────────────────────────────
    const adminEmail = 'admin@tlufood.com';
    const adminPassword = 'Admin@1234';
    const adminPasswordHash = await hashPassword(adminPassword);

    await pool.execute(
      `INSERT IGNORE INTO users (full_name, email, password_hash, phone, role, is_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Admin', adminEmail, adminPasswordHash, null, 'admin', true]
    );
    console.log('✅ Admin user seeded (admin@tlufood.com)');

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
};

migrate();
