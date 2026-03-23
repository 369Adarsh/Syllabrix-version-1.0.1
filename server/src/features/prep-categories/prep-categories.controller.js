const svc = require('./prep-categories.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');
const getTree = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getTree()); });
const getBySlug = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getBySlug(req.params.slug)); });
const create = asyncHandler(async (req, res) => { sendCreated(res, await svc.create(req.body)); });
module.exports = { getTree, getBySlug, create };
