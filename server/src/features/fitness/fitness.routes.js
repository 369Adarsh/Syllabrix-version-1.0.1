// ============================================================
// Fitness Module — Routes
// ============================================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const c = require('./fitness.controller');

// ─── Public Routes ───────────────────────────────────────────

// Exercise Library (public browsing)
router.get('/exercises', c.getExercises);
router.get('/exercises/:id', c.getExerciseById);

// Articles (public)
router.get('/article-categories', c.getArticleCategories);
router.get('/articles', c.getArticles);
router.get('/articles/:id', c.getArticleById);

// News (public)
router.get('/news', c.getNews);

// Coaches (public browsing)
router.get('/coaches', c.getCoaches);
router.get('/coaches/:id', c.getCoachById);

// Habit templates (public)
router.get('/habit-templates', c.getHabitTemplates);

// ─── Authenticated Routes ────────────────────────────────────

router.use(authenticate);

// Profile
router.get('/profile', c.getProfile);
router.post('/profile', c.saveProfile);

// Dashboard
router.get('/dashboard', c.getDashboard);

// AI Coach
router.post('/ai/chat', c.chatWithCoach);
router.post('/ai/workout', c.generateWorkout);
router.post('/ai/diet', c.generateDiet);

// Workouts
router.get('/workouts', c.getUserWorkouts);
router.get('/workouts/:id', c.getWorkoutDetail);
router.post('/workouts/:dayId/complete', c.completeWorkout);

// Diet
router.get('/diet/today', c.getTodayDiet);
router.post('/diet/regenerate', c.generateDiet);

// Check-in
router.post('/checkin', c.checkIn);
router.get('/checkin/today', c.getTodayCheckin);

// Habits
router.get('/habits', c.getUserHabits);
router.post('/habits', c.enrollHabit);
router.post('/habits/:id/log', c.logHabit);

// Progress
router.get('/progress', c.getProgress);
router.post('/progress', c.logProgress);

// Coach Apply
router.post('/coaches/apply', c.applyAsCoach);
router.post('/coaches/:id/enroll', c.enrollWithCoach);

// Coach Dashboard
router.get('/coach/dashboard', c.getCoachDashboard);

// Admin
router.get('/admin/dashboard', c.getAdminDashboard);
router.patch('/admin/coaches/:id/status', c.updateCoachStatus);
router.post('/admin/articles', c.createArticle);
router.post('/admin/exercises', c.createExercise);

module.exports = router;
