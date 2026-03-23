const express = require('express');
const router = express.Router();
const controller = require('./shares.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/:postId', authenticate, controller.share);
router.get('/:postId', authenticate, controller.getPostShares);

module.exports = router;
