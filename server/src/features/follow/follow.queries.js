const { pool } = require('../../database/connection');

const follow = async (followerId, followingId) => {
  const [result] = await pool.query(
    'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
    [followerId, followingId]
  );
  return result.insertId;
};

const unfollow = async (followerId, followingId) => {
  const [result] = await pool.query(
    'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId]
  );
  return result.affectedRows > 0;
};

const isFollowing = async (followerId, followingId) => {
  const [rows] = await pool.query(
    'SELECT id FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1',
    [followerId, followingId]
  );
  return rows.length > 0;
};

const getFollowers = async (userId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.user_type, u.profile_photo_url, u.bio, u.is_verified,
            u.city, u.state, f.created_at as followed_at
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.following_id = ? AND u.is_active = 1
     ORDER BY f.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows;
};

const getFollowersCount = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM follows f JOIN users u ON f.follower_id = u.id WHERE f.following_id = ? AND u.is_active = 1',
    [userId]
  );
  return rows[0].total;
};

const getFollowing = async (userId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.user_type, u.profile_photo_url, u.bio, u.is_verified,
            u.city, u.state, f.created_at as followed_at
     FROM follows f
     JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = ? AND u.is_active = 1
     ORDER BY f.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows;
};

const getFollowingCount = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM follows f JOIN users u ON f.following_id = u.id WHERE f.follower_id = ? AND u.is_active = 1',
    [userId]
  );
  return rows[0].total;
};

// Mutual follows (both follow each other)
const getMutualFollows = async (userId1, userId2, limit) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.profile_photo_url, u.user_type
     FROM follows f1
     JOIN follows f2 ON f1.following_id = f2.following_id
     JOIN users u ON f1.following_id = u.id
     WHERE f1.follower_id = ? AND f2.follower_id = ?
       AND f1.following_id != ? AND f1.following_id != ?
       AND u.is_active = 1
     LIMIT ?`,
    [userId1, userId2, userId1, userId2, limit]
  );
  return rows;
};

module.exports = {
  follow, unfollow, isFollowing,
  getFollowers, getFollowersCount,
  getFollowing, getFollowingCount,
  getMutualFollows,
};
