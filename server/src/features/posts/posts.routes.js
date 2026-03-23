const express = require('express');
const router = express.Router();
const controller = require('./posts.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { sanitizeBody } = require('../../middleware/sanitize.middleware');
const { requireAgePermission } = require('../../middleware/age-gate.middleware');
const { createPostValidation, updatePostValidation } = require('./posts.validation');

// GET /api/posts/feed — Get home feed
router.get('/feed', authenticate, controller.getFeed);

// POST /api/posts — Create a post
router.post('/', authenticate, requireAgePermission('canCreatePosts'), sanitizeBody, createPostValidation, validate, controller.create);

// GET /api/posts/user/:userId — Get user's posts
router.get('/user/:userId', authenticate, controller.getUserPosts);

// GET /api/posts/:postId — Get single post
router.get('/:postId', authenticate, controller.getById);

// PUT /api/posts/:postId — Update post
router.put('/:postId', authenticate, sanitizeBody, updatePostValidation, validate, controller.update);

// DELETE /api/posts/:postId — Delete post
router.delete('/:postId', authenticate, controller.remove);

module.exports = router;
