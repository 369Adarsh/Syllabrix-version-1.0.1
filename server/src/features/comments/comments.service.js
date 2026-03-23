const { ApiError } = require('../../utils/api-error');
const queries = require('./comments.queries');
const postsQueries = require('../posts/posts.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const create = async (userId, postId, data) => {
  const post = await postsQueries.getPostById(postId);
  if (!post) throw ApiError.notFound('Post not found.');

  // TODO: Phase 3 — Positivity check with Google Perspective API
  // For now, allow all comments

  const commentId = await queries.createComment({
    user_id: userId,
    post_id: postId,
    parent_comment_id: data.parent_comment_id,
    content: data.content,
  });

  await postsQueries.incrementPostCount(postId, 'comments_count');
  return queries.getCommentById(commentId);
};

const getPostComments = async (postId, query) => {
  const { page, limit, offset } = getPagination(query);
  const comments = await queries.getPostComments(postId, limit, offset);
  const total = await queries.getPostCommentsCount(postId);
  return { comments, pagination: getPaginationMeta(total, page, limit) };
};

const getReplies = async (commentId, query) => {
  const { page, limit, offset } = getPagination(query);
  const replies = await queries.getCommentReplies(commentId, limit, offset);
  return { replies };
};

const remove = async (commentId, userId) => {
  const comment = await queries.getCommentById(commentId);
  if (!comment) throw ApiError.notFound('Comment not found.');
  if (comment.user_id !== userId) throw ApiError.forbidden('You can only delete your own comments.');
  await queries.deleteComment(commentId);
  await postsQueries.decrementPostCount(comment.post_id, 'comments_count');
};

module.exports = { create, getPostComments, getReplies, remove };
