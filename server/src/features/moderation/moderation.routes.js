const express = require('express');
const router = express.Router();
const ctrl = require('./moderation.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/check', authenticate, ctrl.checkContent);
router.get('/logs', authenticate, ctrl.getLogs);
router.get('/strikes/:userId', authenticate, ctrl.getUserStrikes);
router.get('/activity/:userId', authenticate, ctrl.getActivityLog);
router.get('/my-streak', authenticate, ctrl.getMyStreak);

module.exports = router;
