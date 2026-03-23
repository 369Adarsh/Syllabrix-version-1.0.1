// Block check middleware
// Prevents interaction between blocked users
const { pool } = require('../database/connection');

const checkNotBlocked = async (req, res, next) => {
  if (!req.user) return next();

  // Get target user ID from params or body
  const targetUserId = req.params.userId || req.body.receiver_id || req.body.user_id;

  if (!targetUserId || parseInt(targetUserId) === req.user.id) {
    return next();
  }

  try {
    const [blocks] = await pool.query(
      `SELECT id FROM user_blocks
       WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)`,
      [req.user.id, targetUserId, targetUserId, req.user.id]
    );

    if (blocks.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'You cannot interact with this user.',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkNotBlocked };
