const svc = require('./moderation.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const checkContent = asyncHandler(async (req,res) => { sendSuccess(res, svc.checkContent(req.body.text)); });
const getLogs = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getLogs({user_id:req.query.user_id,action:req.query.action,content_type:req.query.content_type}, parseInt(req.query.limit)||50, 0)); });
const getUserStrikes = asyncHandler(async (req,res) => { sendSuccess(res, { strikes: await svc.getUserStrikes(parseInt(req.params.userId)) }); });
const getActivityLog = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getActivityLog(parseInt(req.params.userId), parseInt(req.query.limit))); });
const getMyStreak = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getStreak(req.user.id)); });

module.exports = { checkContent, getLogs, getUserStrikes, getActivityLog, getMyStreak };
