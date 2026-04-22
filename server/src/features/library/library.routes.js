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
// UNIVERSITY LAYER — universities, courses, subjects, books
// All public (no auth required for browsing)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/library/universities
router.get('/universities', controller.getUniversities);

// GET /api/library/universities/:id
router.get('/universities/:id', controller.getUniversity);

// GET /api/library/universities/:id/courses
router.get('/universities/:id/courses', controller.getUniversityCourses);

// GET /api/library/course-categories
router.get('/course-categories', controller.getCourseCategories);

// GET /api/library/courses  [?level=bachelor|master|...]
router.get('/courses', controller.getCourses);

// GET /api/library/courses/:id/subjects  [?semester=3]
router.get('/courses/:id/subjects', controller.getCourseSubjects);

// GET /api/library/university-books/recommend  [?courseId=&subjectName=&university=&semester=]
// IMPORTANT: static route must come before /:id
router.get('/university-books/recommend', controller.getUniversityBooksRecommend);

// GET /api/library/university-subjects/:id/books
router.get('/university-subjects/:id/books', controller.getUniversitySubjectBooks);

// GET /api/library/university-subjects/:id/chapters
router.get('/university-subjects/:id/chapters', controller.getSubjectChapters);

// GET /api/library/university-chapters/:id/topics
router.get('/university-chapters/:id/topics', controller.getChapterTopics);

// GET /api/library/university-books/:id/chapters  (book TOC)
router.get('/university-books/:id/chapters', controller.getBookChapters);

// GET /api/library/university-chapters/:id/books  (books covering this chapter's subject)
router.get('/university-chapters/:id/books', controller.getChapterBooks);

// ─────────────────────────────────────────────────────────────────────────────
// NCERT TOC — public, no auth required
// GET /api/library/ncert-toc?class=10&subject=maths[&state=delhi]
// ─────────────────────────────────────────────────────────────────────────────

router.get('/ncert-toc', controller.getNCERTToc);

// GET /api/library/smart-chapters?board=cbse&class=10&subject=maths
// GET /api/library/smart-chapters?exam=JEE&subject=Physics
router.get('/smart-chapters', controller.getSmartChapters);

// ─────────────────────────────────────────────────────────────────────────────
// AI ENDPOINTS — require authentication
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/library/ask
router.post('/ask', authenticate, controller.askAI);

// POST /api/library/generate/chapter
// Body: { board, grade, subject, chapterName, chapterNumber, topics[], syllabusVersion }
router.post('/generate/chapter', authenticate, controller.generateChapter);

module.exports = router;
