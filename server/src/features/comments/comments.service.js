const { ApiError } = require('../../utils/api-error');
const queries = require('./comments.queries');
const postsQueries = require('../posts/posts.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');
const { pool } = require('../../database/connection');
const { createNotification } = require('../notifications/notifications.service');

const create = async (userId, postId, data) => {
  const post = await postsQueries.getPostById(postId);
  if (!post) throw ApiError.notFound('Post not found.');

  const commentId = await queries.createComment({
    user_id: userId, post_id: postId,
    parent_comment_id: data.parent_comment_id, content: data.content,
  });

  await postsQueries.incrementPostCount(postId, 'comments_count');

  const [[actor]] = await pool.query('SELECT username FROM users WHERE id = ?', [userId]);
  const actorName = actor?.username || 'Someone';

  // Notify post owner
  if (post.user_id !== userId) {
    createNotification({
      user_id: post.user_id, type: 'comment', actor_id: userId,
      reference_id: postId, reference_type: 'post',
      message: `${actorName} commented on your post`,
    }).catch(() => {});
  }

  // Notify parent comment author on reply
  if (data.parent_comment_id) {
    const [[parent]] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [data.parent_comment_id]);
    if (parent && parent.user_id !== userId && parent.user_id !== post.user_id) {
      createNotification({
        user_id: parent.user_id, type: 'comment', actor_id: userId,
        reference_id: postId, reference_type: 'post',
        message: `${actorName} replied to your comment`,
      }).catch(() => {});
    }
  }

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
