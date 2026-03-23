const svc = require('./badges.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');
const getAll = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getAll()); });
const getMyBadges = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getUserBadges(req.user.id)); });
const getUserBadges = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getUserBadges(parseInt(req.params.userId))); });
const create = asyncHandler(async (req,res) => { sendCreated(res, await svc.create(req.body)); });
module.exports = { getAll, getMyBadges, getUserBadges, create };
