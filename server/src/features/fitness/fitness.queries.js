// ============================================================
// Fitness Module — Database Queries
// ============================================================

const { pool } = require('../../database/connection');

// ─── Profile ─────────────────────────────────────────────────

const getProfile = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM fitness_profiles WHERE user_id = ?', [userId]);
  return rows[0] || null;
};

const upsertProfile = async (userId, data) => {
  const fields = [
    'user_id', 'age', 'gender', 'height_cm', 'weight_kg', 'goal',
    'fitness_level', 'activity_level', 'dietary_preference', 'allergies',
    'medical_notes', 'injuries', 'available_time_min', 'available_equipment',
    'preferred_styles', 'sleep_hours', 'water_intake_goal_ml',
    'target_weight_kg', 'target_calories', 'bmi', 'bmr', 'tdee', 'onboarding_complete'
  ];
  const values = {
    user_id: userId,
    age: data.age || null,
    gender: data.gender || 'prefer_not_to_say',
    height_cm: data.height_cm || null,
    weight_kg: data.weight_kg || null,
    goal: data.goal || 'general_fitness',
    fitness_level: data.fitness_level || 'beginner',
    activity_level: data.activity_level || 'sedentary',
    dietary_preference: data.dietary_preference || 'non_veg',
    allergies: data.allergies || null,
    medical_notes: data.medical_notes || null,
    injuries: data.injuries || null,
    available_time_min: data.available_time_min || 30,
    available_equipment: data.available_equipment ? JSON.stringify(data.available_equipment) : '["bodyweight"]',
    preferred_styles: data.preferred_styles ? JSON.stringify(data.preferred_styles) : '[]',
    sleep_hours: data.sleep_hours || 7.0,
    water_intake_goal_ml: data.water_intake_goal_ml || 2500,
    target_weight_kg: data.target_weight_kg || null,
    target_calories: data.target_calories || null,
    bmi: data.bmi || null,
    bmr: data.bmr || null,
    tdee: data.tdee || null,
    onboarding_complete: data.onboarding_complete ? 1 : 0,
  };

  const cols = fields.map(f => `\`${f}\``).join(', ');
  const placeholders = fields.map(() => '?').join(', ');
  const updates = fields.filter(f => f !== 'user_id').map(f => `\`${f}\` = VALUES(\`${f}\`)`).join(', ');
  const vals = fields.map(f => values[f]);

  await pool.query(
    `INSERT INTO fitness_profiles (${cols}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`,
    vals
  );
  return getProfile(userId);
};

// ─── Daily Check-in ──────────────────────────────────────────

const getTodayCheckin = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM fitness_daily_checkins WHERE user_id = ? AND checkin_date = CURDATE()',
    [userId]
  );
  return rows[0] || null;
};

const upsertCheckin = async (userId, data) => {
  await pool.query(
    `INSERT INTO fitness_daily_checkins (user_id, checkin_date, water_ml, sleep_hours, steps, mood, energy_level, weight_kg, notes, calories_consumed, calories_burned)
     VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE water_ml=VALUES(water_ml), sleep_hours=VALUES(sleep_hours), steps=VALUES(steps),
       mood=VALUES(mood), energy_level=VALUES(energy_level), weight_kg=VALUES(weight_kg), notes=VALUES(notes),
       calories_consumed=VALUES(calories_consumed), calories_burned=VALUES(calories_burned)`,
    [userId, data.water_ml || 0, data.sleep_hours || null, data.steps || 0,
     data.mood || 'okay', data.energy_level || 5, data.weight_kg || null,
     data.notes || null, data.calories_consumed || 0, data.calories_burned || 0]
  );
  return getTodayCheckin(userId);
};

const getCheckinHistory = async (userId, days = 7) => {
  const [rows] = await pool.query(
    'SELECT * FROM fitness_daily_checkins WHERE user_id = ? ORDER BY checkin_date DESC LIMIT ?',
    [userId, days]
  );
  return rows;
};

// ─── Exercise Library ────────────────────────────────────────

const getExercises = async (filters = {}) => {
  let query = 'SELECT * FROM fitness_exercise_library WHERE is_active = 1';
  const params = [];

  if (filters.category) { query += ' AND category = ?'; params.push(filters.category); }
  if (filters.difficulty) { query += ' AND difficulty = ?'; params.push(filters.difficulty); }
  if (filters.body_part) { query += ' AND body_part = ?'; params.push(filters.body_part); }
  if (filters.equipment) { query += ' AND equipment LIKE ?'; params.push(`%${filters.equipment}%`); }
  if (filters.search) { query += ' AND (name LIKE ? OR benefits LIKE ?)'; params.push(`%${filters.search}%`, `%${filters.search}%`); }

  query += ' ORDER BY name ASC';
  if (filters.limit) { query += ' LIMIT ?'; params.push(parseInt(filters.limit)); }

  const [rows] = await pool.query(query, params);
  return rows;
};

const getExerciseById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM fitness_exercise_library WHERE id = ?', [id]);
  return rows[0] || null;
};

// ─── Workout Plans ───────────────────────────────────────────

const getUserWorkoutPlans = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM fitness_workout_plans WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
};

const getWorkoutPlanWithDetails = async (planId) => {
  const [plans] = await pool.query('SELECT * FROM fitness_workout_plans WHERE id = ?', [planId]);
  if (!plans[0]) return null;

  const [days] = await pool.query(
    'SELECT * FROM fitness_workout_days WHERE plan_id = ? ORDER BY day_number',
    [planId]
  );

  for (const day of days) {
    const [exercises] = await pool.query(
      'SELECT * FROM fitness_workout_exercises WHERE day_id = ? ORDER BY sort_order',
      [day.id]
    );
    day.exercises = exercises;
  }

  return { ...plans[0], days };
};

const createWorkoutPlan = async (userId, planData, days) => {
  const [result] = await pool.query(
    `INSERT INTO fitness_workout_plans (user_id, coach_id, title, description, plan_type, difficulty, goal, duration_weeks, days_per_week, started_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
    [userId, planData.coach_id || null, planData.title, planData.description || null,
     planData.plan_type || 'ai_generated', planData.difficulty || 'beginner',
     planData.goal || 'general_fitness', planData.duration_weeks || 4,
     planData.days_per_week || days.length]
  );
  const planId = result.insertId;

  for (const day of days) {
    const [dayResult] = await pool.query(
      `INSERT INTO fitness_workout_days (plan_id, day_number, day_name, day_type, focus, est_duration_min)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [planId, day.day_number, day.day_name || null, day.day_type || 'workout',
       day.focus || null, day.est_duration_min || 45]
    );
    const dayId = dayResult.insertId;

    if (day.exercises && day.exercises.length) {
      for (let i = 0; i < day.exercises.length; i++) {
        const ex = day.exercises[i];
        await pool.query(
          `INSERT INTO fitness_workout_exercises (day_id, exercise_id, exercise_name, phase, sets, reps, duration_sec, rest_sec, target_muscles, benefits, precautions, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [dayId, ex.exercise_id || null, ex.exercise_name, ex.phase || 'main',
           ex.sets || 3, ex.reps || '12', ex.duration_sec || null, ex.rest_sec || 60,
           ex.target_muscles ? JSON.stringify(ex.target_muscles) : null,
           ex.benefits || null, ex.precautions || null, i]
        );
      }
    }
  }

  return getWorkoutPlanWithDetails(planId);
};

const completeWorkoutDay = async (dayId) => {
  await pool.query(
    'UPDATE fitness_workout_days SET is_completed = 1, completed_at = NOW() WHERE id = ?',
    [dayId]
  );
};

// ─── Diet Plans ──────────────────────────────────────────────

const getTodayDietPlan = async (userId) => {
  const [plans] = await pool.query(
    'SELECT * FROM fitness_diet_plans WHERE user_id = ? AND plan_date = CURDATE()',
    [userId]
  );
  if (!plans[0]) return null;

  const [meals] = await pool.query(
    'SELECT * FROM fitness_diet_meals WHERE plan_id = ? ORDER BY sort_order',
    [plans[0].id]
  );
  return { ...plans[0], meals };
};

const createDietPlan = async (userId, planData, meals) => {
  // Delete existing plan for today
  const [existing] = await pool.query(
    'SELECT id FROM fitness_diet_plans WHERE user_id = ? AND plan_date = CURDATE()',
    [userId]
  );
  if (existing[0]) {
    await pool.query('DELETE FROM fitness_diet_plans WHERE id = ?', [existing[0].id]);
  }

  const [result] = await pool.query(
    `INSERT INTO fitness_diet_plans (user_id, plan_date, plan_type, total_calories, protein_g, carbs_g, fats_g, fiber_g, water_ml, notes)
     VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, planData.plan_type || 'ai_generated', planData.total_calories || 2000,
     planData.protein_g || null, planData.carbs_g || null, planData.fats_g || null,
     planData.fiber_g || null, planData.water_ml || 2500, planData.notes || null]
  );
  const planId = result.insertId;

  for (let i = 0; i < meals.length; i++) {
    const m = meals[i];
    await pool.query(
      `INSERT INTO fitness_diet_meals (plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, fiber_g, ingredients, recipe_steps, prep_time_min, is_veg, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [planId, m.meal_type, m.meal_name, m.description || null, m.calories || null,
       m.protein_g || null, m.carbs_g || null, m.fats_g || null, m.fiber_g || null,
       m.ingredients ? JSON.stringify(m.ingredients) : null, m.recipe_steps || null,
       m.prep_time_min || null, m.is_veg ? 1 : 0, i]
    );
  }

  return getTodayDietPlan(userId);
};

// ─── Habits ──────────────────────────────────────────────────

const getHabitTemplates = async () => {
  const [rows] = await pool.query('SELECT * FROM fitness_habit_templates WHERE is_active = 1 ORDER BY sort_order');
  return rows;
};

const getUserHabits = async (userId) => {
  const [rows] = await pool.query(
    `SELECT uh.*, ht.name, ht.slug, ht.description, ht.category, ht.icon, ht.color, ht.unit, ht.default_target
     FROM fitness_user_habits uh
     JOIN fitness_habit_templates ht ON uh.template_id = ht.id
     WHERE uh.user_id = ? AND uh.is_active = 1
     ORDER BY ht.sort_order`,
    [userId]
  );
  return rows;
};

const enrollHabit = async (userId, templateId, customTarget) => {
  await pool.query(
    `INSERT INTO fitness_user_habits (user_id, template_id, custom_target)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE is_active = 1, custom_target = VALUES(custom_target)`,
    [userId, templateId, customTarget || null]
  );
  return getUserHabits(userId);
};

const logHabit = async (userHabitId, value) => {
  await pool.query(
    `INSERT INTO fitness_habit_logs (user_habit_id, log_date, value, is_completed)
     VALUES (?, CURDATE(), ?, 1)
     ON DUPLICATE KEY UPDATE value = VALUES(value), is_completed = 1`,
    [userHabitId, value || null]
  );

  // Update streak
  const [habit] = await pool.query('SELECT * FROM fitness_user_habits WHERE id = ?', [userHabitId]);
  if (habit[0]) {
    const newStreak = habit[0].current_streak + 1;
    const longestStreak = Math.max(newStreak, habit[0].longest_streak);
    await pool.query(
      'UPDATE fitness_user_habits SET current_streak = ?, longest_streak = ?, total_completed = total_completed + 1 WHERE id = ?',
      [newStreak, longestStreak, userHabitId]
    );
  }
};

const getTodayHabitLogs = async (userId) => {
  const [rows] = await pool.query(
    `SELECT hl.*, uh.template_id
     FROM fitness_habit_logs hl
     JOIN fitness_user_habits uh ON hl.user_habit_id = uh.id
     WHERE uh.user_id = ? AND hl.log_date = CURDATE()`,
    [userId]
  );
  return rows;
};

// ─── Progress ────────────────────────────────────────────────

const getProgressLogs = async (userId, limit = 30) => {
  const [rows] = await pool.query(
    'SELECT * FROM fitness_progress_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
};

const logProgress = async (userId, data) => {
  await pool.query(
    `INSERT INTO fitness_progress_logs (user_id, log_date, weight_kg, body_fat_pct, chest_cm, waist_cm, hips_cm, biceps_cm, thighs_cm, workouts_completed, meals_followed, habits_completed, notes, photo_url)
     VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE weight_kg=VALUES(weight_kg), body_fat_pct=VALUES(body_fat_pct),
       chest_cm=VALUES(chest_cm), waist_cm=VALUES(waist_cm), hips_cm=VALUES(hips_cm),
       biceps_cm=VALUES(biceps_cm), thighs_cm=VALUES(thighs_cm),
       workouts_completed=VALUES(workouts_completed), meals_followed=VALUES(meals_followed),
       habits_completed=VALUES(habits_completed), notes=VALUES(notes), photo_url=VALUES(photo_url)`,
    [userId, data.weight_kg || null, data.body_fat_pct || null,
     data.chest_cm || null, data.waist_cm || null, data.hips_cm || null,
     data.biceps_cm || null, data.thighs_cm || null,
     data.workouts_completed || 0, data.meals_followed || 0,
     data.habits_completed || 0, data.notes || null, data.photo_url || null]
  );
  const [rows] = await pool.query(
    'SELECT * FROM fitness_progress_logs WHERE user_id = ? AND log_date = CURDATE()',
    [userId]
  );
  return rows[0];
};

// ─── Coach Profiles ──────────────────────────────────────────

const getCoaches = async (filters = {}) => {
  let query = 'SELECT * FROM fitness_coach_profiles WHERE status = ?';
  const params = [filters.status || 'approved'];

  if (filters.specialization) {
    query += ' AND JSON_CONTAINS(specialization, ?)';
    params.push(JSON.stringify(filters.specialization));
  }
  if (filters.mode) { query += ' AND mode = ?'; params.push(filters.mode); }
  if (filters.search) {
    query += ' AND (full_name LIKE ? OR bio LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  query += ' ORDER BY is_featured DESC, rating DESC, total_clients DESC';
  if (filters.limit) { query += ' LIMIT ?'; params.push(parseInt(filters.limit)); }

  const [rows] = await pool.query(query, params);
  return rows;
};

const getCoachById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM fitness_coach_profiles WHERE id = ?', [id]);
  if (!rows[0]) return null;
  const [availability] = await pool.query(
    'SELECT * FROM fitness_coach_availability WHERE coach_id = ? ORDER BY day_of_week, start_time',
    [id]
  );
  return { ...rows[0], availability };
};

const getCoachByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM fitness_coach_profiles WHERE user_id = ?', [userId]);
  return rows[0] || null;
};

const applyAsCoach = async (userId, data) => {
  const [result] = await pool.query(
    `INSERT INTO fitness_coach_profiles (user_id, full_name, bio, specialization, certifications, years_experience, pricing_monthly, pricing_session, languages, mode, profile_image_url, location)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, data.full_name, data.bio || null,
     data.specialization ? JSON.stringify(data.specialization) : '[]',
     data.certifications ? JSON.stringify(data.certifications) : '[]',
     data.years_experience || 0, data.pricing_monthly || null, data.pricing_session || null,
     data.languages ? JSON.stringify(data.languages) : '["English","Hindi"]',
     data.mode || 'online', data.profile_image_url || null, data.location || null]
  );
  return getCoachById(result.insertId);
};

const updateCoachStatus = async (coachId, status) => {
  await pool.query(
    'UPDATE fitness_coach_profiles SET status = ? WHERE id = ?',
    [status, coachId]
  );
  return getCoachById(coachId);
};

const enrollWithCoach = async (coachId, userId, planType) => {
  const [result] = await pool.query(
    `INSERT INTO fitness_coach_enrollments (coach_id, user_id, plan_type, start_date)
     VALUES (?, ?, ?, CURDATE())`,
    [coachId, userId, planType || 'monthly']
  );
  return result.insertId;
};

const getCoachClients = async (coachId) => {
  const [rows] = await pool.query(
    `SELECT ce.*, u.username, u.email
     FROM fitness_coach_enrollments ce
     JOIN users u ON ce.user_id = u.id
     WHERE ce.coach_id = ?
     ORDER BY ce.created_at DESC`,
    [coachId]
  );
  return rows;
};

// ─── Articles ────────────────────────────────────────────────

const getArticleCategories = async () => {
  const [rows] = await pool.query('SELECT * FROM fitness_article_categories WHERE is_active = 1 ORDER BY sort_order');
  return rows;
};

const getArticles = async (filters = {}) => {
  let query = 'SELECT a.*, c.name as category_name FROM fitness_articles a LEFT JOIN fitness_article_categories c ON a.category_id = c.id WHERE a.is_published = 1';
  const params = [];

  if (filters.category_id) { query += ' AND a.category_id = ?'; params.push(filters.category_id); }
  if (filters.search) { query += ' AND (a.title LIKE ? OR a.excerpt LIKE ?)'; params.push(`%${filters.search}%`, `%${filters.search}%`); }
  if (filters.featured) { query += ' AND a.is_featured = 1'; }

  query += ' ORDER BY a.published_at DESC';
  if (filters.limit) { query += ' LIMIT ?'; params.push(parseInt(filters.limit)); }

  const [rows] = await pool.query(query, params);
  return rows;
};

const getArticleById = async (id) => {
  await pool.query('UPDATE fitness_articles SET views = views + 1 WHERE id = ?', [id]);
  const [rows] = await pool.query(
    'SELECT a.*, c.name as category_name FROM fitness_articles a LEFT JOIN fitness_article_categories c ON a.category_id = c.id WHERE a.id = ?',
    [id]
  );
  return rows[0] || null;
};

const createArticle = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO fitness_articles (category_id, title, slug, excerpt, content, cover_image_url, author_name, read_time_min, tags, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.category_id || null, data.title, data.slug, data.excerpt || null,
     data.content || null, data.cover_image_url || null, data.author_name || 'Syllabrix Fitness',
     data.read_time_min || 5, data.tags ? JSON.stringify(data.tags) : null, data.is_featured ? 1 : 0]
  );
  return getArticleById(result.insertId);
};

// ─── News ────────────────────────────────────────────────────

const getNews = async (limit = 20) => {
  const [rows] = await pool.query(
    'SELECT * FROM fitness_news ORDER BY published_at DESC LIMIT ?',
    [limit]
  );
  return rows;
};

// ─── Admin Dashboard ─────────────────────────────────────────

const getAdminStats = async () => {
  const queries = await Promise.all([
    pool.query('SELECT COUNT(*) as count FROM fitness_profiles'),
    pool.query('SELECT COUNT(*) as count FROM fitness_daily_checkins WHERE checkin_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'),
    pool.query('SELECT COUNT(*) as count FROM fitness_coach_profiles'),
    pool.query('SELECT COUNT(*) as count FROM fitness_coach_profiles WHERE status = "pending"'),
    pool.query('SELECT COUNT(*) as count FROM fitness_workout_days WHERE is_completed = 1'),
    pool.query('SELECT COUNT(*) as count FROM fitness_diet_plans'),
    pool.query('SELECT goal, COUNT(*) as count FROM fitness_profiles GROUP BY goal ORDER BY count DESC LIMIT 5'),
    pool.query('SELECT SUM(views) as total FROM fitness_articles'),
  ]);

  return {
    total_users: queries[0][0][0]?.count || 0,
    active_users_7d: queries[1][0][0]?.count || 0,
    total_coaches: queries[2][0][0]?.count || 0,
    pending_coaches: queries[3][0][0]?.count || 0,
    workouts_completed: queries[4][0][0]?.count || 0,
    diet_plans_created: queries[5][0][0]?.count || 0,
    popular_goals: queries[6][0] || [],
    total_article_views: queries[7][0][0]?.total || 0,
  };
};

// ─── Activity Logging ────────────────────────────────────────

const logActivity = async (userId, actionType, entityType, entityId, metadata) => {
  await pool.query(
    'INSERT INTO fitness_activity_logs (user_id, action_type, entity_type, entity_id, metadata) VALUES (?, ?, ?, ?, ?)',
    [userId, actionType, entityType || null, entityId || null, metadata ? JSON.stringify(metadata) : null]
  );
};

// ─── Create Exercise (Admin) ─────────────────────────────────

const createExercise = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO fitness_exercise_library (name, slug, category, difficulty, equipment, primary_muscles, secondary_muscles, body_part, benefits, instructions, mistakes_to_avoid, precautions, duration_seconds, calories_per_min, video_url, image_url, model_3d_url, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.slug, data.category, data.difficulty || 'beginner',
     data.equipment || 'bodyweight',
     data.primary_muscles ? JSON.stringify(data.primary_muscles) : null,
     data.secondary_muscles ? JSON.stringify(data.secondary_muscles) : null,
     data.body_part, data.benefits || null, data.instructions || null,
     data.mistakes_to_avoid || null, data.precautions || null,
     data.duration_seconds || null, data.calories_per_min || null,
     data.video_url || null, data.image_url || null, data.model_3d_url || null,
     data.tags ? JSON.stringify(data.tags) : null]
  );
  return getExerciseById(result.insertId);
};

module.exports = {
  getProfile, upsertProfile,
  getTodayCheckin, upsertCheckin, getCheckinHistory,
  getExercises, getExerciseById, createExercise,
  getUserWorkoutPlans, getWorkoutPlanWithDetails, createWorkoutPlan, completeWorkoutDay,
  getTodayDietPlan, createDietPlan,
  getHabitTemplates, getUserHabits, enrollHabit, logHabit, getTodayHabitLogs,
  getProgressLogs, logProgress,
  getCoaches, getCoachById, getCoachByUserId, applyAsCoach, updateCoachStatus, enrollWithCoach, getCoachClients,
  getArticleCategories, getArticles, getArticleById, createArticle,
  getNews,
  getAdminStats, logActivity,
};
