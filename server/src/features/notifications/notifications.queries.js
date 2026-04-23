const { pool } = require('../../database/connection');

const VALID_REF_TYPES = new Set(['post','comment','user','group','job','live_class','achievement','mentorship']);

const create = async (d) => {
  const refType = VALID_REF_TYPES.has(d.reference_type) ? d.reference_type : null;
  const [r] = await pool.query(
    `INSERT INTO notifications (user_id, type, actor_id, reference_id, reference_type, message)
     VALUES (?,?,?,?,?,?)`,
    [d.user_id, d.type, d.actor_id||null, d.reference_id||null, refType, d.message]
  );
  return r.insertId;
};

const getUserNotifications = async (userId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT n.*, u.username as actor_username, u.full_name as actor_full_name, u.profile_photo_url as actor_photo
     FROM notifications n LEFT JOIN users u ON n.actor_id = u.id
     WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows;
};

const getCount = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?', [userId]
  );
  return rows[0].total;
};

const getUnreadCount = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND is_read = 0', [userId]
  );
  return rows[0].total;
};

const markAsRead = async (notifId, userId) => {
  await pool.query(
    'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?',
    [notifId, userId]
  );
};

const markAllRead = async (userId) => {
  await pool.query(
    'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0',
    [userId]
  );
};

const deleteNotification = async (notifId, userId) => {
  await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [notifId, userId]);
};

module.exports = { create, getUserNotifications, getCount, getUnreadCount, markAsRead, markAllRead, deleteNotification };
