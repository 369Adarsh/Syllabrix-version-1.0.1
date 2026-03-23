const currentAffairsSvc = require('./ai-current-affairs.service');
const mindmapSvc = require('./ai-mindmap.service');
const careerSvc = require('./ai-career-guidance.service');
const examSvc = require('./ai-exam.service');
const doubtSvc = require('./ai-doubt.service');
const experienceSvc = require('./ai-experience.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

// ─── Current Affairs ─────────────────────────────────────────
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

// ─── Mind Map (REDESIGNED — goal-oriented) ───────────────────
const generateMindMap = asyncHandler(async (req, res) => {
  const { topic, class_level, board, goal, depth, parent_context } = req.body;
  if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });

  const result = await mindmapSvc.generateMindMap(topic, {
    class_level,
    board,
    goal,
    depth: Math.min(depth || 2, 3), // Cap at 3 levels — NO infinite expansion
    parent_context,
  });

  sendSuccess(res, result);
});

// ─── Mind Map Notes (NEW — study notes for any node) ─────────
const getMindMapNotes = asyncHandler(async (req, res) => {
  const { topic, class_level, board, goal, parent_context } = req.body;
  if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });

  const notes = await mindmapSvc.generateTopicNotes(topic, {
    class_level,
    board,
    goal,
    parent_context,
  });

  sendSuccess(res, notes);
});

// ─── Career Guidance ─────────────────────────────────────────
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
  sendSuccess(res, { reply });
});

// ─── Exam Details ────────────────────────────────────────────
const getAIExamDetails = asyncHandler(async (req, res) => {
  const { exam_name } = req.query;
  if (!exam_name) return res.status(400).json({ success: false, message: 'exam_name is required' });
  sendSuccess(res, await examSvc.getExamDetails(exam_name));
});

// ─── Doubt Clearing ──────────────────────────────────────────
const clearDoubt = asyncHandler(async (req, res) => {
  const { question, context } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });
  const answer = await doubtSvc.clearDoubt(question, context);
  sendSuccess(res, { question, answer });
});

const doubtChat = asyncHandler(async (req, res) => {
  const { history, message, subject } = req.body;
  const reply = await doubtSvc.doubtChat(history || [], message, subject);
  sendSuccess(res, { reply });
});

// ─── Experience Lab Task Resources (NEW) ─────────────────────
const getTaskResources = asyncHandler(async (req, res) => {
  const { task_title, task_description, profession, level } = req.body;
  if (!task_title) return res.status(400).json({ success: false, message: 'task_title is required' });

  const resources = await experienceSvc.generateTaskResources(
    task_title,
    task_description,
    profession,
    level
  );

  sendSuccess(res, resources);
});

module.exports = {
  getAICurrentAffairs, getAICurrentAffairsRange, generateAffairs,
  generateMindMap, getMindMapNotes,
  getStreamGuidance, compareStreams, careerChat,
  getAIExamDetails,
  clearDoubt, doubtChat,
  getTaskResources,
};
