const svc = require('./prep-bookmarks.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');
const add = asyncHandler(async (req, res) => { sendCreated(res, await svc.add(req.user.id, req.body)); });
const remove = asyncHandler(async (req, res) => { sendSuccess(res, await svc.remove(parseInt(req.params.id), req.user.id)); });
const getAll = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getAll(req.user.id, req.query.folder)); });
const getFolders = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getFolders(req.user.id)); });
module.exports = { add, remove, getAll, getFolders };
