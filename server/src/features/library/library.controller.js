const service = require('./library.service');
const aiLibraryService = require('../../services/ai-library.service');
const { sendSuccess } = require('../../utils/api-response');

// ─── School Library ───────────────────────────────────────────────────────────

const getBoards = async (req, res, next) => {
  try {
    const boards = await service.getBoards();
    res.json({ success: true, data: boards });
  } catch (err) { next(err); }
};

const getBoardByCode = async (req, res, next) => {
  try {
    const board = await service.getBoardByCode(req.params.boardCode);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found' });
    res.json({ success: true, data: board });
  } catch (err) { next(err); }
};

const getSyllabusVersions = async (req, res, next) => {
  try {
    const versions = await service.getSyllabusVersions(req.params.boardCode);
    res.json({ success: true, data: versions });
  } catch (err) { next(err); }
};

const getClasses = async (req, res, next) => {
  try {
    const { syllabusVersionId } = req.query;
    const classes = await service.getClasses(req.params.boardCode, syllabusVersionId ? Number(syllabusVersionId) : null);
    res.json({ success: true, data: classes });
  } catch (err) { next(err); }
};

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await service.getSubjects(Number(req.params.classId));
    res.json({ success: true, data: subjects });
  } catch (err) { next(err); }
};

const getBooks = async (req, res, next) => {
  try {
    const books = await service.getBooks(Number(req.params.subjectId));
    res.json({ success: true, data: books });
  } catch (err) { next(err); }
};

const getChapters = async (req, res, next) => {
  try {
    const chapters = await service.getChapters(Number(req.params.bookId));
    res.json({ success: true, data: chapters });
  } catch (err) { next(err); }
};

const getTopics = async (req, res, next) => {
  try {
    const topics = await service.getTopics(Number(req.params.chapterId));
    res.json({ success: true, data: topics });
  } catch (err) { next(err); }
};

// ─── Competitive Exams ───────────────────────────────────────────────────────

const getExams = async (req, res, next) => {
  try {
    const exams = await service.getExams();
    res.json({ success: true, data: exams });
  } catch (err) { next(err); }
};

const getExamByCode = async (req, res, next) => {
  try {
    const exam = await service.getExamByCode(req.params.examCode);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: exam });
  } catch (err) { next(err); }
};

const getExamSubjects = async (req, res, next) => {
  try {
    const subjects = await service.getExamSubjects(req.params.examCode);
    res.json({ success: true, data: subjects });
  } catch (err) { next(err); }
};

const getExamBooks = async (req, res, next) => {
  try {
    const { priority } = req.query;
    const books = await service.getExamBooks(req.params.examCode, priority ? Number(priority) : null);
    res.json({ success: true, data: books });
  } catch (err) { next(err); }
};

// ─── Publishers ───────────────────────────────────────────────────────────────

const getPublishers = async (req, res, next) => {
  try {
    const publishers = await service.getPublishers();
    res.json({ success: true, data: publishers });
  } catch (err) { next(err); }
};

const getPublisherBooks = async (req, res, next) => {
  try {
    const books = await service.getPublisherBooks(Number(req.params.id));
    res.json({ success: true, data: books });
  } catch (err) { next(err); }
};

// ─── Smart Recommendation ─────────────────────────────────────────────────────

const recommendBooks = async (req, res, next) => {
  try {
    const { examCode, subject, subCategory, classLevel } = req.query;
    if (!examCode) return res.status(400).json({ success: false, message: 'examCode is required' });

    const books = await service.getRecommendedBooks({ examCode, subject, subCategory, classLevel });
    res.json({ success: true, data: books });
  } catch (err) { next(err); }
};

// ─── AI Ask ──────────────────────────────────────────────────────────────────

const askAI = async (req, res, next) => {
  try {
    const {
      boardCode,
      syllabusVersionId,
      grade,
      subjectId,
      chapterId,
      topicId,
      examCode,
      studentQuery,
      studentClass,
    } = req.body;

    if (!studentQuery || (!subjectId && !examCode)) {
      return res.status(400).json({
        success: false,
        message: 'studentQuery and either subjectId or examCode are required',
      });
    }

    const result = await aiLibraryService.ask({
      boardCode,
      syllabusVersionId: syllabusVersionId ? Number(syllabusVersionId) : null,
      grade:     grade     ? Number(grade)     : null,
      subjectId: subjectId ? Number(subjectId) : null,
      chapterId: chapterId ? Number(chapterId) : null,
      topicId:   topicId   ? Number(topicId)   : null,
      examCode,
      studentQuery,
      studentClass,
      userId: req.user?.id,
    });

    sendSuccess(res, result, 'AI response generated');
  } catch (err) { next(err); }
};

module.exports = {
  getBoards, getBoardByCode, getSyllabusVersions, getClasses, getSubjects,
  getBooks, getChapters, getTopics,
  getExams, getExamByCode, getExamSubjects, getExamBooks,
  getPublishers, getPublisherBooks,
  recommendBooks,
  askAI,
};
