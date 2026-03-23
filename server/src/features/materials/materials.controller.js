const svc = require('./materials.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const create = asyncHandler(async (req, res) => { sendCreated(res, await svc.create(req.user.id, req.body), 'Material uploaded!'); });
const list = asyncHandler(async (req, res) => {
  const { subject, material_type, target_class, target_board, uploaded_by } = req.query;
  const result = await svc.list({ subject, material_type, target_class, target_board, uploaded_by }, req.query);
  res.json({ success: true, data: result.materials, pagination: result.pagination });
});
const getById = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getById(parseInt(req.params.materialId))); });
const remove = asyncHandler(async (req, res) => { await svc.remove(parseInt(req.params.materialId), req.user.id); sendSuccess(res, null, 'Deleted.'); });
const download = asyncHandler(async (req, res) => { sendSuccess(res, await svc.download(parseInt(req.params.materialId))); });

module.exports = { create, list, getById, remove, download };
