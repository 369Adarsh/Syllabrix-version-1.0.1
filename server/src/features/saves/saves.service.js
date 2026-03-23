const { ApiError } = require('../../utils/api-error');
const queries = require('./saves.queries');
const postsQueries = require('../posts/posts.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const toggle = async (userId, postId) => {
  const post = await postsQueries.getPostById(postId);
  if (!post) throw ApiError.notFound('Post not found.');
  const result = await queries.toggleSave(userId, postId);
  if (result.action === 'saved') {
    await postsQueries.incrementPostCount(postId, 'saves_count');
  } else {
    await postsQueries.decrementPostCount(postId, 'saves_count');
  }
  return result;
};

const getSaved = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);
  const posts = await queries.getSavedPosts(userId, limit, offset);
  const total = await queries.getSavedCount(userId);
  return { posts, pagination: getPaginationMeta(total, page, limit) };
};

module.exports = { toggle, getSaved };
