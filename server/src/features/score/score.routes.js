const express = require('express');
const router = express.Router();
const ctrl = require('./score.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/leaderboard', authenticate, ctrl.getLeaderboard);
router.get('/:userId', authenticate, ctrl.getScore);
router.get('/:userId/history', authenticate, ctrl.getHistory);
router.post('/recalculate', authenticate, ctrl.recalculate);

module.exports = router;
