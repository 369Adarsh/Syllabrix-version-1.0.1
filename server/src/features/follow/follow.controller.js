const followService = require('./follow.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

// POST /api/follow/:userId — Toggle follow/unfollow
const toggleFollow = asyncHandler(async (req, res) => {
  const result = await followService.toggleFollow(req.user.id, parseInt(req.params.userId));
  sendSuccess(res, result);
});

// GET /api/follow/:userId/followers — Get user's followers
const getFollowers = asyncHandler(async (req, res) => {
  const result = await followService.getFollowers(parseInt(req.params.userId), req.query);
  res.json({ success: true, data: result.followers, pagination: result.pagination });
});

// GET /api/follow/:userId/following — Get who user follows
const getFollowing = asyncHandler(async (req, res) => {
  const result = await followService.getFollowing(parseInt(req.params.userId), req.query);
  res.json({ success: true, data: result.following, pagination: result.pagination });
});

// GET /api/follow/:userId/status — Check follow status between me and user
const checkStatus = asyncHandler(async (req, res) => {
  const result = await followService.checkFollowStatus(req.user.id, parseInt(req.params.userId));
  sendSuccess(res, result);
});

// GET /api/follow/:userId/mutual — Get mutual follows
const getMutual = asyncHandler(async (req, res) => {
  const result = await followService.getMutualFollows(req.user.id, parseInt(req.params.userId));
  sendSuccess(res, result);
});

module.exports = { toggleFollow, getFollowers, getFollowing, checkStatus, getMutual };
