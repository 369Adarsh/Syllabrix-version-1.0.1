const svc = require('./live-classes.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const create = asyncHandler(async (req, res) => { sendCreated(res, await svc.create(req.user.id, req.body), 'Class scheduled!'); });
const list = asyncHandler(async (req, res) => {
  const { status, subject, host_id, class_type, upcoming } = req.query;
  const result = await svc.list({ status, subject, host_id, class_type, upcoming }, req.query);
  res.json({ success: true, data: result.classes, pagination: result.pagination });
});
const getById = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getById(parseInt(req.params.classId))); });
const update = asyncHandler(async (req, res) => { sendSuccess(res, await svc.update(parseInt(req.params.classId), req.user.id, req.body), 'Updated!'); });
const cancel = asyncHandler(async (req, res) => { await svc.cancel(parseInt(req.params.classId), req.user.id); sendSuccess(res, null, 'Cancelled.'); });
const start = asyncHandler(async (req, res) => { sendSuccess(res, await svc.startClass(parseInt(req.params.classId), req.user.id), 'Class is LIVE!'); });
const end = asyncHandler(async (req, res) => { sendSuccess(res, await svc.endClass(parseInt(req.params.classId), req.user.id), 'Class ended.'); });
const join = asyncHandler(async (req, res) => { sendSuccess(res, await svc.join(parseInt(req.params.classId), req.user.id)); });
const leave = asyncHandler(async (req, res) => { sendSuccess(res, await svc.leave(parseInt(req.params.classId), req.user.id)); });
const getAttendees = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getAttendees(parseInt(req.params.classId))); });
const getMyClasses = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getMyClasses(req.user.id)); });
const getMyAttended = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getMyAttended(req.user.id)); });

module.exports = { create, list, getById, update, cancel, start, end, join, leave, getAttendees, getMyClasses, getMyAttended };
