const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { socialPool: pool } = require('../database/connection');

/**
 * Middleware to restrict access to Syllabrix Admins only.
 * Checks both user_type/admin_role and mandatory 2FA session status.
 * Rejects short-lived pre-2FA tokens — those are only valid for /2fa/verify.
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT.SECRET);

    // Reject pre-2FA tokens — they are only valid for the /2fa/verify endpoint
    if (decoded.pre_2fa) {
      return res.status(403).json({ error: 'Complete 2FA verification before accessing admin resources', code: '2FA_REQUIRED' });
    }

    const [users] = await pool.query(
      'SELECT id, username, user_type, admin_role, is_2fa_enabled FROM users WHERE id = ? AND is_active = 1',
      [decoded.userId]
    );

    const user = users[0];
    if (!user || (user.user_type !== 'syllabrix_admin' && !user.admin_role)) {
      return res.status(403).json({ error: 'Access denied: Syllabrix Admin role required' });
    }

    if (user.is_2fa_enabled && !decoded.is_2fa_verified) {
      return res.status(403).json({ error: '2FA verification required', code: '2FA_REQUIRED' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin Auth Error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
};

/**
 * Lighter middleware for 2FA setup/verify routes only.
 * Accepts both regular admin tokens (no 2FA yet) and pre-2FA tokens (login challenge).
 * Does NOT enforce the is_2fa_verified gate — that's the whole point of these routes.
 */
const authenticateAdminFor2FA = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT.SECRET);

    const [users] = await pool.query(
      'SELECT id, username, user_type, admin_role, is_2fa_enabled FROM users WHERE id = ? AND is_active = 1',
      [decoded.userId]
    );

    const user = users[0];
    if (!user || (user.user_type !== 'syllabrix_admin' && !user.admin_role)) {
      return res.status(403).json({ error: 'Access denied: Syllabrix Admin role required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin 2FA Auth Error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
};

/**
 * Optional: Level-specific RBAC (Super Admin vs Moderator)
 */
const requireAdminRole = (requiredRoles = []) => (req, res, next) => {
  if (!req.user || !req.user.admin_role) {
    return res.status(403).json({ error: 'Admin identity lost during processing' });
  }

  if (req.user.admin_role === 'super_admin') return next();

  if (!requiredRoles.includes(req.user.admin_role)) {
    return res.status(403).json({ 
      error: `Access denied: Requires one of these roles: ${requiredRoles.join(', ')}` 
    });
  }

  next();
};

module.exports = { authenticateAdmin, authenticateAdminFor2FA, requireAdminRole };
