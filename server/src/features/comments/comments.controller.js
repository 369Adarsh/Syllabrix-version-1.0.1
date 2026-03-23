const commentsService = require('./comments.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const create = asyncHandler(async (req, res) => {
  const comment = await commentsService.create(req.user.id, req.params.postId, req.body);
  sendCreated(res, comment, 'Comment posted!');
});

const getPostComments = asyncHandler(async (req, res) => {
  const result = await commentsService.getPostComments(req.params.postId, req.query);
  res.json({ success: true, data: result.comments, pagination: result.pagination });
});

const getReplies = asyncHandler(async (req, res) => {
  const result = await commentsService.getReplies(req.params.commentId, req.query);
  sendSuccess(res, result.replies);
});

const remove = asyncHandler(async (req, res) => {
  await commentsService.remove(req.params.commentId, req.user.id);
  sendSuccess(res, null, 'Comment deleted.');
});

module.exports = { create, getPostComments, getReplies, remove };
