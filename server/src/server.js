// ============================================================
// Syllabrix Server Entry Point
// HTTP server + Socket.io initialization
// ============================================================

// Syllabrix Server Core — Deployment Trigger: v2026.04.09.2
const http = require('http');
const app = require('./app');
const config = require('./config/env');
const { testConnection } = require('./database/connection');
const { initializeSocket } = require('./socket/index');

const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

const startServer = async () => {
  console.log('');
  console.log('========================================');
  console.log('  Syllabrix API Server');
  console.log('========================================');
  console.log('');

  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('  WARNING: Database not connected. Some features will not work.');
  }

  const PORT = config.SERVER_PORT;
  server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log(`  🚀 Server synchronized on 0.0.0.0:${PORT}`);
    console.log(`  🌍 Public Health Check: ${PORT}/api/health`);
    console.log(`  🔧 Environment: ${config.NODE_ENV}`);
    console.log(`  📦 Build Context: ROOT`);
    console.log('');
    console.log('  Ready to accept intelligence requests.');
    console.log('========================================');
  });
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  server.close(() => process.exit(1));
});

startServer();
