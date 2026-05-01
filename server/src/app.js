// ============================================================
// Syllabrix Express Application
// Central app configuration — middleware stack, routes, error handling
// ============================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');

// Import middleware
const { errorHandler } = require('./middleware/error-handler.middleware');
const { notFoundHandler } = require('./middleware/not-found.middleware');
const { requestLogger } = require('./middleware/request-logger.middleware');
const { traceMiddleware } = require('./middleware/trace.middleware');

// Import routes
const routes = require('./routes/index');
const { socialPool, ldPool } = require('./database/connection');

const app = express();

// Trust Render/Vercel reverse proxy so rate limiters use the real client IP
app.set('trust proxy', 1);

// ======================== CORS — absolute first middleware ========================
// Manually set headers as a safety net in case Railway's edge proxy strips them.
// This runs before cors(), helmet(), rate-limiter — everything.
const ALLOWED_ORIGINS = [
  'https://syllabrix.com',
  'https://www.syllabrix.com',
  'http://localhost:3000',
  'http://localhost:3001',
  config.CLIENT_URL,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed =
    !origin ||
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith('.vercel.app');

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }

  // Respond immediately to preflight — no other middleware needed
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ======================== SECURITY ========================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ======================== BODY PARSING ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================== LOGGING ========================
if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(requestLogger);
app.use(traceMiddleware);

// ======================== RATE LIMITING ========================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === 'development' ? 1000 : 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ======================== HEALTH CHECK ========================
// Also warms up both DB pools on cold-start so auth works immediately after wake.
app.get('/api/health', async (req, res) => {
  const [social, ld] = await Promise.allSettled([
    socialPool.query('SELECT 1'),
    ldPool.query('SELECT 1'),
  ]);
  res.status(200).json({
    success: true,
    message: 'Syllabrix API is running',
    environment: config.NODE_ENV,
    version: '1.0.0',
    db: { social: social.status === 'fulfilled', ld: ld.status === 'fulfilled' },
    timestamp: new Date().toISOString(),
  });
});

// ======================== API ROUTES ========================
app.use('/api', routes);

// ======================== ERROR HANDLING ========================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
