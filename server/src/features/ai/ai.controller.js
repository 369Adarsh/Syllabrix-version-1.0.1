const currentAffairsSvc = require('./ai-current-affairs.service');
const mindmapSvc = require('./ai-mindmap.service');
const careerSvc = require('./ai-career-guidance.service');
const examSvc = require('./ai-exam.service');
const doubtSvc = require('./ai-doubt.service');
const buddySvc = require('./ai-buddy.service');
const newsroomSvc = require('./ai-newsroom.service');
const quizGenSvc = require('./ai-quiz-generator.service');
const navigatorSvc = require('./ai-stream-navigator.service');
const labSvc = require('./ai-virtual-lab.service');
const interviewSvc = require('./ai-mock-interview.service');
const debateSvc = require('./ai-debate-arena.service');
const { pool } = require('../../database/connection');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

// ═══ CURRENT AFFAIRS ═══
const getAICurrentAffairs = asyncHandler(async (req, res) => {
  const date = req.query.date;
  sendSuccess(res, await currentAffairsSvc.getAffairsWithAI(date));
});

const getAICurrentAffairsRange = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 3;
  sendSuccess(res, await currentAffairsSvc.getAffairsForRange(Math.min(days, 30)));
});

const generateAffairs = asyncHandler(async (req, res) => {
  sendSuccess(res, await currentAffairsSvc.generateCurrentAffairs(req.body.date));
});

// ═══ MIND MAP — FIXED: accepts class/board/goal, caches in DB ═══
const generateMindMap = asyncHandler(async (req, res) => {
  const { topic, depth, class_level, board, goal } = req.body;
  if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });

  const result = await mindmapSvc.generateMindMap(topic, depth || 3, {
    class_level,
    board,
    goal,
    userId: req.user?.id,
  });
  sendSuccess(res, result);
});

// ═══ MIND MAP NOTES — NEW ENDPOINT ═══
const generateMindMapNotes = asyncHandler(async (req, res) => {
  const { topic, class_level, board, parent_topic } = req.body;
  if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });

  const notes = await mindmapSvc.generateTopicNotes(topic, { class_level, board, parent_topic });
  sendSuccess(res, notes);
});

// ═══ MIND MAP — CURRICULUM DRILL-DOWN ═══
const getSubjects = asyncHandler(async (req, res) => {
  const { class_level } = req.query;
  if (!class_level) return res.status(400).json({ success: false, message: 'class_level is required' });
  sendSuccess(res, mindmapSvc.getSubjects(class_level));
});

const getChapters = asyncHandler(async (req, res) => {
  const { class_level, board, subject } = req.query;
  if (!class_level || !subject) return res.status(400).json({ success: false, message: 'class_level and subject are required' });
  const chapters = await mindmapSvc.getChapters(class_level, board || 'CBSE', subject);
  sendSuccess(res, chapters);
});

const getTopics = asyncHandler(async (req, res) => {
  const { class_level, board, subject, chapter } = req.query;
  if (!class_level || !subject || !chapter) return res.status(400).json({ success: false, message: 'class_level, subject, and chapter are required' });
  const topics = await mindmapSvc.getTopics(class_level, board || 'CBSE', subject, chapter);
  sendSuccess(res, topics);
});

// ═══ MIND MAP — FLOWCHART MODE ═══
const generateFlowchart = asyncHandler(async (req, res) => {
  const { topic, class_level, board, subject, goal } = req.body;
  if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });
  const flowchart = await mindmapSvc.generateFlowchart(topic, { class_level, board, subject, goal });
  sendSuccess(res, flowchart);
});

// ═══ MIND MAP — DOUBT WITH DIAGRAM ═══
const explainWithDiagram = asyncHandler(async (req, res) => {
  const { question, class_level, board, subject, chapter } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });
  const explanation = await mindmapSvc.explainWithDiagram(question, { class_level, board, subject, chapter });
  sendSuccess(res, explanation);
});

// ═══ CAREER GUIDANCE ═══
const getStreamGuidance = asyncHandler(async (req, res) => {
  const { stream, interests, current_class } = req.body;
  if (!stream) return res.status(400).json({ success: false, message: 'Stream is required' });
  sendSuccess(res, await careerSvc.streamGuidance(stream, interests, current_class));
});

const compareStreams = asyncHandler(async (req, res) => {
  const { stream1, stream2, interests } = req.body;
  sendSuccess(res, await careerSvc.compareStreams(stream1, stream2, interests));
});

const careerChat = asyncHandler(async (req, res) => {
  const { history, message } = req.body;
  const reply = await careerSvc.careerChat(history || [], message);

  // Persist chat if user is logged in
  if (req.user?.id && message) {
    try {
      // Find or create session
      let sessionId;
      const [existing] = await pool.query(
        `SELECT id FROM ai_chat_sessions WHERE user_id = ? AND session_type = 'career' AND last_message_at > DATE_SUB(NOW(), INTERVAL 1 HOUR) ORDER BY last_message_at DESC LIMIT 1`,
        [req.user.id]
      );
      if (existing.length > 0) {
        sessionId = existing[0].id;
      } else {
        const [ins] = await pool.query(
          `INSERT INTO ai_chat_sessions (user_id, session_type, title) VALUES (?, 'career', ?)`,
          [req.user.id, message.slice(0, 100)]
        );
        sessionId = ins.insertId;
      }
      // Save messages
      await pool.query(`INSERT INTO ai_chat_messages (session_id, role, content) VALUES (?, 'user', ?), (?, 'assistant', ?)`,
        [sessionId, message, sessionId, reply]);
      await pool.query(`UPDATE ai_chat_sessions SET message_count = message_count + 2, last_message_at = NOW() WHERE id = ?`, [sessionId]);
    } catch (e) { /* Chat persistence is optional — don't fail the request */ }
  }

  sendSuccess(res, { reply });
});

// ═══ EXAM DETAILS ═══
const getAIExamDetails = asyncHandler(async (req, res) => {
  const examName = req.query.exam_name;
  if (!examName) return res.status(400).json({ success: false, message: 'exam_name is required' });
  sendSuccess(res, await examSvc.getExamDetails(examName));
});

// ═══ DOUBT CLEARING ═══
const clearDoubt = asyncHandler(async (req, res) => {
  const { question, context } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });
  const answer = await doubtSvc.clearDoubt(question, context);
  sendSuccess(res, { answer });
});

const doubtChat = asyncHandler(async (req, res) => {
  const { history, message, subject } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
  const reply = await doubtSvc.doubtChat(history || [], message, subject);

  // Persist chat
  if (req.user?.id) {
    try {
      let sessionId;
      const [existing] = await pool.query(
        `SELECT id FROM ai_chat_sessions WHERE user_id = ? AND session_type = 'doubt' AND subject = ? AND last_message_at > DATE_SUB(NOW(), INTERVAL 1 HOUR) ORDER BY last_message_at DESC LIMIT 1`,
        [req.user.id, subject || 'General']
      );
      if (existing.length > 0) {
        sessionId = existing[0].id;
      } else {
        const [ins] = await pool.query(
          `INSERT INTO ai_chat_sessions (user_id, session_type, title, subject) VALUES (?, 'doubt', ?, ?)`,
          [req.user.id, message.slice(0, 100), subject || 'General']
        );
        sessionId = ins.insertId;
      }
      await pool.query(`INSERT INTO ai_chat_messages (session_id, role, content) VALUES (?, 'user', ?), (?, 'assistant', ?)`,
        [sessionId, message, sessionId, reply]);
      await pool.query(`UPDATE ai_chat_sessions SET message_count = message_count + 2, last_message_at = NOW() WHERE id = ?`, [sessionId]);
    } catch (e) { /* optional */ }
  }

  sendSuccess(res, { reply });
});

// ═══ AI BUDDY CHAT — PERSISTENT ═══
const buddyChat = asyncHandler(async (req, res) => {
  const { message, session_id, class_level, board, subject } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

  // Load history from session if resuming
  let history = [];
  let sessionId = session_id;

  if (sessionId) {
    try {
      const [msgs] = await pool.query(
        `SELECT role, content FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 40`,
        [sessionId]
      );
      history = msgs.map(m => ({ role: m.role === 'assistant' ? 'model' : m.role, content: m.content }));
    } catch (e) { /* fresh history */ }
  }

  // Generate reply
  const { reply, intent } = await buddySvc.buddyChat(history, message, { class_level, board, subject });

  // Persist to database
  if (req.user?.id) {
    try {
      if (!sessionId) {
        // Create new session
        const title = buddySvc.generateTitle(message);
        const [ins] = await pool.query(
          `INSERT INTO ai_chat_sessions (user_id, session_type, title, subject, last_message_at) VALUES (?, 'buddy', ?, ?, NOW())`,
          [req.user.id, title, intent]
        );
        sessionId = ins.insertId;
      }

      // Save both messages
      await pool.query(
        `INSERT INTO ai_chat_messages (session_id, role, content) VALUES (?, 'user', ?), (?, 'assistant', ?)`,
        [sessionId, message, sessionId, reply]
      );
      await pool.query(
        `UPDATE ai_chat_sessions SET message_count = message_count + 2, last_message_at = NOW() WHERE id = ?`,
        [sessionId]
      );
    } catch (e) {
      console.log('[BuddyChat] Persistence error:', e.message);
    }
  }

  sendSuccess(res, { reply, session_id: sessionId, intent });
});

// ═══ SESSION MANAGEMENT ═══
const createSession = asyncHandler(async (req, res) => {
  const { session_type, title, subject } = req.body;
  const [result] = await pool.query(
    `INSERT INTO ai_chat_sessions (user_id, session_type, title, subject, last_message_at) VALUES (?, ?, ?, ?, NOW())`,
    [req.user.id, session_type || 'buddy', title || 'New Chat', subject || null]
  );
  sendSuccess(res, { id: result.insertId, session_type: session_type || 'buddy', title: title || 'New Chat' });
});

const deleteSession = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId;
  // Verify ownership
  const [session] = await pool.query(`SELECT user_id FROM ai_chat_sessions WHERE id = ?`, [sessionId]);
  if (!session.length || session[0].user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  await pool.query(`DELETE FROM ai_chat_sessions WHERE id = ?`, [sessionId]);
  sendSuccess(res, { deleted: true });
});

const updateSessionTitle = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId;
  const { title } = req.body;
  const [session] = await pool.query(`SELECT user_id FROM ai_chat_sessions WHERE id = ?`, [sessionId]);
  if (!session.length || session[0].user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  await pool.query(`UPDATE ai_chat_sessions SET title = ? WHERE id = ?`, [title, sessionId]);
  sendSuccess(res, { updated: true });
});

const clearSessions = asyncHandler(async (req, res) => {
  const { type } = req.query;
  if (!type) return res.status(400).json({ success: false, message: 'Type is required' });
  await pool.query(`DELETE FROM ai_chat_sessions WHERE user_id = ? AND session_type = ?`, [req.user.id, type]);
  sendSuccess(res, { cleared: true });
});


// ═══ CHAT HISTORY — NEW ENDPOINTS ═══
const getChatSessions = asyncHandler(async (req, res) => {
  const type = req.query.type || 'buddy';
  const [sessions] = await pool.query(
    `SELECT id, session_type, title, subject, message_count, last_message_at, created_at FROM ai_chat_sessions WHERE user_id = ? AND session_type = ? ORDER BY last_message_at DESC LIMIT 20`,
    [req.user.id, type]
  );
  sendSuccess(res, sessions);
});

const getChatMessages = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId;
  // Verify ownership
  const [session] = await pool.query(`SELECT user_id FROM ai_chat_sessions WHERE id = ?`, [sessionId]);
  if (!session.length || session[0].user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  const [messages] = await pool.query(
    `SELECT id, role, content, created_at FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC`,
    [sessionId]
  );
  sendSuccess(res, messages);
});

// ═══ NEWSROOM — MILESTONE 2 ═══
const getNewsroom = asyncHandler(async (req, res) => {
  const { date, days, category, importance, page, limit } = req.query;
  const result = await newsroomSvc.getNewsroomArticles({
    date, days: parseInt(days) || 1, category, importance,
    page: parseInt(page) || 1, limit: parseInt(limit) || 20,
  });
  sendSuccess(res, result);
});

const generateNewsroom = asyncHandler(async (req, res) => {
  const { date, category } = req.body;
  const articles = await newsroomSvc.generateNewsroomEdition(date, category);
  sendSuccess(res, articles);
});

const expandArticle = asyncHandler(async (req, res) => {
  const { headline, category } = req.body;
  if (!headline) return res.status(400).json({ success: false, message: 'Headline is required' });
  const expanded = await newsroomSvc.expandArticle(headline, category);
  sendSuccess(res, expanded);
});

const getMonthlyCompilation = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const y = parseInt(year) || new Date().getFullYear();
  const m = parseInt(month) || new Date().getMonth() + 1;
  const compilation = await newsroomSvc.generateMonthlyCompilation(y, m);
  sendSuccess(res, compilation);
});

const getNewsSources = asyncHandler(async (req, res) => {
  sendSuccess(res, newsroomSvc.NEWS_SOURCES);
});

const getNewsCategories = asyncHandler(async (req, res) => {
  sendSuccess(res, newsroomSvc.ALL_CATEGORIES);
});

// ═══ AUTO QUIZ GENERATOR — MILESTONE 2 ═══
const autoGenerateDailyQuiz = asyncHandler(async (req, res) => {
  const { date } = req.body;
  const result = await quizGenSvc.generateDailyQuiz(date);
  sendSuccess(res, result);
});

const generateTopicQuiz = asyncHandler(async (req, res) => {
  const { topic, difficulty, count, exam, class_level, subject } = req.body;
  if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });
  const result = await quizGenSvc.generateTopicQuiz(topic, { difficulty, count, exam, class_level, subject });
  sendSuccess(res, result);
});

const generateWeeklyChallenge = asyncHandler(async (req, res) => {
  const result = await quizGenSvc.generateWeeklyChallenge();
  sendSuccess(res, result);
});

// ═══ STREAM & FUTURE NAVIGATOR — MILESTONE 2 ═══
const getAptitudeQuestions = asyncHandler(async (req, res) => {
  sendSuccess(res, navigatorSvc.getAptitudeQuestions());
});

const submitAptitudeAssessment = asyncHandler(async (req, res) => {
  const { answers, class_level, board } = req.body;
  if (!answers) return res.status(400).json({ success: false, message: 'Answers are required' });
  const result = await navigatorSvc.runAptitudeAssessment(answers, { class_level, board });
  sendSuccess(res, result);
});

const generateAlignmentReport = asyncHandler(async (req, res) => {
  const { student_data, parent_data } = req.body;
  if (!student_data || !parent_data) return res.status(400).json({ success: false, message: 'Both student and parent data required' });
  const report = await navigatorSvc.generateAlignmentReport(student_data, parent_data);
  sendSuccess(res, report);
});

const generateCareerRoadmap = asyncHandler(async (req, res) => {
  const { career, class_level, stream } = req.body;
  if (!career) return res.status(400).json({ success: false, message: 'Career is required' });
  const roadmap = await navigatorSvc.generateCareerRoadmap(career, { class_level, stream });
  sendSuccess(res, roadmap);
});

// ═══ MILESTONE 5 — VIRTUAL LAB ═══
const getLabSubjects = asyncHandler(async (req, res) => {
  sendSuccess(res, labSvc.LAB_SUBJECTS);
});

const getLabExperiments = asyncHandler(async (req, res) => {
  const { subject, class_level } = req.query;
  if (!subject) return res.status(400).json({ success: false, message: 'Subject required' });
  const experiments = await labSvc.getExperiments(subject, class_level);
  sendSuccess(res, experiments);
});

const generateExperiment = asyncHandler(async (req, res) => {
  const { subject, experiment, class_level, difficulty } = req.body;
  if (!subject || !experiment) return res.status(400).json({ success: false, message: 'Subject and experiment required' });
  const result = await labSvc.generateExperiment(subject, experiment, { class_level, difficulty });
  sendSuccess(res, result);
});

const getLabVisualization = asyncHandler(async (req, res) => {
  const { experiment, step } = req.query;
  const viz = await labSvc.getVisualization(experiment, step);
  sendSuccess(res, viz);
});

// ═══ MILESTONE 5 — MOCK INTERVIEW ═══
const getInterviewTypes = asyncHandler(async (req, res) => {
  sendSuccess(res, interviewSvc.INTERVIEW_TYPES);
});

const startInterview = asyncHandler(async (req, res) => {
  const { type, name, background, career_goal, class_level } = req.body;
  if (!type) return res.status(400).json({ success: false, message: 'Interview type required' });
  const result = await interviewSvc.startInterview(type, { name, background, career_goal, class_level });
  sendSuccess(res, result);
});

const evaluateInterviewAnswer = asyncHandler(async (req, res) => {
  const { type, question, answer, history } = req.body;
  if (!question || !answer) return res.status(400).json({ success: false, message: 'Question and answer required' });
  const result = await interviewSvc.evaluateAnswer(type, question, answer, history);
  sendSuccess(res, result);
});

const getInterviewReport = asyncHandler(async (req, res) => {
  const { type, history } = req.body;
  if (!history?.length) return res.status(400).json({ success: false, message: 'Interview history required' });
  const report = await interviewSvc.generateReport(type, history);
  sendSuccess(res, report);
});

// ═══ MILESTONE 5 — DEBATE ARENA ═══
const getDebateCategories = asyncHandler(async (req, res) => {
  sendSuccess(res, debateSvc.DEBATE_CATEGORIES);
});

const getTrendingDebateTopics = asyncHandler(async (req, res) => {
  const topics = await debateSvc.getTrendingTopics();
  sendSuccess(res, topics);
});

const generateDebateTopic = asyncHandler(async (req, res) => {
  const { category, class_level, difficulty } = req.body;
  const topic = await debateSvc.generateTopic(category, { class_level, difficulty });
  sendSuccess(res, topic);
});

const debateRespond = asyncHandler(async (req, res) => {
  const { topic, student_side, argument, history } = req.body;
  if (!topic || !argument) return res.status(400).json({ success: false, message: 'Topic and argument required' });
  const response = await debateSvc.debateRespond(topic, student_side, argument, history);
  sendSuccess(res, response);
});

const evaluateDebate = asyncHandler(async (req, res) => {
  const { topic, student_side, history } = req.body;
  if (!history?.length) return res.status(400).json({ success: false, message: 'Debate history required' });
  const result = await debateSvc.evaluateDebate(topic, student_side, history);
  sendSuccess(res, result);
});

module.exports = {
  getAICurrentAffairs, getAICurrentAffairsRange, generateAffairs,
  generateMindMap, generateMindMapNotes,
  getSubjects, getChapters, getTopics,
  generateFlowchart, explainWithDiagram,
  buddyChat, createSession, deleteSession, clearSessions, updateSessionTitle,
  getStreamGuidance, compareStreams, careerChat,
  getAIExamDetails,
  clearDoubt, doubtChat,
  getChatSessions, getChatMessages,
  // Milestone 2
  getNewsroom, generateNewsroom, expandArticle, getMonthlyCompilation, getNewsSources, getNewsCategories,
  autoGenerateDailyQuiz, generateTopicQuiz, generateWeeklyChallenge,
  getAptitudeQuestions, submitAptitudeAssessment, generateAlignmentReport, generateCareerRoadmap,
  // Milestone 5
  getLabSubjects, getLabExperiments, generateExperiment, getLabVisualization,
  getInterviewTypes, startInterview, evaluateInterviewAnswer, getInterviewReport,
  getDebateCategories, getTrendingDebateTopics, generateDebateTopic, debateRespond, evaluateDebate,
};
