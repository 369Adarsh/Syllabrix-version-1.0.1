const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { uploadSingle } = require('../../middleware/upload.middleware');
const controller = require('./stories.controller');

router.get('/feed', authenticate, controller.getFeed);
router.post('/', authenticate, uploadSingle, controller.create);
router.post('/:id/view', authenticate, controller.markViewed);
router.delete('/:id', authenticate, controller.remove);

module.exports = router;
