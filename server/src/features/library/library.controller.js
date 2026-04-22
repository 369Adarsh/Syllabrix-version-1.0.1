const service = require('./library.service');
const aiLibraryService = require('../../services/ai-library.service');
const ncertExtractor = require('../../services/ncert-extractor.service');
const { getSmartChapters: smartChaptersSvc } = require('../../services/smart-chapters.service');
const { generateChapter: generateChapterSvc } = require('../../services/generate-chapter.service');
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

// ─── University Layer ─────────────────────────────────────────────────────────

const getUniversities = async (req, res, next) => {
  try {
    const data = await service.getUniversities();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getUniversity = async (req, res, next) => {
  try {
    const uni = await service.getUniversity(Number(req.params.id));
    if (!uni) return res.status(404).json({ success: false, message: 'University not found' });
    res.json({ success: true, data: uni });
  } catch (err) { next(err); }
};

const getUniversityCourses = async (req, res, next) => {
  try {
    const data = await service.getUniversityCourses(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getCourseCategories = async (req, res, next) => {
  try {
    const data = await service.getCourseCategories();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getCourses = async (req, res, next) => {
  try {
    const { level } = req.query;
    const data = await service.getCourses(level || null);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getCourseSubjects = async (req, res, next) => {
  try {
    const { semester } = req.query;
    const data = await service.getCourseSubjects(
      Number(req.params.id),
      semester ? Number(semester) : null
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getUniversitySubjectBooks = async (req, res, next) => {
  try {
    const data = await service.getUniversitySubjectBooks(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getUniversityBooksRecommend = async (req, res, next) => {
  try {
    const { courseId, subjectName, university, semester } = req.query;
    const data = await service.getUniversityBooksRecommend({
      courseId:    courseId    ? Number(courseId)    : null,
      subjectName: subjectName || null,
      university:  university  || null,
      semester:    semester    ? Number(semester)    : null,
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ─── Chapters, Topics, Book TOC ──────────────────────────────────────────────

const getSubjectChapters = async (req, res, next) => {
  try {
    const data = await service.getSubjectChapters(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getChapterTopics = async (req, res, next) => {
  try {
    const data = await service.getChapterTopics(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getBookChapters = async (req, res, next) => {
  try {
    const data = await service.getBookChapters(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getChapterBooks = async (req, res, next) => {
  try {
    const data = await service.getChapterBooks(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ─── NCERT TOC ───────────────────────────────────────────────────────────────

const getNCERTToc = async (req, res, next) => {
  try {
    const { class: grade, subject, state } = req.query;
    if (!grade || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Query params "class" (1-12) and "subject" are required. E.g. ?class=10&subject=maths',
      });
    }
    const gradeNum = Number(grade);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      return res.status(400).json({ success: false, message: '"class" must be a number between 1 and 12.' });
    }
    const data = await ncertExtractor.getTOC(gradeNum, subject, state || '');
    sendSuccess(res, data, 'NCERT TOC retrieved');
  } catch (err) { next(err); }
};

// ─── Smart Chapters ──────────────────────────────────────────────────────

const getSmartChapters = async (req, res, next) => {
  try {
    const { board, class: grade, subject, exam, version } = req.query;
    if (!subject && !exam) {
      return res.status(400).json({ success: false, message: 'subject or exam is required' });
    }
    const data = await smartChaptersSvc({
      board:   board   || null,
      grade:   grade   ? Number(grade) : null,
      subject: subject || null,
      exam:    exam    || null,
      version: version || 'latest',
    });
    sendSuccess(res, data, 'Chapters retrieved');
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
      subjectName,
      chapterId,
      topicId,
      examCode,
      universitySubjectId,
      universityTopicId,
      studentQuery,
      studentClass,
      version,
    } = req.body;

    if (!studentQuery || (!subjectId && !examCode && !universitySubjectId && !universityTopicId && !subjectName)) {
      return res.status(400).json({
        success: false,
        message: 'studentQuery and at least one subject tracker (subjectId/Name, examCode, etc) are required',
      });
    }

    const parseId = (val) => (val && typeof val === 'string' && val.startsWith('fb')) ? val : (val ? Number(val) : null);

    const result = await aiLibraryService.ask({
      boardCode,
      syllabusVersionId:    parseId(syllabusVersionId),
      grade:                grade ? Number(grade) : null,
      subjectId:            parseId(subjectId),
      subjectName,
      chapterId:            parseId(chapterId),
      topicId:              parseId(topicId),
      examCode,
      universitySubjectId:  parseId(universitySubjectId),
      universityTopicId:    parseId(universityTopicId),
      studentQuery,
      studentClass,
      version,
      userId: req.user?.id,
    });

    sendSuccess(res, result, 'AI response generated');
  } catch (err) { next(err); }
};

// ─── Generate Chapter ────────────────────────────────────────────────────────

const generateChapter = async (req, res, next) => {
  try {
    const { board, grade, subject, chapterName, chapterNumber, topics, syllabusVersion } = req.body;
    if (!subject || !chapterName) {
      return res.status(400).json({ success: false, message: 'subject and chapterName are required' });
    }
    const data = await generateChapterSvc({
      board:           board           || null,
      grade:           grade           ? Number(grade) : null,
      subject,
      chapterName,
      chapterNumber:   chapterNumber   ? Number(chapterNumber) : null,
      topics:          Array.isArray(topics) ? topics : [],
      syllabusVersion: syllabusVersion || 'latest',
    });
    sendSuccess(res, data, 'Chapter generated');
  } catch (err) { next(err); }
};

module.exports = {
  getBoards, getBoardByCode, getSyllabusVersions, getClasses, getSubjects,
  getBooks, getChapters, getTopics,
  getExams, getExamByCode, getExamSubjects, getExamBooks,
  getPublishers, getPublisherBooks,
  recommendBooks,
  // university layer
  getUniversities, getUniversity, getUniversityCourses,
  getCourseCategories, getCourses, getCourseSubjects,
  getUniversitySubjectBooks, getUniversityBooksRecommend,
  // chapters + topics + TOC
  getSubjectChapters, getChapterTopics, getBookChapters, getChapterBooks,
  // NCERT
  getNCERTToc,
  // Smart Chapters
  getSmartChapters,
  askAI,
  generateChapter,
};
