import api from '../api-client';

export const fitnessAPI = {
  // ─── Profile & Onboarding ──────────────────────────────────
  getProfile:         ()              => api.get('/fitness/profile'),
  saveProfile:        (data)          => api.post('/fitness/profile', data),

  // ─── Dashboard ─────────────────────────────────────────────
  getDashboard:       ()              => api.get('/fitness/dashboard'),

  // ─── AI Coach ──────────────────────────────────────────────
  chatWithCoach:      (data)          => api.post('/fitness/ai/chat', data),
  generateWorkout:    (data)          => api.post('/fitness/ai/workout', data || {}),
  generateDiet:       (data)          => api.post('/fitness/ai/diet', data || {}),

  // ─── Workouts ──────────────────────────────────────────────
  getWorkouts:        ()              => api.get('/fitness/workouts'),
  getWorkoutDetail:   (id)            => api.get(`/fitness/workouts/${id}`),
  completeWorkout:    (dayId)         => api.post(`/fitness/workouts/${dayId}/complete`),

  // ─── Diet ──────────────────────────────────────────────────
  getTodayDiet:       ()              => api.get('/fitness/diet/today'),
  regenerateDiet:     (data)          => api.post('/fitness/diet/regenerate', data || {}),

  // ─── Check-in ──────────────────────────────────────────────
  checkIn:            (data)          => api.post('/fitness/checkin', data),
  getTodayCheckin:    ()              => api.get('/fitness/checkin/today'),

  // ─── Habits ────────────────────────────────────────────────
  getHabitTemplates:  ()              => api.get('/fitness/habit-templates'),
  getUserHabits:      ()              => api.get('/fitness/habits'),
  enrollHabit:        (data)          => api.post('/fitness/habits', data),
  logHabit:           (id, data)      => api.post(`/fitness/habits/${id}/log`, data || {}),

  // ─── Progress ──────────────────────────────────────────────
  getProgress:        ()              => api.get('/fitness/progress'),
  logProgress:        (data)          => api.post('/fitness/progress', data),

  // ─── Exercises ─────────────────────────────────────────────
  getExercises:       (params)        => api.get('/fitness/exercises', { params }),
  getExerciseById:    (id)            => api.get(`/fitness/exercises/${id}`),

  // ─── Articles ──────────────────────────────────────────────
  getArticleCategories: ()            => api.get('/fitness/article-categories'),
  getArticles:        (params)        => api.get('/fitness/articles', { params }),
  getArticleById:     (id)            => api.get(`/fitness/articles/${id}`),

  // ─── News ──────────────────────────────────────────────────
  getNews:            (limit)         => api.get('/fitness/news', { params: { limit } }),

  // ─── Coaches ───────────────────────────────────────────────
  getCoaches:         (params)        => api.get('/fitness/coaches', { params }),
  getCoachById:       (id)            => api.get(`/fitness/coaches/${id}`),
  applyAsCoach:       (data)          => api.post('/fitness/coaches/apply', data),
  enrollWithCoach:    (id, data)      => api.post(`/fitness/coaches/${id}/enroll`, data),
  getCoachDashboard:  ()              => api.get('/fitness/coach/dashboard'),

  // ─── Admin ─────────────────────────────────────────────────
  getAdminDashboard:  ()              => api.get('/fitness/admin/dashboard'),
  updateCoachStatus:  (id, data)      => api.patch(`/fitness/admin/coaches/${id}/status`, data),
  createArticle:      (data)          => api.post('/fitness/admin/articles', data),
  createExercise:     (data)          => api.post('/fitness/admin/exercises', data),
};
