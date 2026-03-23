const rateLimit = require('express-rate-limit');
const config = require('./env');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.NODE_ENV === 'development' ? 1000 : 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.NODE_ENV === 'development' ? 100 : 10,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload rate limit
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: { success: false, message: 'Upload limit reached. Please try again later.' },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };
