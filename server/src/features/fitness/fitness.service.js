// ============================================================
// Fitness Module — Business Logic Service
// ============================================================

const queries = require('./fitness.queries');
const aiFitness = require('../../services/ai-fitness.service');
const { ApiError } = require('../../utils/api-error');

// ─── Profile ─────────────────────────────────────────────────

const getProfile = async (userId) => {
  return queries.getProfile(userId);
};

const saveProfile = async (userId, data) => {
  // Use provided data or fallback to reasonable defaults if truly missing
  const age = data.age || 30;
  const gender = data.gender || 'prefer_not_to_say';
  const activity_level = data.activity_level || 'sedentary';

  // Calculate metrics (BMI, BMR, TDEE)
  const metrics = aiFitness.calculateMetrics({ ...data, age, gender, activity_level });
  
  const profileData = {
    ...data,
    age,
    gender,
    activity_level,
    ...metrics,
    onboarding_complete: true,
  };
  return queries.upsertProfile(userId, profileData);
};

// ─── Dashboard ───────────────────────────────────────────────

const getDashboard = async (userId) => {
  const [profile, checkin, habits, todayHabitLogs, workoutPlans, dietPlan, progressLogs] = await Promise.all([
    queries.getProfile(userId),
    queries.getTodayCheckin(userId),
    queries.getUserHabits(userId),
    queries.getTodayHabitLogs(userId),
    queries.getUserWorkoutPlans(userId),
    queries.getTodayDietPlan(userId),
    queries.getProgressLogs(userId, 7),
  ]);

  // Get today's workout
  const activePlan = workoutPlans.find(p => p.status === 'active');
  let todayWorkout = null;
  if (activePlan) {
    const fullPlan = await queries.getWorkoutPlanWithDetails(activePlan.id);
    if (fullPlan && fullPlan.days) {
      const dayOfWeek = new Date().getDay() || 7; // 1=Mon, 7=Sun
      todayWorkout = fullPlan.days.find(d => d.day_number === dayOfWeek) || fullPlan.days[0];
    }
  }

  // Calculate streaks
  const totalHabitStreak = habits.reduce((sum, h) => sum + h.current_streak, 0);
  const completedToday = todayHabitLogs.length;

  // Weekly progress
  const weeklyCheckins = await queries.getCheckinHistory(userId, 7);

  // Generate motivation & dynamic insight
  let motivation = null;
  let freshInsight = null;
  if (profile) {
    try {
      const dashboardData = {
        totalHabitStreak,
        completedTodayHabits: completedToday,
        totalHabits: habits.length,
        checkin,
        todayWorkout
      };
      
      [motivation, freshInsight] = await Promise.all([
        aiFitness.generateMotivation(profile, totalHabitStreak, completedToday > 0 ? Math.round((completedToday / Math.max(habits.length, 1)) * 100) : 0),
        aiFitness.getDynamicInsight(profile, dashboardData)
      ]);
    } catch (e) {
      console.error("[FitnessService] AI Insights error:", e);
      motivation = { 
        message: "Every step counts! Keep pushing towards your healthy lifestyle goals! 💪", 
        tip: "Consistency is more important than intensity when starting out.", 
        emoji: "🔥" 
      };
      freshInsight = { title: "Stay Consistent", content: "Small daily actions lead to big long-term results. Keep going!", priority: "medium" };
    }
  }
 
  return {
    profile,
    checkin,
    todayWorkout,
    dietPlan,
    habits: habits.map(h => ({
      ...h,
      completed_today: todayHabitLogs.some(l => l.user_habit_id === h.id),
    })),
    progress: progressLogs,
    weeklyCheckins,
    motivation,
    freshInsight,
    stats: {
      totalHabitStreak,
      completedTodayHabits: completedToday,
      totalHabits: habits.length,
      activePlans: workoutPlans.filter(w => w.status === 'active').length,
      totalWorkouts: workoutPlans.length,
    },
  };
};


// ─── AI Coach Chat ───────────────────────────────────────────

const chatWithCoach = async (userId, history, message) => {
  const profile = await queries.getProfile(userId);
  const checkin = await queries.getTodayCheckin(userId);
  const response = await aiFitness.chatWithCoach(history, message, profile, checkin);
  await queries.logActivity(userId, 'ai_chat', 'fitness_chat', null, { message_length: message.length });
  return { response };
};

// ─── Workout Generation ──────────────────────────────────────

const generateWorkout = async (userId, options = {}) => {
  const profile = await queries.getProfile(userId);
  if (!profile) throw ApiError.badRequest('Please complete your fitness profile first');

  try {
    const plan = await aiFitness.generateWorkoutPlan(profile, options);
    if (!plan || !plan.days) throw new Error("Invalid AI output");

    const saved = await queries.createWorkoutPlan(userId, {
      title: plan.title || 'Personalized AI Workout Plan',
      description: plan.description || 'A custom plan tailored to your fitness level and goals.',
      plan_type: 'ai_generated',
      difficulty: profile.fitness_level,
      goal: profile.goal,
      days_per_week: plan.days?.length || 5,
    }, plan.days || []);

    await queries.logActivity(userId, 'generate_workout', 'workout_plan', saved.id);
    return saved;
  } catch (e) {
    console.error("[FitnessService] Workout Generation AI error:", e);
    throw ApiError.internal('Our AI trainer is currently busy. Please try again in a few moments.');
  }
};

const getUserWorkouts = async (userId) => {
  return queries.getUserWorkoutPlans(userId);
};

const getWorkoutDetail = async (planId) => {
  return queries.getWorkoutPlanWithDetails(planId);
};

const completeWorkout = async (dayId, userId) => {
  await queries.completeWorkoutDay(dayId);
  await queries.logActivity(userId, 'complete_workout', 'workout_day', dayId);
};

// ─── Diet Generation ─────────────────────────────────────────

const generateDiet = async (userId, options = {}) => {
  const profile = await queries.getProfile(userId);
  if (!profile) throw ApiError.badRequest('Please complete your fitness profile first');

  try {
    const plan = await aiFitness.generateDietPlan(profile, options);
    if (!plan || !plan.meals) throw new Error("Invalid AI output");

    const saved = await queries.createDietPlan(userId, {
      plan_type: 'ai_generated',
      total_calories: plan.total_calories || 2000,
      protein_g: plan.protein_g,
      carbs_g: plan.carbs_g,
      fats_g: plan.fats_g,
      fiber_g: plan.fiber_g,
      water_ml: plan.water_ml || 2500,
    }, plan.meals || []);

    await queries.logActivity(userId, 'generate_diet', 'diet_plan', saved?.id);
    return saved;
  } catch (e) {
    console.error("[FitnessService] Diet Generation AI error:", e);
    throw ApiError.internal('Our AI nutritionist is crafting other plans. Please try again in a moment.');
  }
};

const getTodayDiet = async (userId) => {
  return queries.getTodayDietPlan(userId);
};

// ─── Check-in ────────────────────────────────────────────────

const checkIn = async (userId, data) => {
  const result = await queries.upsertCheckin(userId, data);
  await queries.logActivity(userId, 'daily_checkin', 'checkin', result?.id);
  return result;
};

const getTodayCheckin = async (userId) => {
  return queries.getTodayCheckin(userId);
};

// ─── Habits ──────────────────────────────────────────────────

const getHabitTemplates = async () => {
  return queries.getHabitTemplates();
};

const getUserHabits = async (userId) => {
  const habits = await queries.getUserHabits(userId);
  const todayLogs = await queries.getTodayHabitLogs(userId);
  return habits.map(h => ({
    ...h,
    completed_today: todayLogs.some(l => l.user_habit_id === h.id),
  }));
};

const enrollHabit = async (userId, templateId, customTarget) => {
  return queries.enrollHabit(userId, templateId, customTarget);
};

const logHabit = async (userHabitId, value, userId) => {
  await queries.logHabit(userHabitId, value);
  await queries.logActivity(userId, 'log_habit', 'habit', userHabitId);
};

// ─── Progress ────────────────────────────────────────────────

const getProgress = async (userId) => {
  return queries.getProgressLogs(userId);
};

const logProgress = async (userId, data) => {
  const result = await queries.logProgress(userId, data);
  await queries.logActivity(userId, 'log_progress', 'progress', result?.id);
  return result;
};

// ─── Exercises ───────────────────────────────────────────────

const getExercises = async (filters) => {
  return queries.getExercises(filters);
};

const getExerciseById = async (id) => {
  return queries.getExerciseById(id);
};

// ─── Articles ────────────────────────────────────────────────

const getArticleCategories = async () => {
  return queries.getArticleCategories();
};

const getArticles = async (filters) => {
  return queries.getArticles(filters);
};

const getArticleById = async (id) => {
  return queries.getArticleById(id);
};

// ─── News ────────────────────────────────────────────────────

const getNews = async (limit = 10) => {
  const dbNews = await queries.getNews(limit);
  
  // Logic for freshness: If we have no news or the news is older than 24 hours,
  // we fetch/generate fresh news using AI.
  const isFresh = dbNews.length > 0 && 
                  (new Date() - new Date(dbNews[0].published_at)) < (24 * 3600 * 1000);
                  
  if (isFresh && dbNews.length >= 3) {
    return dbNews;
  }
  
  console.log("[FitnessService] NEWS STALE: Generating fresh AI news...");
  try {
    const freshNews = await aiFitness.getFreshNews(limit);
    // Return AI news (merged with DB if needed, but AI news is 'fresher')
    return [...freshNews, ...dbNews].slice(0, limit);
  } catch (e) {
    console.error("[FitnessService] News generation error:", e);
    return dbNews;
  }
};


// ─── Coaches ─────────────────────────────────────────────────

const getCoaches = async (filters) => {
  return queries.getCoaches(filters);
};

const getCoachById = async (id) => {
  return queries.getCoachById(id);
};

const applyAsCoach = async (userId, data) => {
  const existing = await queries.getCoachByUserId(userId);
  if (existing) throw ApiError.conflict('You have already applied as a coach');
  return queries.applyAsCoach(userId, data);
};

const enrollWithCoach = async (coachId, userId, planType) => {
  const coach = await queries.getCoachById(coachId);
  if (!coach) throw ApiError.notFound('Coach not found');
  if (coach.status !== 'approved') throw ApiError.badRequest('Coach is not available');
  return queries.enrollWithCoach(coachId, userId, planType);
};

const getCoachDashboard = async (userId) => {
  const coach = await queries.getCoachByUserId(userId);
  if (!coach) throw ApiError.notFound('Coach profile not found');
  const clients = await queries.getCoachClients(coach.id);
  return {
    coach,
    clients,
    stats: {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      pendingClients: clients.filter(c => c.status === 'pending').length,
    },
  };
};

// ─── Admin ───────────────────────────────────────────────────

const getAdminDashboard = async () => {
  return queries.getAdminStats();
};

const updateCoachStatus = async (coachId, status) => {
  return queries.updateCoachStatus(coachId, status);
};

const createArticle = async (data) => {
  return queries.createArticle(data);
};

const createExercise = async (data) => {
  return queries.createExercise(data);
};

module.exports = {
  getProfile, saveProfile, getDashboard,
  chatWithCoach, generateWorkout, getUserWorkouts, getWorkoutDetail, completeWorkout,
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
