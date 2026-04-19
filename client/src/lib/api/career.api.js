import api from '../api-client';

export const careerAPI = {
  // ── Dashboard & Profile ───────────────────────────────────────────────────
  getDashboard:        ()           => api.get('/career/dashboard'),
  getDashboardSummary: ()           => api.get('/career/dashboard'),
  getProfile:          ()           => api.get('/career/profile'),
  saveProfile:         (data)       => api.post('/career/profile', data),
  completeOnboarding:  ()           => api.post('/career/onboarding/complete'),

  // ── Skill cards (dashboard metrics) ──────────────────────────────────────
  getMarketFit:        ()           => api.get('/career/market-fit'),
  getSkillMatch:       ()           => api.get('/career/skill-match'),

  // ── Skills ────────────────────────────────────────────────────────────────
  getSkillProfile:     ()           => api.get('/career/skills'),
  getSkillGaps:        ()           => api.get('/career/skills/gaps'),
  getSkillTrends:      ()           => api.get('/career/skills/trends'),
  analyzeSkills:       (data)       => api.post('/career/skills/analyze', data),
  updateSkills:        (skills)     => api.post('/career/skills', { skills }),
  scanResume:          (data)       => api.post('/career/skills/scan-resume', data),

  // ── Jobs ──────────────────────────────────────────────────────────────────
  listJobs:            (params)     => api.get('/career/jobs', { params }),
  getJob:              (id)         => api.get(`/career/jobs/${id}`),
  getJobCount:         ()           => api.get('/career/jobs/count'),
  refreshJobMatches:   ()           => api.post('/career/jobs/refresh'),
  updateJobAction:     (id, action) => api.put(`/career/jobs/${id}/action`, { action }),
  searchCompanyJobs:   (company, role) => api.post('/career/jobs/company-search', { company, role }),

  // ── Resume ────────────────────────────────────────────────────────────────
  listResumeVersions:  ()           => api.get('/career/resume/versions'),
  setResumePrimary:    (id)         => api.put(`/career/resume/${id}/set-primary`),
  getATSScore:         ()           => api.get('/career/resume/ats-score'),
  uploadResume:        (data)       => api.post('/career/resume/upload', data),
  calibrateResume:     (data)       => api.post('/career/resume/calibrate', data, { timeout: 90000 }),
  analyzeResume:       (data)       => api.post('/career/resume/analyze', data),
  optimizeResume:      (data)       => api.post('/career/resume/optimize', data),
  generateCoverLetter: (data)       => api.post('/career/resume/cover-letter', data),

  // ── Mock Interviews ────────────────────────────────────────────────────────
  startInterview:      (data)       => api.post('/career/interview/start', data),
  submitAnswer:        (data)       => api.post('/career/interview/answer', data),
  evaluateInterview:   (data)       => api.post('/career/interview/evaluate', data),
  getInterviewHistory: ()           => api.get('/career/interview/history'),
  getInterview:        (id)         => api.get(`/career/interview/${id}`),

  // ── Learning Paths ─────────────────────────────────────────────────────────
  listLearningPaths:   ()           => api.get('/career/learning'),
  getLearningPath:     (id)         => api.get(`/career/learning/${id}`),
  generateLearningPath:(data)       => api.post('/career/learning/generate', data),
  bridgeGap:           (jobId)      => api.post('/career/learning/bridge-gap', { job_id: jobId }),
  completeDay:         (id, day)    => api.put(`/career/learning/${id}/complete-day`, { day }),
  generateDayContent:  (id, day)    => api.post(`/career/learning/${id}/generate-day`, { day }),
  getGapSolution:      (skillName)  => api.post('/career/learning/gap-solution', { skill_name: skillName }),
  clearLearningPaths:  ()           => api.post('/career/learning/clear'),

  // ── Certifications ────────────────────────────────────────────────────────
  listCertifications:  ()           => api.get('/career/certifications'),
  addCertification:    (data)       => api.post('/career/certifications', data),
  updateCertification: (id, data)   => api.put(`/career/certifications/${id}`, data),
  deleteCertification: (id)         => api.delete(`/career/certifications/${id}`),

  // ── Salary ────────────────────────────────────────────────────────────────
  getSalary:           (params)     => api.get('/career/salary', { params }),

  // ── YouTube ───────────────────────────────────────────────────────────────
  searchYouTube:       (query)      => api.get('/career/youtube/search', { params: { query } }),
};
