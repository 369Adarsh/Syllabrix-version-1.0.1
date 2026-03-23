const svc = require('./tuition.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const create = asyncHandler(async (req, res) => { sendCreated(res, await svc.create(req.user.id, req.body), 'Ad posted!'); });
const list = asyncHandler(async (req, res) => {
  const { ad_type, subject, location, is_online } = req.query;
  const result = await svc.list({ ad_type, subject, location, is_online }, req.query);
  res.json({ success: true, data: result.ads, pagination: result.pagination });
});
const getById = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getById(parseInt(req.params.adId))); });
const update = asyncHandler(async (req, res) => { sendSuccess(res, await svc.update(parseInt(req.params.adId), req.user.id, req.body), 'Ad updated!'); });
const remove = asyncHandler(async (req, res) => { await svc.remove(parseInt(req.params.adId), req.user.id); sendSuccess(res, null, 'Ad deleted.'); });
const getMyAds = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getMyAds(req.user.id)); });

module.exports = { create, list, getById, update, remove, getMyAds };
