// Guardian verification middleware
// Ensures young users have a linked and approved guardian

const { pool } = require('../database/connection');

const requireGuardian = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const guardianRequired = ['5-7', '8-10', '11-13'].includes(req.user.ageGroup);

  if (!guardianRequired) {
    return next();
  }

  // Check if user has an approved guardian link
  const [links] = await pool.query(
    'SELECT id FROM parent_child_links WHERE child_user_id = ? AND status = ?',
    [req.user.id, 'active']
  );

  if (links.length === 0) {
    return res.status(403).json({
      success: false,
      message: 'A parent/guardian must be linked to your account to use this feature.',
      requiresGuardian: true,
    });
  }

  next();
};

module.exports = { requireGuardian };
