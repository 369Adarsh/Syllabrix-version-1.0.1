const svc = require('./celebrations.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');
const getFeed = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getFeed(req.query)); });
const getUserCelebrations = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getUserCelebrations(parseInt(req.params.userId))); });
module.exports = { getFeed, getUserCelebrations };
