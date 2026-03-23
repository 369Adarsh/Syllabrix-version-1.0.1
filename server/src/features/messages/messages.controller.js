const messagesService = require('./messages.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const send = asyncHandler(async (req, res) => {
  const message = await messagesService.send(
    req.user.id, parseInt(req.params.userId), req.user.ageGroup,
    req.body.content, req.body.media_url, req.body.media_type
  );
  sendCreated(res, message, 'Message sent!');
});

const getConversation = asyncHandler(async (req, res) => {
  const result = await messagesService.getConversation(
    req.user.id, parseInt(req.params.userId), req.query
  );
  res.json({ success: true, data: result.messages, pagination: result.pagination });
});

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await messagesService.getConversations(req.user.id);
  sendSuccess(res, conversations);
});

const markRead = asyncHandler(async (req, res) => {
  await messagesService.markRead(parseInt(req.params.messageId), req.user.id);
  sendSuccess(res, null, 'Marked as read.');
});

const remove = asyncHandler(async (req, res) => {
  await messagesService.remove(parseInt(req.params.messageId), req.user.id);
  sendSuccess(res, null, 'Message deleted.');
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await messagesService.getUnreadCount(req.user.id);
  sendSuccess(res, result);
});

module.exports = { send, getConversation, getConversations, markRead, remove, getUnreadCount };
