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

// ======================== SECURITY ========================
app.use(helmet());

// ======================== CORS ========================
const ALLOWED_ORIGINS = [
  'https://syllabrix.com',
  'https://www.syllabrix.com',
  config.CLIENT_URL,                     // from Railway env var (Vercel URL)
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any Vercel preview deployment for this project
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
