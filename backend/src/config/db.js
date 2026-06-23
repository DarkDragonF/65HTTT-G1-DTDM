const mysql = require('mysql2/promise');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = require('./env');


/**
 * MySQL connection pool using promise-based API.
 * Connections are lazily created and reused across requests.
 */
const poolConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// If DB_HOST starts with '/' it is treated as a Unix socket path (e.g. for Google Cloud SQL)
if (DB_HOST && DB_HOST.startsWith('/')) {
  poolConfig.socketPath = DB_HOST;
} else {
  poolConfig.host = DB_HOST;
  poolConfig.port = DB_PORT;
}

const pool = mysql.createPool(poolConfig);

/**
 * Tests the database connection by executing a simple query.
 * @returns {Promise<void>}
 * @throws {Error} If the connection fails
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

module.exports = { pool, testConnection };