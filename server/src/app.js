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

// Import routes
const routes = require('./routes/index');

const app = express();

// ======================== CORS — must be first, before helmet ========================
const ALLOWED_ORIGINS = [
  'https://syllabrix.com',
  'https://www.syllabrix.com',
  'http://localhost:3000',
  'http://localhost:3001',
  config.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // No origin = mobile app / Postman / server-to-server — allow
    if (!origin) return callback(null, true);
    // Vercel preview deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Deny — return false (not an Error) so Express sends a clean 403, not a 500
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // Some browsers (IE11) choke on 204
};

// Handle preflight for ALL routes before any other middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

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
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Syllabrix API is running',
    environment: config.NODE_ENV,
    version: '1.0.0',
    phase: 1,
    timestamp: new Date().toISOString(),
  });
});

// ======================== API ROUTES ========================
app.use('/api', routes);

// ======================== ERROR HANDLING ========================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
