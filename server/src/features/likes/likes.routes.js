const express = require('express');
const router = express.Router();
const controller = require('./likes.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// POST /api/likes/:postId — Toggle like/reaction
router.post('/:postId', authenticate, controller.toggleLike);

// GET /api/likes/:postId — Get who liked a post
router.get('/:postId', authenticate, controller.getPostLikes);

module.exports = router;
