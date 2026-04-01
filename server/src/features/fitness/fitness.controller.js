// ============================================================
// Fitness Module — Controller
// Parse request → call service → send response
// ============================================================

const service = require('./fitness.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

// ─── Profile ─────────────────────────────────────────────────

const getProfile = asyncHandler(async (req, res) => {
  const data = await service.getProfile(req.user.id);
  sendSuccess(res, data);
});

const saveProfile = asyncHandler(async (req, res) => {
  const data = await service.saveProfile(req.user.id, req.body);
  sendSuccess(res, data, 'Fitness profile saved!');
});

// ─── Dashboard ───────────────────────────────────────────────

const getDashboard = asyncHandler(async (req, res) => {
  const data = await service.getDashboard(req.user.id);
  sendSuccess(res, data);
});

// ─── AI Coach ────────────────────────────────────────────────

const chatWithCoach = asyncHandler(async (req, res) => {
  const { history, message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
  const data = await service.chatWithCoach(req.user.id, history || [], message);
  sendSuccess(res, data);
});

// ─── Workouts ────────────────────────────────────────────────

const generateWorkout = asyncHandler(async (req, res) => {
  const data = await service.generateWorkout(req.user.id, req.body);
  sendCreated(res, data, 'Workout plan generated!');
});

const getUserWorkouts = asyncHandler(async (req, res) => {
  const data = await service.getUserWorkouts(req.user.id);
  sendSuccess(res, data);
});

const getWorkoutDetail = asyncHandler(async (req, res) => {
  const data = await service.getWorkoutDetail(Number(req.params.id));
  if (!data) return res.status(404).json({ success: false, message: 'Workout plan not found' });
  sendSuccess(res, data);
});

const completeWorkout = asyncHandler(async (req, res) => {
  await service.completeWorkout(Number(req.params.dayId), req.user.id);
  sendSuccess(res, null, 'Workout completed! 🎉');
});

// ─── Diet ────────────────────────────────────────────────────

const generateDiet = asyncHandler(async (req, res) => {
  const data = await service.generateDiet(req.user.id, req.body);
  sendCreated(res, data, 'Diet plan generated!');
});

const getTodayDiet = asyncHandler(async (req, res) => {
  const data = await service.getTodayDiet(req.user.id);
  sendSuccess(res, data);
});

// ─── Check-in ────────────────────────────────────────────────

const checkIn = asyncHandler(async (req, res) => {
  const data = await service.checkIn(req.user.id, req.body);
  sendSuccess(res, data, 'Check-in saved!');
});

const getTodayCheckin = asyncHandler(async (req, res) => {
  const data = await service.getTodayCheckin(req.user.id);
  sendSuccess(res, data);
});

// ─── Habits ──────────────────────────────────────────────────

const getHabitTemplates = asyncHandler(async (req, res) => {
  const data = await service.getHabitTemplates();
  sendSuccess(res, data);
});

const getUserHabits = asyncHandler(async (req, res) => {
  const data = await service.getUserHabits(req.user.id);
  sendSuccess(res, data);
});

const enrollHabit = asyncHandler(async (req, res) => {
  const { template_id, custom_target } = req.body;
  if (!template_id) return res.status(400).json({ success: false, message: 'template_id is required' });
  const data = await service.enrollHabit(req.user.id, template_id, custom_target);
  sendSuccess(res, data, 'Habit enrolled!');
});

const logHabit = asyncHandler(async (req, res) => {
  const { value } = req.body;
  await service.logHabit(Number(req.params.id), value, req.user.id);
  sendSuccess(res, null, 'Habit logged! 🔥');
});

// ─── Progress ────────────────────────────────────────────────

const getProgress = asyncHandler(async (req, res) => {
  const data = await service.getProgress(req.user.id);
  sendSuccess(res, data);
});

const logProgress = asyncHandler(async (req, res) => {
  const data = await service.logProgress(req.user.id, req.body);
  sendSuccess(res, data, 'Progress logged!');
});

// ─── Exercises ───────────────────────────────────────────────

const getExercises = asyncHandler(async (req, res) => {
  const data = await service.getExercises(req.query);
  sendSuccess(res, data);
});

const getExerciseById = asyncHandler(async (req, res) => {
  const data = await service.getExerciseById(Number(req.params.id));
  if (!data) return res.status(404).json({ success: false, message: 'Exercise not found' });
  sendSuccess(res, data);
});

// ─── Articles ────────────────────────────────────────────────

const getArticleCategories = asyncHandler(async (req, res) => {
  const data = await service.getArticleCategories();
  sendSuccess(res, data);
});

const getArticles = asyncHandler(async (req, res) => {
  const data = await service.getArticles(req.query);
  sendSuccess(res, data);
});

const getArticleById = asyncHandler(async (req, res) => {
  const data = await service.getArticleById(Number(req.params.id));
  if (!data) return res.status(404).json({ success: false, message: 'Article not found' });
  sendSuccess(res, data);
});

// ─── News ────────────────────────────────────────────────────

const getNews = asyncHandler(async (req, res) => {
  const data = await service.getNews(Number(req.query.limit) || 20);
  sendSuccess(res, data);
});

// ─── Coaches ─────────────────────────────────────────────────

const getCoaches = asyncHandler(async (req, res) => {
  const data = await service.getCoaches(req.query);
  sendSuccess(res, data);
});

const getCoachById = asyncHandler(async (req, res) => {
  const data = await service.getCoachById(Number(req.params.id));
  if (!data) return res.status(404).json({ success: false, message: 'Coach not found' });
  sendSuccess(res, data);
});

const applyAsCoach = asyncHandler(async (req, res) => {
  const data = await service.applyAsCoach(req.user.id, req.body);
  sendCreated(res, data, 'Coach application submitted!');
});

const enrollWithCoach = asyncHandler(async (req, res) => {
  const { plan_type } = req.body;
  const data = await service.enrollWithCoach(Number(req.params.id), req.user.id, plan_type);
  sendSuccess(res, { enrollment_id: data }, 'Enrolled with coach!');
});

const getCoachDashboard = asyncHandler(async (req, res) => {
  const data = await service.getCoachDashboard(req.user.id);
  sendSuccess(res, data);
});

// ─── Admin ───────────────────────────────────────────────────

const getAdminDashboard = asyncHandler(async (req, res) => {
  const data = await service.getAdminDashboard();
  sendSuccess(res, data);
});

const updateCoachStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  const data = await service.updateCoachStatus(Number(req.params.id), status);
  sendSuccess(res, data, `Coach ${status}!`);
});

const createArticle = asyncHandler(async (req, res) => {
  const data = await service.createArticle(req.body);
  sendCreated(res, data, 'Article created!');
});

const createExercise = asyncHandler(async (req, res) => {
  const data = await service.createExercise(req.body);
  sendCreated(res, data, 'Exercise created!');
});

module.exports = {
  getProfile, saveProfile, getDashboard,
  chatWithCoach,
  generateWorkout, getUserWorkouts, getWorkoutDetail, completeWorkout,
  generateDiet, getTodayDiet,
  checkIn, getTodayCheckin,
  getHabitTemplates, getUserHabits, enrollHabit, logHabit,
  getProgress, logProgress,
  getExercises, getExerciseById,
  getArticleCategories, getArticles, getArticleById,
  getNews,
  getCoaches, getCoachById, applyAsCoach, enrollWithCoach, getCoachDashboard,
  getAdminDashboard, updateCoachStatus, createArticle, createExercise,
};
