const express = require('express');
const router = express.Router();
const ctrl = require('./prep-quizzes.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/daily', authenticate, ctrl.getDaily);
router.get('/daily-leaderboard', authenticate, ctrl.getDailyLeaderboard);
router.get('/my-stats', authenticate, ctrl.getUserStats);
router.get('/exam/:examId', authenticate, ctrl.getByExam);
router.get('/topic/:topic', authenticate, ctrl.getByTopic);
router.get('/:quizId', authenticate, ctrl.getById);
router.get('/:quizId/leaderboard', authenticate, ctrl.getLeaderboard);
router.get('/:quizId/results', authenticate, ctrl.getResults);
router.post('/', authenticate, ctrl.create);
router.post('/:quizId/submit', authenticate, ctrl.submit);

module.exports = router;
