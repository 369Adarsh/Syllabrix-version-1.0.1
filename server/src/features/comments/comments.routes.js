const express = require('express');
const router = express.Router();
const controller = require('./comments.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { sanitizeBody } = require('../../middleware/sanitize.middleware');
const { requireAgePermission } = require('../../middleware/age-gate.middleware');
const { createCommentValidation } = require('./comments.validation');

// POST /api/comments/:postId — Add comment to post
router.post('/:postId', authenticate, requireAgePermission('canComment'), sanitizeBody, createCommentValidation, validate, controller.create);

// GET /api/comments/:postId — Get comments for a post
router.get('/:postId', authenticate, controller.getPostComments);

// GET /api/comments/:commentId/replies — Get replies to a comment
router.get('/:commentId/replies', authenticate, controller.getReplies);

// DELETE /api/comments/:commentId — Delete a comment
router.delete('/:commentId', authenticate, controller.remove);

module.exports = router;
