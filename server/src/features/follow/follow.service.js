const { ApiError } = require('../../utils/api-error');
const queries = require('./follow.queries');
const { pool } = require('../../database/connection');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');
const { createNotification } = require('../notifications/notifications.service');

const toggleFollow = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw ApiError.badRequest('You cannot follow yourself.');
  }

  // Check target user exists and is active
  const [users] = await pool.query(
    'SELECT id, is_active FROM users WHERE id = ?', [followingId]
  );
  if (users.length === 0 || !users[0].is_active) {
    throw ApiError.notFound('User not found.');
  }

  const alreadyFollowing = await queries.isFollowing(followerId, followingId);

  if (alreadyFollowing) {
    await queries.unfollow(followerId, followingId);
    return { action: 'unfollowed', is_following: false };
  } else {
    await queries.follow(followerId, followingId);
    const [[actor]] = await pool.query('SELECT username FROM users WHERE id = ?', [followerId]);
    createNotification({
      user_id: followingId, type: 'follow', actor_id: followerId,
      reference_id: followerId, reference_type: 'user',
      message: `${actor?.username || 'Someone'} started following you`,
    }).catch(() => {});
    return { action: 'followed', is_following: true };
  }
};

const getFollowers = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);
  const followers = await queries.getFollowers(userId, limit, offset);
  const total = await queries.getFollowersCount(userId);
  return { followers, pagination: getPaginationMeta(total, page, limit) };
};

const getFollowing = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);
  const following = await queries.getFollowing(userId, limit, offset);
  const total = await queries.getFollowingCount(userId);
  return { following, pagination: getPaginationMeta(total, page, limit) };
};

const checkFollowStatus = async (followerId, followingId) => {
  const isFollowing = await queries.isFollowing(followerId, followingId);
  const isFollowedBy = await queries.isFollowing(followingId, followerId);
  return { is_following: isFollowing, is_followed_by: isFollowedBy };
};

const getMutualFollows = async (userId1, userId2) => {
  return queries.getMutualFollows(userId1, userId2, 10);
};

module.exports = { toggleFollow, getFollowers, getFollowing, checkFollowStatus, getMutualFollows };
