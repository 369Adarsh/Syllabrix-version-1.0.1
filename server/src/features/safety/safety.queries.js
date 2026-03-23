const { pool } = require('../../database/connection');

// BLOCKS
const blockUser = async (blockerId, blockedId) => {
  await pool.query('INSERT INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?)', [blockerId, blockedId]);
  // Also unfollow both directions
  await pool.query('DELETE FROM follows WHERE (follower_id = ? AND following_id = ?) OR (follower_id = ? AND following_id = ?)',
    [blockerId, blockedId, blockedId, blockerId]);
};

const unblockUser = async (blockerId, blockedId) => {
  await pool.query('DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?', [blockerId, blockedId]);
};

const isBlocked = async (userId1, userId2) => {
  const [rows] = await pool.query(
    'SELECT id FROM user_blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
    [userId1, userId2, userId2, userId1]
  );
  return rows.length > 0;
};

const getBlockedUsers = async (userId) => {
  const [rows] = await pool.query(
    `SELECT ub.*, u.username, u.profile_photo_url, u.user_type
     FROM user_blocks ub JOIN users u ON ub.blocked_id = u.id
     WHERE ub.blocker_id = ? ORDER BY ub.created_at DESC`, [userId]
  );
  return rows;
};

// REPORTS
const createReport = async (d) => {
  const [r] = await pool.query(
    `INSERT INTO reports (reporter_id, reported_user_id, reported_post_id,
     reported_comment_id, reported_message_id, reason, description)
     VALUES (?,?,?,?,?,?,?)`,
    [d.reporter_id, d.reported_user_id||null, d.reported_post_id||null,
     d.reported_comment_id||null, d.reported_message_id||null, d.reason, d.description||null]
  );
  return r.insertId;
};

const getUserReports = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM reports WHERE reporter_id = ? ORDER BY created_at DESC', [userId]
  );
  return rows;
};

module.exports = { blockUser, unblockUser, isBlocked, getBlockedUsers, createReport, getUserReports };
