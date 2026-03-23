const likesService = require('./likes.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const toggleLike = asyncHandler(async (req, res) => {
  const result = await likesService.toggleLike(req.user.id, req.params.postId, req.body.reaction_type || 'like');
  sendSuccess(res, result);
});

const getPostLikes = asyncHandler(async (req, res) => {
  const result = await likesService.getPostLikes(req.params.postId, req.query);
  res.json({ success: true, data: result.likes, pagination: result.pagination });
});

module.exports = { toggleLike, getPostLikes };
