const svc = require('./prep-current-affairs.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');
const getToday = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getToday()); });
const getByDate = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getByDate(req.params.date)); });
const getWeekly = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getWeekly()); });
const getMonthly = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getMonthly(req.params.month)); });
const getByCategory = asyncHandler(async (req, res) => {
  const r = await svc.getByCategory(req.params.category, req.query);
  res.json({ success:true, data:r.affairs, pagination:r.pagination });
});
const getById = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getById(parseInt(req.params.id))); });
const create = asyncHandler(async (req, res) => { sendCreated(res, await svc.create(req.body)); });
module.exports = { getToday, getByDate, getWeekly, getMonthly, getByCategory, getById, create };
