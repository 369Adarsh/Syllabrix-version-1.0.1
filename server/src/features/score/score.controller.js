const svc = require('./score.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const getScore = asyncHandler(async (req, res) => {
  sendSuccess(res, await svc.getScore(parseInt(req.params.userId)));
});
const recalculate = asyncHandler(async (req, res) => {
  sendSuccess(res, await svc.recalculateAndSave(req.user.id, 'manual_recalculation'), 'Score recalculated!');
});
const getHistory = asyncHandler(async (req, res) => {
  sendSuccess(res, await svc.getHistory(parseInt(req.params.userId)));
});
const getLeaderboard = asyncHandler(async (req, res) => {
  const result = await svc.getLeaderboard(req.query);
  res.json({ success: true, data: result.leaderboard, pagination: result.pagination });
});

module.exports = { getScore, recalculate, getHistory, getLeaderboard };
