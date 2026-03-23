const { pool } = require('../../database/connection');

const createShare = async (userId, postId, sharedPostId) => {
  const [result] = await pool.query(
    'INSERT INTO post_shares (user_id, post_id, shared_post_id) VALUES (?, ?, ?)',
    [userId, postId, sharedPostId || null]
  );
  return result.insertId;
};

const getPostShares = async (postId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT ps.*, u.username, u.profile_photo_url, u.user_type
     FROM post_shares ps JOIN users u ON ps.user_id = u.id
     WHERE ps.post_id = ? ORDER BY ps.created_at DESC LIMIT ? OFFSET ?`,
    [postId, limit, offset]
  );
  return rows;
};

module.exports = { createShare, getPostShares };
