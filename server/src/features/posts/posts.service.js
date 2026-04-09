const { ApiError } = require('../../utils/api-error');
const queries = require('./posts.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const create = async (userId, postData) => {
  const postId = await queries.createPost({
    user_id: userId,
    content: postData.content,
    media_url: postData.media_url,
    media_type: postData.media_type,
    media_urls: postData.media_urls,
    visibility: postData.visibility,
    group_id: postData.group_id,
    post_type: postData.post_type,
    original_post_id: postData.original_post_id,
    hashtags: postData.hashtags,
    feeling: postData.feeling,
  });

  const post = await queries.getPostById(postId);
  return post;
};

const getFeed = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);
  const posts = await queries.getFeedPosts(userId, limit, offset);
  const total = await queries.getFeedCount(userId);
  const pagination = getPaginationMeta(total, page, limit);
  return { posts, pagination };
};

const getById = async (postId, viewerId) => {
  const post = await queries.getPostById(postId);
  if (!post) throw ApiError.notFound('Post not found.');
  return post;
};

const getUserPosts = async (userId, viewerId, query) => {
  const { page, limit, offset } = getPagination(query);
  const posts = await queries.getUserPosts(userId, viewerId, limit, offset);
  const total = await queries.getUserPostsCount(userId);
  const pagination = getPaginationMeta(total, page, limit);
  return { posts, pagination };
};

const update = async (postId, userId, updateData) => {
  const post = await queries.getPostById(postId);
  if (!post) throw ApiError.notFound('Post not found.');
  if (post.user_id !== userId) throw ApiError.forbidden('You can only edit your own posts.');

  await queries.updatePost(postId, {
    content: updateData.content,
    visibility: updateData.visibility,
    hashtags: updateData.hashtags,
  });

  return queries.getPostById(postId);
};

const remove = async (postId, userId) => {
  const post = await queries.getPostById(postId);
  if (!post) throw ApiError.notFound('Post not found.');
  if (post.user_id !== userId) throw ApiError.forbidden('You can only delete your own posts.');
  await queries.deletePost(postId);
};

module.exports = { create, getFeed, getById, getUserPosts, update, remove };
