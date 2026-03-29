const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const controller = require('./library.controller');

// ─────────────────────────────────────────────────────────────────────────────
// SCHOOL LIBRARY — Boards, classes, subjects, books, chapters, topics
// All public (no auth required for browsing)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/library/boards
router.get('/boards', controller.getBoards);

// GET /api/library/boards/:boardCode
router.get('/boards/:boardCode', controller.getBoardByCode);

// GET /api/library/boards/:boardCode/syllabus
router.get('/boards/:boardCode/syllabus', controller.getSyllabusVersions);

// GET /api/library/boards/:boardCode/classes  [?syllabusVersionId=X]
router.get('/boards/:boardCode/classes', controller.getClasses);

// GET /api/library/classes/:classId/subjects
router.get('/classes/:classId/subjects', controller.getSubjects);

// GET /api/library/subjects/:subjectId/books
router.get('/subjects/:subjectId/books', controller.getBooks);

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: static routes like /books/recommend MUST come before /:bookId
// so Express doesn't treat "recommend" as a bookId param
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/library/books/recommend  [?examCode=&subject=&subCategory=&classLevel=]
router.get('/books/recommend', controller.recommendBooks);

// GET /api/library/books/:bookId/chapters
router.get('/books/:bookId/chapters', controller.getChapters);

// GET /api/library/chapters/:chapterId/topics
router.get('/chapters/:chapterId/topics', controller.getTopics);

// ─────────────────────────────────────────────────────────────────────────────
// COMPETITIVE EXAMS — Exam categories, competitive subjects, competitive books
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/library/exams
router.get('/exams', controller.getExams);

// GET /api/library/exams/:examCode
router.get('/exams/:examCode', controller.getExamByCode);

// GET /api/library/exams/:examCode/subjects
router.get('/exams/:examCode/subjects', controller.getExamSubjects);

// GET /api/library/exams/:examCode/books  [?priority=1]
router.get('/exams/:examCode/books', controller.getExamBooks);

// ─────────────────────────────────────────────────────────────────────────────
// PUBLISHERS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/library/publishers
router.get('/publishers', controller.getPublishers);

// GET /api/library/publishers/:id/books
router.get('/publishers/:id/books', controller.getPublisherBooks);

// ─────────────────────────────────────────────────────────────────────────────
// AI ENDPOINTS — require authentication
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/library/ask
router.post('/ask', authenticate, controller.askAI);

module.exports = router;
