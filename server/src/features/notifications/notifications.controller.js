const svc = require('./notifications.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const getNotifications = asyncHandler(async (req, res) => {
  const result = await svc.getNotifications(req.user.id, req.query);
  res.json({ success: true, data: result.notifications, pagination: result.pagination });
});
const getUnreadCount = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getUnreadCount(req.user.id)); });
const markRead = asyncHandler(async (req, res) => { await svc.markRead(parseInt(req.params.notifId), req.user.id); sendSuccess(res, null, 'Marked as read.'); });
const markAllRead = asyncHandler(async (req, res) => { await svc.markAllRead(req.user.id); sendSuccess(res, null, 'All marked as read.'); });
const remove = asyncHandler(async (req, res) => { await svc.remove(parseInt(req.params.notifId), req.user.id); sendSuccess(res, null, 'Dismissed.'); });

module.exports = { getNotifications, getUnreadCount, markRead, markAllRead, remove };
