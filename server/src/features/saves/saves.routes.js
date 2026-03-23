const express = require('express');
const router = express.Router();
const controller = require('./saves.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/:postId', authenticate, controller.toggle);
router.get('/', authenticate, controller.getSaved);

module.exports = router;
