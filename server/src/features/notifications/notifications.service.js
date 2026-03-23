const queries = require('./notifications.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');
const { emitToUser } = require('../../socket/index');

// Called by other services to create notifications
const createNotification = async (data) => {
  // Don't notify yourself
  if (data.actor_id && data.actor_id === data.user_id) return;
  const id = await queries.create(data);
  // Push via socket
  try { emitToUser(data.user_id, 'notification:new', { ...data, id }); } catch (e) {}
  return id;
};

const getNotifications = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);
  const notifications = await queries.getUserNotifications(userId, limit, offset);
  const total = await queries.getCount(userId);
  return { notifications, pagination: getPaginationMeta(total, page, limit) };
};

const getUnreadCount = async (userId) => {
  return { unread_count: await queries.getUnreadCount(userId) };
};

const markRead = async (notifId, userId) => { await queries.markAsRead(notifId, userId); };
const markAllRead = async (userId) => { await queries.markAllRead(userId); };
const remove = async (notifId, userId) => { await queries.deleteNotification(notifId, userId); };

module.exports = { createNotification, getNotifications, getUnreadCount, markRead, markAllRead, remove };
