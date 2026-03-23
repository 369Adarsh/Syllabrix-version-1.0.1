const { body } = require('express-validator');

const createCommentValidation = [
  body('content').trim().notEmpty().withMessage('Comment is required').isLength({ max: 1000 }).withMessage('Comment max 1000 characters'),
  body('parent_comment_id').optional().isInt(),
];

module.exports = { createCommentValidation };
