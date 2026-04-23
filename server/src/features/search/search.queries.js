const { pool } = require('../../database/connection');

const searchUsers = async (query, userType, limit, offset) => {
  let where = 'u.is_active = 1';
  const vals = [];
  if (query) {
    where += ' AND (u.username LIKE ? OR u.bio LIKE ? OR u.city LIKE ?)';
    vals.push('%'+query+'%', '%'+query+'%', '%'+query+'%');
  }
  if (userType) { where += ' AND u.user_type = ?'; vals.push(userType); }
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.user_type, u.profile_photo_url, u.bio, u.is_verified,
            u.city, u.state,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count
     FROM users u WHERE ${where} ORDER BY u.is_verified DESC, followers_count DESC
     LIMIT ? OFFSET ?`, [...vals, limit, offset]
  );
  const [cnt] = await pool.query(`SELECT COUNT(*) as total FROM users u WHERE ${where}`, vals);
  return { users: rows, total: cnt[0].total };
};

const searchPosts = async (query, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT p.*, u.username, u.profile_photo_url, u.user_type
     FROM posts p JOIN users u ON p.user_id = u.id
     WHERE p.is_active = 1 AND p.visibility = 'public' AND p.content LIKE ?
     ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    ['%'+query+'%', limit, offset]
  );
  const [cnt] = await pool.query(
    "SELECT COUNT(*) as total FROM posts WHERE is_active = 1 AND visibility = 'public' AND content LIKE ?",
    ['%'+query+'%']
  );
  return { posts: rows, total: cnt[0].total };
};

const searchHashtags = async (query, limit) => {
  const [rows] = await pool.query(
    'SELECT * FROM hashtags WHERE tag LIKE ? ORDER BY post_count DESC LIMIT ?',
    ['%'+query+'%', limit]
  );
  return rows;
};

const getTrendingHashtags = async (limit) => {
  const [rows] = await pool.query(
    'SELECT * FROM hashtags ORDER BY post_count DESC LIMIT ?', [limit]
  );
  return rows;
};

const saveSearchHistory = async (userId, query, resultType) => {
  await pool.query(
    'INSERT INTO search_history (user_id, query, result_type) VALUES (?, ?, ?)',
    [userId, query, resultType||null]
  );
};

const getSearchHistory = async (userId, limit) => {
  const [rows] = await pool.query(
    'SELECT DISTINCT query, result_type, MAX(created_at) as last_searched FROM search_history WHERE user_id = ? GROUP BY query, result_type ORDER BY last_searched DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
};

const clearSearchHistory = async (userId) => {
  await pool.query('DELETE FROM search_history WHERE user_id = ?', [userId]);
};

module.exports = { searchUsers, searchPosts, searchHashtags, getTrendingHashtags, saveSearchHistory, getSearchHistory, clearSearchHistory };
