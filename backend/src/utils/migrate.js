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
        role ENUM('student', 'lecturer', 'canteen_owner', 'delivery_staff', 'admin', 'super_admin') DEFAULT 'student',
        is_verified BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'suspended') DEFAULT 'active',
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

    // ─── 4. Create canteens table ───────────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS canteens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        address VARCHAR(255),
        description TEXT,
        phone VARCHAR(20),
        opening_hours VARCHAR(100),
        logo_url VARCHAR(500),
        status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_owner_id (owner_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Table "canteens" created successfully');

    // ─── 5. Create food_categories table ────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS food_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255),
        icon VARCHAR(50),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "food_categories" created successfully');

    // ─── 6. Create foods table ──────────────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS foods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        canteen_id INT NOT NULL,
        category_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        quantity INT DEFAULT 0,
        image_url VARCHAR(500),
        status ENUM('available', 'unavailable', 'deleted') DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES food_categories(id),
        INDEX idx_canteen_id (canteen_id),
        INDEX idx_category_id (category_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Table "foods" created successfully');

    // ─── 7. Create orders table ─────────────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(20) UNIQUE,
        user_id INT NOT NULL,
        canteen_id INT NOT NULL,
        delivery_staff_id INT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'preparing', 'ready_for_pickup',
                    'delivering', 'completed', 'cancelled') DEFAULT 'pending',
        note TEXT,
        cancelled_by ENUM('student', 'canteen', 'admin') NULL,
        cancel_reason VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (canteen_id) REFERENCES canteens(id),
        FOREIGN KEY (delivery_staff_id) REFERENCES users(id),
        INDEX idx_user_id (user_id),
        INDEX idx_canteen_id (canteen_id),
        INDEX idx_delivery_staff_id (delivery_staff_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Table "orders" created successfully');

    // Run ALTER queries for existing table columns if they do not exist
    const [colsOrderNum] = await pool.execute("SHOW COLUMNS FROM orders LIKE 'order_number'");
    if (colsOrderNum.length === 0) {
      await pool.execute("ALTER TABLE orders ADD COLUMN order_number VARCHAR(20) UNIQUE AFTER id");
      console.log('✅ Column "order_number" added to "orders"');
    }

    const [colsDelivStaff] = await pool.execute("SHOW COLUMNS FROM orders LIKE 'delivery_staff_id'");
    if (colsDelivStaff.length === 0) {
      await pool.execute("ALTER TABLE orders ADD COLUMN delivery_staff_id INT NULL AFTER canteen_id");
      await pool.execute("ALTER TABLE orders ADD CONSTRAINT fk_orders_delivery_staff FOREIGN KEY (delivery_staff_id) REFERENCES users(id)");
      console.log('✅ Column "delivery_staff_id" added to "orders"');
    }

    // Alter user role to include super_admin
    await pool.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('student', 'lecturer', 'canteen_owner', 'delivery_staff', 'admin', 'super_admin') DEFAULT 'student'
    `);
    console.log('✅ Column "role" in "users" updated to include "super_admin"');

    // Add status column to users if not exists
    const [colsStatus] = await pool.execute("SHOW COLUMNS FROM users LIKE 'status'");
    if (colsStatus.length === 0) {
      await pool.execute("ALTER TABLE users ADD COLUMN status ENUM('active', 'suspended') DEFAULT 'active' AFTER is_verified");
      console.log('✅ Column "status" added to "users"');
    }

    // ─── 8. Create order_items table ────────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        food_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id),
        INDEX idx_order_id (order_id)
      )
    `);
    console.log('✅ Table "order_items" created successfully');

    // ─── 8b. Create carts table ──────────────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        canteen_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE,
        UNIQUE KEY uk_user_canteen (user_id, canteen_id),
        INDEX idx_user_id (user_id)
      )
    `);
    console.log('✅ Table "carts" created successfully');

    // ─── 8c. Create cart_items table ─────────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cart_id INT NOT NULL,
        food_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
        UNIQUE KEY uk_cart_food (cart_id, food_id),
        INDEX idx_cart_id (cart_id)
      )
    `);
    console.log('✅ Table "cart_items" created successfully');

    // ─── 8d. Create order_status_logs table ──────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS order_status_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        from_status VARCHAR(30),
        to_status VARCHAR(30) NOT NULL,
        changed_by INT NOT NULL,
        note VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id),
        INDEX idx_order_id (order_id)
      )
    `);
    console.log('✅ Table "order_status_logs" created successfully');

    // ─── 8e. Create notifications table ──────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('order_created', 'order_confirmed', 'order_rejected',
                  'order_preparing', 'order_ready_for_pickup', 'order_delivering', 
                  'order_completed', 'order_cancelled', 'system', 'inventory_warning') NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        reference_id INT,
        reference_type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Table "notifications" created successfully');

    // ─── 8f. Create permissions table ────────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "permissions" created successfully');

    // ─── 8g. Create role_permissions table ────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        permission_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE KEY uk_role_permission (role, permission_id)
      )
    `);
    console.log('✅ Table "role_permissions" created successfully');

    // ─── 8h. Create audit_logs table ─────────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id INT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent VARCHAR(255) NULL,
        details TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Table "audit_logs" created successfully');

    // ─── 8i. Create contracts table ──────────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        canteen_id INT NOT NULL,
        contract_number VARCHAR(50) UNIQUE NOT NULL,
        status ENUM('draft', 'sent', 'signed', 'voided') DEFAULT 'sent',
        file_url VARCHAR(500) NULL,
        signed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table "contracts" created successfully');

    // ─── 8j. Create support_tickets table ────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT NULL,
        subject VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        status ENUM('open', 'in_progress', 'resolved', 'escalated') DEFAULT 'open',
        assigned_to INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table "support_tickets" created successfully');

    // ─── 8k. Create support_ticket_comments table ─────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS support_ticket_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table "support_ticket_comments" created successfully');

    // ─── 8l. Create delivery_staff_profiles table ─────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS delivery_staff_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        total_deliveries INT DEFAULT 0,
        completed_deliveries INT DEFAULT 0,
        cancelled_deliveries INT DEFAULT 0,
        average_delivery_time_mins INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table "delivery_staff_profiles" created successfully');

    // ─── 8m. Create analytics_snapshots table ────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS analytics_snapshots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        snapshot_date DATE NOT NULL UNIQUE,
        total_orders INT DEFAULT 0,
        total_revenue DECIMAL(10,2) DEFAULT 0.00,
        daily_active_users INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "analytics_snapshots" created successfully');

    // ─── 8n. Create platform_settings table ──────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        description VARCHAR(255) NULL,
        updated_by INT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table "platform_settings" created successfully');

    // ─── 8o. Create system_metrics table ──────────────────────────────────
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        metric_name VARCHAR(100) NOT NULL,
        value DOUBLE NOT NULL,
        unit VARCHAR(20) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "system_metrics" created successfully');

    // ─── 9. Seed admin user ─────────────────────────────────────────────
    const adminEmail = 'admin@tlufood.com';
    const adminPassword = 'Admin@1234';
    const adminPasswordHash = await hashPassword(adminPassword);

    await pool.execute(
      `INSERT IGNORE INTO users (full_name, email, password_hash, phone, role, is_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Admin', adminEmail, adminPasswordHash, null, 'admin', true]
    );
    console.log('✅ Admin user seeded (admin@tlufood.com)');

    // ─── 10. Seed food categories ───────────────────────────────────────
    const categories = [
      ['Rice', 'Rice dishes', '🍚', 1],
      ['Noodles', 'Noodle dishes', '🍜', 2],
      ['Drinks', 'Beverages', '🥤', 3],
      ['Snacks', 'Light snacks', '🍿', 4],
      ['Fast Food', 'Quick meals', '🍔', 5],
    ];
    for (const [name, desc, icon, order] of categories) {
      await pool.execute(
        'INSERT IGNORE INTO food_categories (name, description, icon, sort_order) VALUES (?, ?, ?, ?)',
        [name, desc, icon, order]
      );
    }
    console.log('✅ Food categories seeded');

    // ─── 11. Seed permissions ───────────────────────────────────────────
    const permissions = [
      ['view_dashboard', 'View dashboard and statistics'],
      ['manage_users', 'View, lock/unlock, suspend/restore users'],
      ['manage_canteens', 'Approve, reject, or suspend canteens'],
      ['manage_delivery', 'View delivery staff performance and assign orders'],
      ['manage_orders', 'View, track, and cancel orders'],
      ['manage_settings', 'Modify system-wide settings'],
      ['manage_support', 'Respond to support tickets and disputes'],
      ['view_audit_logs', 'Access system security logs'],
      ['manage_security', 'Super admin secrets and settings configuration']
    ];

    for (const [name, desc] of permissions) {
      await pool.execute(
        'INSERT IGNORE INTO permissions (name, description) VALUES (?, ?)',
        [name, desc]
      );
    }
    console.log('✅ Permissions seeded');

    // Get all seeded permissions to map IDs
    const [permRows] = await pool.execute('SELECT id, name FROM permissions');
    const permMap = permRows.reduce((acc, row) => {
      acc[row.name] = row.id;
      return acc;
    }, {});

    // Role mappings
    const adminPermissions = [
      'view_dashboard', 'manage_users', 'manage_canteens', 
      'manage_delivery', 'manage_orders', 'manage_settings', 
      'manage_support', 'view_audit_logs'
    ];
    const superAdminPermissions = [...adminPermissions, 'manage_security'];

    for (const permName of adminPermissions) {
      const permId = permMap[permName];
      if (permId) {
        await pool.execute(
          'INSERT IGNORE INTO role_permissions (role, permission_id) VALUES (?, ?)',
          ['admin', permId]
        );
      }
    }
    for (const permName of superAdminPermissions) {
      const permId = permMap[permName];
      if (permId) {
        await pool.execute(
          'INSERT IGNORE INTO role_permissions (role, permission_id) VALUES (?, ?)',
          ['super_admin', permId]
        );
      }
    }
    console.log('✅ Role permissions seeded');

    // ─── 12. Seed default platform settings ─────────────────────────────
    const defaultSettings = [
      ['platform_name', 'TLU Food', 'The public facing name of the food portal'],
      ['contact_email', 'support@tlufood.com', 'System support email contact address'],
      ['order_auto_assign', 'true', 'Enable automatic order assignments to delivery staff'],
      ['delivery_fee', '10000', 'Flat-rate delivery fee in VND']
    ];
    for (const [key, val, desc] of defaultSettings) {
      await pool.execute(
        'INSERT IGNORE INTO platform_settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
        [key, val, desc]
      );
    }
    console.log('✅ Platform settings seeded');

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
