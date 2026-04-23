const { ApiError } = require('../../utils/api-error');
const likesQueries = require('./likes.queries');
const postsQueries = require('../posts/posts.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');
const { pool } = require('../../database/connection');
const { createNotification } = require('../notifications/notifications.service');

const toggleLike = async (userId, postId, reactionType) => {
  const post = await postsQueries.getPostById(postId);
  if (!post) throw ApiError.notFound('Post not found.');

  const existingLike = await likesQueries.getUserLike(userId, postId);

  if (existingLike) {
    if (existingLike.reaction_type === reactionType) {
      await likesQueries.removeLike(userId, postId);
      await postsQueries.decrementPostCount(postId, 'likes_count');
      return { action: 'unliked', reaction: null };
    } else {
      await likesQueries.removeLike(userId, postId);
      await likesQueries.addLike(userId, postId, reactionType);
      return { action: 'updated', reaction: reactionType };
    }
  } else {
    await likesQueries.addLike(userId, postId, reactionType);
    await postsQueries.incrementPostCount(postId, 'likes_count');
    // Notify post owner on new like
    if (post.user_id !== userId) {
      const [[actor]] = await pool.query('SELECT username FROM users WHERE id = ?', [userId]);
      createNotification({
        user_id: post.user_id, type: 'like', actor_id: userId,
        reference_id: postId, reference_type: 'post',
        message: `${actor?.username || 'Someone'} liked your post`,
      }).catch(() => {});
    }
    return { action: 'liked', reaction: reactionType };
  }
};

const getPostLikes = async (postId, query) => {
  const { page, limit, offset } = getPagination(query);
  const likes = await likesQueries.getPostLikes(postId, limit, offset);
  const total = await likesQueries.getPostLikesCount(postId);
  return { likes, pagination: getPaginationMeta(total, page, limit) };
};

module.exports = { toggleLike, getPostLikes };
