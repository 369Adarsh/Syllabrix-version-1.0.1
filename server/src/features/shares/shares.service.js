const { ApiError } = require('../../utils/api-error');
const queries = require('./shares.queries');
const postsQueries = require('../posts/posts.queries');

const sharePost = async (userId, postId) => {
  const post = await postsQueries.getPostById(postId);
  if (!post) throw ApiError.notFound('Post not found.');

  // Create a repost
  const repostId = await postsQueries.createPost({
    user_id: userId,
    content: null,
    post_type: 'repost',
    original_post_id: postId,
    visibility: 'public',
  });

  await queries.createShare(userId, postId, repostId);
  await postsQueries.incrementPostCount(postId, 'shares_count');

  return postsQueries.getPostById(repostId);
};

const getPostShares = async (postId, query) => {
  const limit = parseInt(query.limit) || 20;
  const offset = parseInt(query.offset) || 0;
  return queries.getPostShares(postId, limit, offset);
};

module.exports = { sharePost, getPostShares };
