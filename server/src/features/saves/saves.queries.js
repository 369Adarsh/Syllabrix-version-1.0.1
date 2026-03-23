const { pool } = require('../../database/connection');

const toggleSave = async (userId, postId) => {
  const [existing] = await pool.query(
    'SELECT id FROM post_saves WHERE user_id = ? AND post_id = ?', [userId, postId]
  );
  if (existing.length > 0) {
    await pool.query('DELETE FROM post_saves WHERE user_id = ? AND post_id = ?', [userId, postId]);
    return { action: 'unsaved' };
  } else {
    await pool.query('INSERT INTO post_saves (user_id, post_id) VALUES (?, ?)', [userId, postId]);
    return { action: 'saved' };
  }
};

const getSavedPosts = async (userId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT p.*, u.username, u.profile_photo_url, u.user_type, u.is_verified, ps.created_at as saved_at
     FROM post_saves ps
     JOIN posts p ON ps.post_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE ps.user_id = ? AND p.is_active = 1
     ORDER BY ps.created_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows;
};

const getSavedCount = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM post_saves ps JOIN posts p ON ps.post_id = p.id WHERE ps.user_id = ? AND p.is_active = 1',
    [userId]
  );
  return rows[0].total;
};

module.exports = { toggleSave, getSavedPosts, getSavedCount };
