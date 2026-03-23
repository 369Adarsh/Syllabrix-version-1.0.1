const svc = require('./search.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const search = asyncHandler(async (req, res) => {
  const result = await svc.search(req.user.id, req.query.q, req.query.type, req.query);
  sendSuccess(res, result);
});
const getTrending = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getTrending()); });
const getHistory = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getHistory(req.user.id)); });
const clearHistory = asyncHandler(async (req, res) => { await svc.clearHistory(req.user.id); sendSuccess(res, null, 'History cleared.'); });

module.exports = { search, getTrending, getHistory, clearHistory };
