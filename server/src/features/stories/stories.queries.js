const { pool } = require('../../database/connection');

// Feed stories: own + from followed users, active only, grouped for ordering
const getActiveStoriesForFeed = async (userId) => {
  const [rows] = await pool.query(`
    SELECT
      s.id, s.user_id, s.media_url, s.media_type, s.caption,
      s.created_at, s.expires_at,
      u.username, u.full_name, u.profile_photo_url,
      (sv.id IS NOT NULL) AS viewed
    FROM stories s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN story_views sv ON sv.story_id = s.id AND sv.viewer_id = ?
    WHERE s.expires_at > NOW()
      AND (
        s.user_id = ?
        OR s.user_id IN (
          SELECT following_id FROM follows WHERE follower_id = ?
        )
      )
    ORDER BY
      (s.user_id = ?) DESC,
      s.user_id,
      s.created_at ASC
  `, [userId, userId, userId, userId]);
  return rows;
};

const createStory = async (userId, mediaUrl, mediaType, caption) => {
  const [result] = await pool.query(
    `INSERT INTO stories (user_id, media_url, media_type, caption) VALUES (?, ?, ?, ?)`,
    [userId, mediaUrl, mediaType || 'image', caption || null]
  );
  return result.insertId;
};

const markStoryViewed = async (storyId, viewerId) => {
  await pool.query(
    `INSERT IGNORE INTO story_views (story_id, viewer_id) VALUES (?, ?)`,
    [storyId, viewerId]
  );
};

const getStoriesByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM stories WHERE user_id = ? AND expires_at > NOW() ORDER BY created_at ASC`,
    [userId]
  );
  return rows;
};

const deleteStory = async (storyId, userId) => {
  const [result] = await pool.query(
    `DELETE FROM stories WHERE id = ? AND user_id = ?`,
    [storyId, userId]
  );
  return result.affectedRows > 0;
};

const deleteExpiredStories = async () => {
  const [result] = await pool.query(`DELETE FROM stories WHERE expires_at < NOW()`);
  return result.affectedRows;
};

module.exports = {
  getActiveStoriesForFeed, createStory, markStoryViewed,
  getStoriesByUser, deleteStory, deleteExpiredStories,
};
