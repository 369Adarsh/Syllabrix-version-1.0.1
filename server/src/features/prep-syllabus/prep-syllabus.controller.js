const svc = require('./prep-syllabus.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');
const getTopic = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getTopic(parseInt(req.params.topicId))); });
const create = asyncHandler(async (req, res) => { sendCreated(res, await svc.create(req.body)); });
const update = asyncHandler(async (req, res) => { sendSuccess(res, await svc.update(parseInt(req.params.topicId), req.body)); });
const getProgress = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getProgress(req.user.id, parseInt(req.params.examId))); });
const updateProgress = asyncHandler(async (req, res) => { sendSuccess(res, await svc.updateProgress(req.user.id, parseInt(req.params.syllabusId), req.body.status)); });
module.exports = { getTopic, create, update, getProgress, updateProgress };
