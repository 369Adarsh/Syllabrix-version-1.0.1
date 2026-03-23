const express = require('express');
const router = express.Router();
const ctrl = require('./celebrations.controller');
const { authenticate } = require('../../middleware/auth.middleware');
router.get('/feed', authenticate, ctrl.getFeed);
router.get('/:userId', authenticate, ctrl.getUserCelebrations);
module.exports = router;
