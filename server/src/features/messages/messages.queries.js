const { pool } = require('../../database/connection');

const sendMessage = async (senderId, receiverId, content, mediaUrl, mediaType) => {
  const [result] = await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, content, media_url, media_type)
     VALUES (?, ?, ?, ?, ?)`,
    [senderId, receiverId, content, mediaUrl || null, mediaType || 'none']
  );
  return result.insertId;
};

const getMessageById = async (messageId) => {
  const [rows] = await pool.query(
    `SELECT m.*, u.username as sender_username, u.profile_photo_url as sender_photo
     FROM messages m JOIN users u ON m.sender_id = u.id
     WHERE m.id = ?`,
    [messageId]
  );
  return rows[0] || null;
};

const getConversation = async (userId1, userId2, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT m.*,
            s.username as sender_username, s.profile_photo_url as sender_photo,
            r.username as receiver_username, r.profile_photo_url as receiver_photo
     FROM messages m
     JOIN users s ON m.sender_id = s.id
     JOIN users r ON m.receiver_id = r.id
     WHERE ((m.sender_id = ? AND m.receiver_id = ? AND m.is_deleted_sender = 0)
            OR (m.sender_id = ? AND m.receiver_id = ? AND m.is_deleted_receiver = 0))
     ORDER BY m.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId1, userId2, userId2, userId1, limit, offset]
  );
  return rows.reverse(); // Return in chronological order
};

const getConversationCount = async (userId1, userId2) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as total FROM messages
     WHERE ((sender_id = ? AND receiver_id = ? AND is_deleted_sender = 0)
            OR (sender_id = ? AND receiver_id = ? AND is_deleted_receiver = 0))`,
    [userId1, userId2, userId2, userId1]
  );
  return rows[0].total;
};

const getConversationsList = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
       CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_user_id,
       u.username, u.profile_photo_url, u.user_type, u.is_verified,
       m.content as last_message,
       m.media_type as last_media_type,
       m.created_at as last_message_at,
       m.sender_id as last_sender_id,
       (SELECT COUNT(*) FROM messages
        WHERE receiver_id = ? AND sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
        AND is_read = 0 AND is_deleted_receiver = 0) as unread_count
     FROM messages m
     JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
     WHERE m.id IN (
       SELECT MAX(id) FROM messages
       WHERE (sender_id = ? AND is_deleted_sender = 0)
          OR (receiver_id = ? AND is_deleted_receiver = 0)
       GROUP BY CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
     )
     AND u.is_active = 1
     ORDER BY m.created_at DESC`,
    [userId, userId, userId, userId, userId, userId, userId]
  );
  return rows;
};

const markAsRead = async (messageId, userId) => {
  await pool.query(
    'UPDATE messages SET is_read = 1, read_at = NOW() WHERE id = ? AND receiver_id = ? AND is_read = 0',
    [messageId, userId]
  );
};

const markConversationRead = async (senderId, receiverId) => {
  await pool.query(
    'UPDATE messages SET is_read = 1, read_at = NOW() WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
    [senderId, receiverId]
  );
};

const deleteMessage = async (messageId, userId) => {
  // Check if user is sender or receiver, soft-delete accordingly
  const [msg] = await pool.query('SELECT sender_id, receiver_id FROM messages WHERE id = ?', [messageId]);
  if (msg.length === 0) return false;

  if (msg[0].sender_id === userId) {
    await pool.query('UPDATE messages SET is_deleted_sender = 1 WHERE id = ?', [messageId]);
  } else if (msg[0].receiver_id === userId) {
    await pool.query('UPDATE messages SET is_deleted_receiver = 1 WHERE id = ?', [messageId]);
  }
  return true;
};

const getUnreadCount = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0 AND is_deleted_receiver = 0',
    [userId]
  );
  return rows[0].total;
};

module.exports = {
  sendMessage, getMessageById, getConversation, getConversationCount,
  getConversationsList, markAsRead, markConversationRead,
  deleteMessage, getUnreadCount,
};
