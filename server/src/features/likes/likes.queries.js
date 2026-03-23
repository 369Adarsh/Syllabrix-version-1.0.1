const { pool } = require('../../database/connection');

const addLike = async (userId, postId, reactionType) => {
  const [result] = await pool.query(
    'INSERT INTO post_likes (user_id, post_id, reaction_type) VALUES (?, ?, ?)',
    [userId, postId, reactionType || 'like']
  );
  return result.insertId;
};

const removeLike = async (userId, postId) => {
  const [result] = await pool.query(
    'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?',
    [userId, postId]
  );
  return result.affectedRows > 0;
};

const getUserLike = async (userId, postId) => {
  const [rows] = await pool.query(
    'SELECT * FROM post_likes WHERE user_id = ? AND post_id = ? LIMIT 1',
    [userId, postId]
  );
  return rows[0] || null;
};

const getPostLikes = async (postId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT pl.*, u.username, u.profile_photo_url, u.user_type
     FROM post_likes pl JOIN users u ON pl.user_id = u.id
     WHERE pl.post_id = ? ORDER BY pl.created_at DESC LIMIT ? OFFSET ?`,
    [postId, limit, offset]
  );
  return rows;
};

const getPostLikesCount = async (postId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM post_likes WHERE post_id = ?', [postId]
  );
  return rows[0].total;
};

module.exports = { addLike, removeLike, getUserLike, getPostLikes, getPostLikesCount };
