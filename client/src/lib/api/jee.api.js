import api from '../api-client';

export const jeeAPI = {
  // Syllabus
  getSubjects: () => api.get('/jee/subjects'),
  getChapters: (params) => api.get('/jee/chapters', { params }),
  getChapter: (subjectSlug, chapterSlug, classLevel) => api.get(`/jee/chapters/${subjectSlug}/${chapterSlug}`, { params: { class: classLevel } }),
  getTopic: (id) => api.get(`/jee/topics/${id}`),
  generateTopicNotes: (id) => api.post(`/jee/topics/${id}/generate-notes`),
  generateNotes: (id) => api.post(`/jee/topics/${id}/generate-notes`),

  // PYQ
  getPYQs: (params) => api.get('/jee/pyq', { params }),
  getPYQ: (id) => api.get(`/jee/pyq/${id}`),
  getWeightage: (params) => api.get('/jee/pyq/weightage', { params }),
  getTrends: (params) => api.get('/jee/pyq/trends', { params }),
  getWeightage: (params) => api.get('/jee/pyq/weightage', { params }),

  // NCERT
  getNCERTChapters: (params) => api.get('/jee/ncert', { params }),
  getNCERTExercises: (subject, classLevel, chapter, type) => api.get(`/jee/ncert/${subject}/${classLevel}/${chapter}${type ? '?type=' + type : ''}`),
  getNCERTSolution: (id) => api.get(`/jee/ncert/solution/${id}`),
  generateNCERTChapter: (data) => api.post('/jee/ncert/generate', data),
  escalateToTeacher: (data) => api.post('/jee/ai/escalate-to-teacher', data),

  // Videos
  getVideos: (params) => api.get('/jee/videos', { params }),
  // Reads real NCERT chapters & topics from the admin library database
  getLibraryNCERT: (params) => api.get('/jee/library/ncert', { params }),

  // Library Study Mode
  getLibraryChapters:       (params) => api.get('/jee/library/chapters', { params }),
  getLibraryChapter:        (id)     => api.get(`/jee/library/chapter/${id}`),
  getLibraryTopicContent:   (id)     => api.get(`/jee/library/topic/${id}/content`),
  generateLibraryTopicNotes:(id)     => api.post(`/jee/library/topic/${id}/generate`),
  generatePracticeQuestions:(id, params) => api.post(`/jee/library/topic/${id}/practice`, {}, { params }),

  // Books
  getBooks: () => api.get('/jee/books'),
  getBookChapters: (bookSlug) => api.get(`/jee/books/${bookSlug}/chapters`),
  getBookSolutions: (bookSlug, chapter) => api.get(`/jee/books/${bookSlug}/${chapter}`),

  // Mock Tests
  getMocks: (params) => api.get('/jee/mocks', { params }),
  getMock: (id) => api.get(`/jee/mocks/${id}`),
  generateMock: (data) => api.post('/jee/mocks/generate', data),
  startAttempt: (id) => api.post(`/jee/mocks/${id}/start`),
  saveProgress: (id, data) => api.put(`/jee/mocks/${id}/save`, data),
  submitAttempt: (id, data) => api.post(`/jee/mocks/${id}/submit`, data),
  getResult: (id) => api.get(`/jee/mocks/${id}/result`),

  // AI Tutor
  solveDoubt: (data) => api.post('/jee/ai/doubt', data),
  explainConcept: (data) => api.post('/jee/ai/explain-concept', data),
  solveStepByStep: (data) => api.post('/jee/ai/solve-step-by-step', data),
  generateQuestions: (data, save) => api.post(`/jee/ai/generate-questions${save ? '?save=true' : ''}`, data),
  generateSimilar: (data) => api.post('/jee/ai/generate-similar', data),
  extractArchive: (data, seed = true) => api.post(`/jee/ai/extract-archive${seed ? '?seed=true' : ''}`, data),
  dailyPracticeSet: () => api.post('/jee/ai/daily-practice-set'),

  // Analytics
  getAnalyticsOverview: () => api.get('/jee/analytics/overview'),
  getSubjectAnalytics: (slug) => api.get(`/jee/analytics/subject/${slug}`),
  getChapterAnalytics: (id) => api.get(`/jee/analytics/chapter/${id}`),
  getMockTrends: () => api.get('/jee/analytics/mock-trends'),
  getErrorPatterns: () => api.get('/jee/analytics/error-patterns'),
  getRankPrediction: () => api.get('/jee/analytics/rank-prediction'),

  // Formulas
  getFormulas: (subject) => api.get(`/jee/formulas/${subject}`),
  getChapterFormulas: (subject, chapter) => api.get(`/jee/formulas/${subject}/${chapter}`),

  // Study Plan
  getTodayPlan: () => api.get('/jee/study-plan/today'),
  generateStudyPlan: (data) => api.post('/jee/study-plan/generate', data),
  generatePlan: (date) => api.post('/jee/study-plan/generate', { date }),
  completeTask: (planId, taskIndex) => api.put(`/jee/study-plan/${planId}/complete-task`, { task_index: taskIndex }),
  getStudyPlanHistory: () => api.get('/jee/study-plan/history'),
  getPlanHistory: () => api.get('/jee/study-plan/history'),

  // Progress
  getProgressOverview: () => api.get('/jee/progress/overview'),
  getChapterProgress: (id) => api.get(`/jee/progress/chapter/${id}`),
  updateProgress: (id, data) => api.put(`/jee/progress/chapter/${id}`, data),

  // Bookmarks
  addBookmark: (data) => api.post('/jee/bookmarks', data),
  getBookmarks: (type) => api.get('/jee/bookmarks', { params: { type } }),
  removeBookmark: (id) => api.delete(`/jee/bookmarks/${id}`),

  // Errors
  getErrors: (params) => api.get('/jee/errors', { params }),
  reviewError: (id, notes) => api.put(`/jee/errors/${id}/review`, { notes }),

  // Subscription
  getSubscription: () => api.get('/jee/subscription/status'),
  checkout: (plan) => api.post('/jee/subscription/checkout', { plan }),
  verifyPayment: (data) => api.post('/jee/subscription/verify', data),
};
