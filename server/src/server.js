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

    // ── Keep Render free-tier alive ─────────────────────────────────────────
    // Render sleeps after 15 min of inactivity. We self-ping every 13 min.
    // CRITICAL: RENDER_EXTERNAL_URL is https:// — http.get silently fails on it,
    // which is why the old code did nothing. Always pick the right module.
    if (config.NODE_ENV === 'production') {
      const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
      const requester = SELF_URL.startsWith('https') ? require('https') : http;
      let failStreak = 0;
      let retryTimer = null;

      const pingHealth = () => {
        clearTimeout(retryTimer);
        const req = requester.get(
          `${SELF_URL}/api/health`,
          { timeout: 10000 },
          (res) => {
            res.resume();
            failStreak = 0;
            console.log(`[keep-alive] ✓ ${new Date().toISOString()}`);
          }
        );
        req.on('timeout', () => req.destroy());
        req.on('error', (err) => {
          failStreak++;
          console.warn(`[keep-alive] ✗ streak=${failStreak} — ${err.message}`);
          // Retry after 2 min on failure (up to 3 times before next scheduled ping)
          if (failStreak <= 3) {
            retryTimer = setTimeout(pingHealth, 2 * 60 * 1000);
          }
        });
      };

      // Warmup: first ping 30 s after startup so DB pool is ready
      setTimeout(pingHealth, 30 * 1000);
      // Heartbeat: every 13 min (2-min safety margin before Render's 15-min cutoff)
      setInterval(pingHealth, 13 * 60 * 1000);

      console.log(`  💓 Keep-alive → ${SELF_URL}/api/health every 13 min`);
    }
  });
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err?.message || err);
  try { require('./middleware/trace.middleware').recordProcessError('unhandledRejection', err); } catch (_) {}
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  try { require('./middleware/trace.middleware').recordProcessError('uncaughtException', err); } catch (_) {}
  server.close(() => process.exit(1));
});

startServer();
