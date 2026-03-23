const svc = require('./parent.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const linkChild = asyncHandler(async (req, res) => { sendCreated(res, await svc.linkChild(req.user.id, req.body.child_email), 'Child linked!'); });
const getChildren = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getChildren(req.user.id)); });
const getChildActivity = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getChildActivity(req.user.id, parseInt(req.params.childId))); });
const removeLink = asyncHandler(async (req, res) => { await svc.removeLink(req.user.id, parseInt(req.params.childId)); sendSuccess(res, null, 'Link removed.'); });

module.exports = { linkChild, getChildren, getChildActivity, removeLink };
