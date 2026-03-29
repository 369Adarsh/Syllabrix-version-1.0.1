const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const controller = require('./library.controller');

// ── Browse endpoints (public) ──────────────────────────────────────────────────
// GET /api/library/boards
router.get('/boards', controller.getBoards);

// GET /api/library/boards/:boardCode
router.get('/boards/:boardCode', controller.getBoardByCode);

// GET /api/library/boards/:boardCode/syllabus
router.get('/boards/:boardCode/syllabus', controller.getSyllabusVersions);

// GET /api/library/boards/:boardCode/classes
router.get('/boards/:boardCode/classes', controller.getClasses);

// GET /api/library/classes/:classId/subjects
router.get('/classes/:classId/subjects', controller.getSubjects);

// GET /api/library/subjects/:subjectId/books
router.get('/subjects/:subjectId/books', controller.getBooks);

// GET /api/library/books/:bookId/chapters
router.get('/books/:bookId/chapters', controller.getChapters);

// GET /api/library/chapters/:chapterId/topics
router.get('/chapters/:chapterId/topics', controller.getTopics);

// ── AI endpoint (requires auth) ────────────────────────────────────────────────
// POST /api/library/ask
router.post('/ask', authenticate, controller.askAI);

module.exports = router;
