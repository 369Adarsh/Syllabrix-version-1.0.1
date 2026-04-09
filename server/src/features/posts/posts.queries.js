const { pool } = require('../../database/connection');

const createPost = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO posts (user_id, content, media_url, media_type, media_urls,
                        visibility, group_id, post_type, original_post_id, hashtags, feeling)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.user_id, data.content || null, data.media_url || null,
     data.media_type || 'none', data.media_urls ? JSON.stringify(data.media_urls) : null,
     data.visibility || 'public', data.group_id || null,
     data.post_type || 'regular', data.original_post_id || null,
     data.hashtags ? JSON.stringify(data.hashtags) : null,
     data.feeling || null]
  );
  return result.insertId;
};

const getPostById = async (postId) => {
  const [rows] = await pool.query(
    `SELECT p.*,
            u.username, u.profile_photo_url, u.user_type, u.is_verified
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = ? AND p.is_active = 1`,
    [postId]
  );
  return rows[0] || null;
};

const getFeedPosts = async (userId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT p.*,
            u.username, u.profile_photo_url, u.user_type, u.is_verified,
            (SELECT reaction_type FROM post_likes WHERE post_id = p.id AND user_id = ? LIMIT 1) as user_reaction,
            (SELECT COUNT(*) FROM post_saves WHERE post_id = p.id AND user_id = ?) as is_saved
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.is_active = 1
       AND (p.visibility = 'public'
            OR p.user_id = ?
            OR (p.visibility = 'followers' AND p.user_id IN
                (SELECT following_id FROM follows WHERE follower_id = ?)))
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, userId, userId, userId, limit, offset]
  );
  return rows;
};

const getFeedCount = async (userId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as total FROM posts p
     WHERE p.is_active = 1
       AND (p.visibility = 'public'
            OR p.user_id = ?
            OR (p.visibility = 'followers' AND p.user_id IN
                (SELECT following_id FROM follows WHERE follower_id = ?)))`,
    [userId, userId]
  );
  return rows[0].total;
};

const getUserPosts = async (userId, viewerId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT p.*,
            u.username, u.profile_photo_url, u.user_type, u.is_verified,
            (SELECT reaction_type FROM post_likes WHERE post_id = p.id AND user_id = ? LIMIT 1) as user_reaction,
            (SELECT COUNT(*) FROM post_saves WHERE post_id = p.id AND user_id = ?) as is_saved
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = ? AND p.is_active = 1
       AND (p.visibility = 'public' OR p.user_id = ?
            OR (p.visibility = 'followers' AND ? IN
                (SELECT follower_id FROM follows WHERE following_id = p.user_id)))
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [viewerId, viewerId, userId, viewerId, viewerId, limit, offset]
  );
  return rows;
};

const getUserPostsCount = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM posts WHERE user_id = ? AND is_active = 1',
    [userId]
  );
  return rows[0].total;
};

const updatePost = async (postId, data) => {
  const updates = [];
  const values = [];
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      updates.push(key + ' = ?');
      values.push(key === 'hashtags' || key === 'media_urls' ? JSON.stringify(value) : value);
    }
  }
  if (updates.length === 0) return;
  values.push(postId);
  await pool.query('UPDATE posts SET ' + updates.join(', ') + ' WHERE id = ?', values);
};

const deletePost = async (postId) => {
  await pool.query('UPDATE posts SET is_active = 0 WHERE id = ?', [postId]);
};

const incrementPostCount = async (postId, field) => {
  await pool.query('UPDATE posts SET ' + field + ' = ' + field + ' + 1 WHERE id = ?', [postId]);
};

const decrementPostCount = async (postId, field) => {
  await pool.query('UPDATE posts SET ' + field + ' = GREATEST(' + field + ' - 1, 0) WHERE id = ?', [postId]);
};

module.exports = {
  createPost, getPostById, getFeedPosts, getFeedCount,
  getUserPosts, getUserPostsCount, updatePost, deletePost,
  incrementPostCount, decrementPostCount,
};
