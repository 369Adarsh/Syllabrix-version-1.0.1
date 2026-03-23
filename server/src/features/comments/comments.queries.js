const { pool } = require('../../database/connection');

const createComment = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO post_comments (user_id, post_id, parent_comment_id, content, positivity_score)
     VALUES (?, ?, ?, ?, ?)`,
    [data.user_id, data.post_id, data.parent_comment_id || null, data.content, data.positivity_score || null]
  );
  return result.insertId;
};

const getCommentById = async (commentId) => {
  const [rows] = await pool.query(
    `SELECT c.*, u.username, u.profile_photo_url, u.user_type
     FROM post_comments c JOIN users u ON c.user_id = u.id
     WHERE c.id = ? AND c.is_active = 1`,
    [commentId]
  );
  return rows[0] || null;
};

const getPostComments = async (postId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT c.*, u.username, u.profile_photo_url, u.user_type, u.is_verified,
            (SELECT COUNT(*) FROM post_comments WHERE parent_comment_id = c.id AND is_active = 1) as reply_count
     FROM post_comments c JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ? AND c.parent_comment_id IS NULL AND c.is_active = 1
     ORDER BY c.created_at ASC LIMIT ? OFFSET ?`,
    [postId, limit, offset]
  );
  return rows;
};

const getCommentReplies = async (commentId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT c.*, u.username, u.profile_photo_url, u.user_type
     FROM post_comments c JOIN users u ON c.user_id = u.id
     WHERE c.parent_comment_id = ? AND c.is_active = 1
     ORDER BY c.created_at ASC LIMIT ? OFFSET ?`,
    [commentId, limit, offset]
  );
  return rows;
};

const getPostCommentsCount = async (postId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM post_comments WHERE post_id = ? AND parent_comment_id IS NULL AND is_active = 1',
    [postId]
  );
  return rows[0].total;
};

const deleteComment = async (commentId) => {
  await pool.query('UPDATE post_comments SET is_active = 0 WHERE id = ?', [commentId]);
};

module.exports = { createComment, getCommentById, getPostComments, getCommentReplies, getPostCommentsCount, deleteComment };
