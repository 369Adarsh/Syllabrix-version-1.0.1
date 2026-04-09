const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const syllabusService = require('./jee-syllabus.service');
const questionsService = require('./jee-questions.service');
const mocksService = require('./jee-mocks.service');
const aiService = require('./jee-ai.service');
const analyticsService = require('./jee-analytics.service');
const progressService = require('./jee-progress.service');
const subscriptionService = require('./jee-subscription.service');
const studyPlanService = require('./jee-studyplan.service');
const contentService = require('./jee-content.service');

// ── SYLLABUS ──────────────────────────────────────────────────────────────────
router.get('/subjects', authenticate, syllabusService.getSubjects);
router.get('/chapters', authenticate, syllabusService.getChapters);
router.get('/chapters/:subjectSlug/:chapterSlug', authenticate, syllabusService.getChapter);
router.get('/topics/:id', authenticate, syllabusService.getTopic);
router.post('/topics/:id/generate-notes', authenticate, syllabusService.generateNotes);

// ── PYQ BANK ──────────────────────────────────────────────────────────────────
router.get('/pyq', authenticate, questionsService.getPYQs);
router.get('/pyq/weightage', authenticate, questionsService.getWeightage);
router.get('/pyq/trends', authenticate, questionsService.getTrends);
router.get('/pyq/:id', authenticate, questionsService.getPYQ);

// ── NCERT SOLUTIONS ───────────────────────────────────────────────────────────
router.get('/ncert', authenticate, contentService.getNCERTChapters);
router.get('/ncert/:subject/:class/:chapter', authenticate, contentService.getNCERTExercises);
router.get('/ncert/solution/:id', authenticate, contentService.getSolution);
router.post('/ncert/generate', authenticate, contentService.generateNCERTChapter);
router.post('/ai/escalate-to-teacher', authenticate, contentService.escalateToTeacher);

// ── REFERENCE BOOKS ───────────────────────────────────────────────────────────
router.get('/books', authenticate, contentService.getBooks);
router.get('/books/:bookSlug/chapters', authenticate, contentService.getBookChapters);
router.get('/books/:bookSlug/:chapter', authenticate, contentService.getBookSolutions);

// ── MOCK TESTS ────────────────────────────────────────────────────────────────
router.get('/mocks', authenticate, mocksService.getMocks);
router.post('/mocks/generate', authenticate, mocksService.generateMock);
router.get('/mocks/:id', authenticate, mocksService.getMock);
router.post('/mocks/:id/start', authenticate, mocksService.startAttempt);
router.put('/mocks/:id/save', authenticate, mocksService.saveProgress);
router.post('/mocks/:id/submit', authenticate, mocksService.submitAttempt);
router.get('/mocks/:id/result', authenticate, mocksService.getResult);

// ── AI TUTOR ──────────────────────────────────────────────────────────────────
router.post('/ai/doubt', authenticate, aiService.solveDoubt);
router.post('/ai/explain-concept', authenticate, aiService.explainConcept);
router.post('/ai/solve-step-by-step', authenticate, aiService.solveStepByStep);
router.post('/ai/generate-questions', authenticate, aiService.generateQuestions);
router.post('/ai/generate-similar', authenticate, aiService.generateSimilar);
router.post('/ai/extract-archive', authenticate, aiService.extractHistoricalPYQs);
router.post('/ai/daily-practice-set', authenticate, aiService.dailyPracticeSet);

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
router.get('/analytics/overview', authenticate, analyticsService.getOverview);
router.get('/analytics/subject/:slug', authenticate, analyticsService.getSubjectAnalytics);
router.get('/analytics/chapter/:id', authenticate, analyticsService.getChapterAnalytics);
router.get('/analytics/mock-trends', authenticate, analyticsService.getMockTrends);
router.get('/analytics/error-patterns', authenticate, analyticsService.getErrorPatterns);
router.get('/analytics/rank-prediction', authenticate, analyticsService.getRankPrediction);

// ── FORMULA SHEETS ────────────────────────────────────────────────────────────
router.get('/formulas/:subjectSlug', authenticate, syllabusService.getFormulas);
router.get('/formulas/:subjectSlug/:chapterSlug', authenticate, syllabusService.getChapterFormulas);

// ── STUDY PLAN ────────────────────────────────────────────────────────────────
router.get('/study-plan/today', authenticate, studyPlanService.getToday);
router.post('/study-plan/generate', authenticate, studyPlanService.generate);
router.put('/study-plan/:id/complete-task', authenticate, studyPlanService.completeTask);
router.get('/study-plan/history', authenticate, studyPlanService.getHistory);

// ── PROGRESS ──────────────────────────────────────────────────────────────────
router.get('/progress/overview', authenticate, progressService.getOverview);
router.get('/progress/chapter/:id', authenticate, progressService.getChapterProgress);
router.put('/progress/chapter/:id', authenticate, progressService.updateProgress);

// ── BOOKMARKS ─────────────────────────────────────────────────────────────────
router.post('/bookmarks', authenticate, progressService.addBookmark);
router.get('/bookmarks', authenticate, progressService.getBookmarks);
router.delete('/bookmarks/:id', authenticate, progressService.removeBookmark);

// ── ERROR LOG ─────────────────────────────────────────────────────────────────
router.get('/errors', authenticate, progressService.getErrors);
router.put('/errors/:id/review', authenticate, progressService.reviewError);

// ── SUBSCRIPTION ──────────────────────────────────────────────────────────────
router.get('/subscription/status', authenticate, subscriptionService.getStatus);
router.post('/subscription/checkout', authenticate, subscriptionService.checkout);
router.post('/subscription/verify', authenticate, subscriptionService.verify);

module.exports = router;
