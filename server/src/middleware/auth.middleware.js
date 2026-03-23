// JWT Authentication Middleware
// Verifies token and attaches user to request
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { pool } = require('../database/connection');

const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Get user from database (ensures user still exists and is active)
    const [users] = await pool.query(
      'SELECT id, username, email, user_type, age_group, is_active, is_banned, is_profile_complete, strike_count FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.',
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    if (user.is_banned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned due to policy violations.',
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      userType: user.user_type,
      ageGroup: user.age_group,
      isActive: user.is_active,
      isBanned: user.is_banned,
      isProfileComplete: user.is_profile_complete,
      strikeCount: user.strike_count,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

// Optional auth — attaches user if token present, continues if not
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  return authenticate(req, res, next);
};

module.exports = { authenticate, optionalAuth };
