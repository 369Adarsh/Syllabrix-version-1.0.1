const svc = require('./safety.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const block = asyncHandler(async (req, res) => { sendSuccess(res, await svc.block(req.user.id, parseInt(req.params.userId))); });
const unblock = asyncHandler(async (req, res) => { sendSuccess(res, await svc.unblock(req.user.id, parseInt(req.params.userId))); });
const getBlocked = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getBlocked(req.user.id)); });
const report = asyncHandler(async (req, res) => { sendCreated(res, await svc.report(req.user.id, req.body)); });
const getMyReports = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getMyReports(req.user.id)); });

module.exports = { block, unblock, getBlocked, report, getMyReports };
