const savesService = require('./saves.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const toggle = asyncHandler(async (req, res) => {
  const result = await savesService.toggle(req.user.id, req.params.postId);
  sendSuccess(res, result);
});

const getSaved = asyncHandler(async (req, res) => {
  const result = await savesService.getSaved(req.user.id, req.query);
  res.json({ success: true, data: result.posts, pagination: result.pagination });
});

module.exports = { toggle, getSaved };
