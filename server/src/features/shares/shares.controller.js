const sharesService = require('./shares.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const share = asyncHandler(async (req, res) => {
  const repost = await sharesService.sharePost(req.user.id, req.params.postId);
  sendCreated(res, repost, 'Post shared!');
});

const getPostShares = asyncHandler(async (req, res) => {
  const shares = await sharesService.getPostShares(req.params.postId, req.query);
  sendSuccess(res, shares);
});

module.exports = { share, getPostShares };
