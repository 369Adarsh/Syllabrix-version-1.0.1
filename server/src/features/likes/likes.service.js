const { ApiError } = require('../../utils/api-error');
const likesQueries = require('./likes.queries');
const postsQueries = require('../posts/posts.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const toggleLike = async (userId, postId, reactionType) => {
  const post = await postsQueries.getPostById(postId);
  if (!post) throw ApiError.notFound('Post not found.');

  const existingLike = await likesQueries.getUserLike(userId, postId);

  if (existingLike) {
    if (existingLike.reaction_type === reactionType) {
      // Same reaction = unlike
      await likesQueries.removeLike(userId, postId);
      await postsQueries.decrementPostCount(postId, 'likes_count');
      return { action: 'unliked', reaction: null };
    } else {
      // Different reaction = update
      await likesQueries.removeLike(userId, postId);
      await likesQueries.addLike(userId, postId, reactionType);
      return { action: 'updated', reaction: reactionType };
    }
  } else {
    // New like
    await likesQueries.addLike(userId, postId, reactionType);
    await postsQueries.incrementPostCount(postId, 'likes_count');
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
