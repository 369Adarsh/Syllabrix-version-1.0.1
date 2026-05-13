const express = require('express');
const router = express.Router();
const ctrl = require('./boards.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.post('/study/notes',       ctrl.generateStudyNotes);
router.post('/practice/generate', ctrl.generatePracticeQuestions);
router.post('/test/generate',     ctrl.generateTestPaper);
router.post('/answer/check',      ctrl.checkAnswerSheet);

module.exports = router;
