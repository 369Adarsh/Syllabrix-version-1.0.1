const svc = require('./prep-quizzes.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const getDaily = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getDaily(req.query.date)); });
const getByExam = asyncHandler(async (req, res) => {
  const r = await svc.getByExam(parseInt(req.params.examId), req.query);
  res.json({ success:true, data:r.quizzes, pagination:r.pagination });
});
const getByTopic = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getByTopic(req.params.topic)); });
const getById = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getById(parseInt(req.params.quizId))); });
const create = asyncHandler(async (req, res) => { sendCreated(res, await svc.create(req.body)); });
const submit = asyncHandler(async (req, res) => { sendSuccess(res, await svc.submit(req.user.id, parseInt(req.params.quizId), req.body.answers, req.body.time_taken_seconds)); });
const getResults = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getResults(req.user.id, parseInt(req.params.quizId))); });
const getLeaderboard = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getLeaderboard(parseInt(req.params.quizId))); });
const getDailyLeaderboard = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getDailyLeaderboard(req.query.date)); });
const getUserStats = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getUserStats(req.user.id)); });

module.exports = { getDaily, getByExam, getByTopic, getById, create, submit, getResults, getLeaderboard, getDailyLeaderboard, getUserStats };
