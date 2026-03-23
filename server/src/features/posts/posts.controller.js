const postsService = require('./posts.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const create = asyncHandler(async (req, res) => {
  const post = await postsService.create(req.user.id, req.body);
  sendCreated(res, post, 'Post created!');
});

const getFeed = asyncHandler(async (req, res) => {
  const result = await postsService.getFeed(req.user.id, req.query);
  res.json({ success: true, message: 'Feed loaded', data: result.posts, pagination: result.pagination });
});

const getById = asyncHandler(async (req, res) => {
  const post = await postsService.getById(req.params.postId, req.user.id);
  sendSuccess(res, post);
});

const getUserPosts = asyncHandler(async (req, res) => {
  const result = await postsService.getUserPosts(req.params.userId, req.user.id, req.query);
  res.json({ success: true, data: result.posts, pagination: result.pagination });
});

const update = asyncHandler(async (req, res) => {
  const post = await postsService.update(req.params.postId, req.user.id, req.body);
  sendSuccess(res, post, 'Post updated!');
});

const remove = asyncHandler(async (req, res) => {
  await postsService.remove(req.params.postId, req.user.id);
  sendSuccess(res, null, 'Post deleted.');
});

module.exports = { create, getFeed, getById, getUserPosts, update, remove };
