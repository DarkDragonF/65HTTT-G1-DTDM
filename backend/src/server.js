const app = require('./app');
const { PORT } = require('./config/env');
const { testConnection } = require('./config/db');
const { ensureUploadDirs } = require('./utils/storage');

/**
 * Starts the Express server after verifying the database connection.
 */
const startServer = async () => {
  try {
    // Test database connection before starting the server
    await testConnection();

    // Ensure upload directories exist
    ensureUploadDirs();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API base URL: http://localhost:${PORT}/api`);
      console.log(`🔐 Auth:       /api/auth`);
      console.log(`🏪 Canteens:   /api/canteens`);
      console.log(`🍕 Foods:      /api/foods`);
      console.log(`📦 Orders:     /api/orders`);
      console.log(`📂 Categories: /api/categories`);
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
