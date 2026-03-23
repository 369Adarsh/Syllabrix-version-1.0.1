const { body } = require('express-validator');

const createPostValidation = [
  body('content').optional().trim().isLength({ max: 5000 }).withMessage('Post content max 5000 characters'),
  body('visibility').optional().isIn(['public', 'followers', 'group', 'private']),
  body('post_type').optional().isIn(['regular', 'achievement', 'experience_share', 'repost', 'project_showcase']),
  body('media_url').optional().trim(),
  body('media_type').optional().isIn(['none', 'image', 'video', 'document', 'multiple']),
  body('hashtags').optional().isArray(),
];

const updatePostValidation = [
  body('content').optional().trim().isLength({ max: 5000 }),
  body('visibility').optional().isIn(['public', 'followers', 'group', 'private']),
  body('hashtags').optional().isArray(),
];

module.exports = { createPostValidation, updatePostValidation };
