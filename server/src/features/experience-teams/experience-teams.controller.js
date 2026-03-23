const svc = require('./experience-teams.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');
const create = asyncHandler(async (req,res) => { sendCreated(res, await svc.create(req.user.id, req.body)); });
const getById = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getById(parseInt(req.params.teamId))); });
const join = asyncHandler(async (req,res) => { sendSuccess(res, await svc.join(parseInt(req.params.teamId), req.user.id)); });
const leave = asyncHandler(async (req,res) => { sendSuccess(res, await svc.leave(parseInt(req.params.teamId), req.user.id)); });
const assignRole = asyncHandler(async (req,res) => { sendSuccess(res, await svc.assignRole(parseInt(req.params.teamId), parseInt(req.params.userId), req.body.role_title)); });
module.exports = { create, getById, join, leave, assignRole };
