const { ApiError } = require('../../utils/api-error');
const { AGE_PERMISSIONS } = require('../../../../shared/constants/age-permissions');
const queries = require('./messages.queries');
const { pool } = require('../../database/connection');
const { emitToDM, emitToUser } = require('../../socket/index');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const send = async (senderId, receiverId, senderAgeGroup, content, mediaUrl, mediaType) => {
  if (senderId === receiverId) {
    throw ApiError.badRequest('You cannot message yourself.');
  }

  // Age check — DMs restricted for under 14
  const perms = AGE_PERMISSIONS[senderAgeGroup];
  if (!perms || !perms.canSendDM) {
    throw ApiError.forbidden('Direct messaging is not available for your age group.');
  }

  // Check receiver exists
  const [users] = await pool.query(
    'SELECT id, is_active, is_banned FROM users WHERE id = ?', [receiverId]
  );
  if (users.length === 0 || !users[0].is_active) {
    throw ApiError.notFound('User not found.');
  }

  // Check block
  const [blocks] = await pool.query(
    'SELECT id FROM user_blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
    [senderId, receiverId, receiverId, senderId]
  );
  if (blocks.length > 0) {
    throw ApiError.forbidden('You cannot message this user.');
  }

  const messageId = await queries.sendMessage(senderId, receiverId, content, mediaUrl, mediaType);
  const message = await queries.getMessageById(messageId);

  // Emit real-time via socket
  try {
    emitToDM(senderId, receiverId, 'message:receive', message);
    emitToUser(receiverId, 'notification:new', {
      type: 'message',
      message: 'New message received',
      from: senderId,
    });
  } catch (e) {
    // Socket not initialized in some contexts, ignore
  }

  return message;
};

const getConversation = async (userId, otherUserId, query) => {
  const { page, limit, offset } = getPagination(query);
  const messages = await queries.getConversation(userId, otherUserId, limit, offset);
  const total = await queries.getConversationCount(userId, otherUserId);

  // Mark as read
  await queries.markConversationRead(otherUserId, userId);

  return { messages, pagination: getPaginationMeta(total, page, limit) };
};

const getConversations = async (userId) => {
  return queries.getConversationsList(userId);
};

const markRead = async (messageId, userId) => {
  await queries.markAsRead(messageId, userId);
};

const remove = async (messageId, userId) => {
  const success = await queries.deleteMessage(messageId, userId);
  if (!success) throw ApiError.notFound('Message not found.');
};

const getUnreadCount = async (userId) => {
  const count = await queries.getUnreadCount(userId);
  return { unread_count: count };
};

module.exports = { send, getConversation, getConversations, markRead, remove, getUnreadCount };
