// Corporate L&D API Client
import apiClient from '../api-client';

const LD_API = {
  // ─── Organization ──────────────────────────────────────
  createOrg: (data) => apiClient.post('/ld/org', data),
  getMyOrgs: () => apiClient.get('/ld/org/my'),
  getOrg: (orgId) => apiClient.get(`/ld/org/${orgId}`),
  addMember: (orgId, data) => apiClient.post(`/ld/org/${orgId}/members`, data),
  getMembers: (orgId, params) => apiClient.get(`/ld/org/${orgId}/members`, { params }),
  getOrgStats: (orgId) => apiClient.get(`/ld/org/${orgId}/stats`),
  bootstrapOrg: (orgId, formData) => apiClient.post(`/ld/org/${orgId}/bootstrap`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getImpactMetrics: (orgId) => apiClient.get(`/ld/org/${orgId}/impact`),
  getManagerStats: (orgId) => apiClient.get(`/ld/org/${orgId}/manager-stats`),
  getManagerAgenda: (orgId, employeeId) => apiClient.get(`/ld/org/${orgId}/manager/agenda/${employeeId}`),

  // ─── Skills & Taxonomy ─────────────────────────────────
  createSkill: (orgId, data) => apiClient.post(`/ld/skills/${orgId}/skills`, data),
  getSkills: (orgId, params) => apiClient.get(`/ld/skills/${orgId}/skills`, { params }),
  createRole: (orgId, data) => apiClient.post(`/ld/skills/${orgId}/roles`, data),
  getRoles: (orgId, params) => apiClient.get(`/ld/skills/${orgId}/roles`, { params }),
  mapRoleSkill: (orgId, roleId, data) => apiClient.post(`/ld/skills/${orgId}/roles/${roleId}/skills`, data),
  getRoleSkills: (orgId, roleId) => apiClient.get(`/ld/skills/${orgId}/roles/${roleId}/skills`),
  extractSkillsFromJD: (orgId, jd_text) => apiClient.post(`/ld/skills/${orgId}/extract-jd`, { jd_text }),
  importCSV: (orgId, rows) => apiClient.post(`/ld/skills/${orgId}/import-csv`, { rows }),
  selfAssess: (orgId, ratings) => apiClient.post(`/ld/skills/${orgId}/self-assess`, { ratings }),
  managerRate: (orgId, data) => apiClient.post(`/ld/skills/${orgId}/manager-rate`, data),
  getGaps: (orgId, userId) => apiClient.get(`/ld/skills/${orgId}/gaps${userId ? `/${userId}` : ''}`),
  getHeatmap: (orgId, params) => apiClient.get(`/ld/skills/${orgId}/heatmap`, { params }),
  getGapSummary: (orgId) => apiClient.get(`/ld/skills/${orgId}/gap-summary`),
  getSkillProfile: (orgId, userId) => apiClient.get(`/ld/skills/${orgId}/profile${userId ? `/${userId}` : ''}`),
  getCareerRoadmap: (orgId, targetRoleId) => apiClient.get(`/ld/skills/${orgId}/career/roadmap/${targetRoleId}`),

  // ─── AI Content Studio ─────────────────────────────────
  generateOutline: (orgId, data) => apiClient.post(`/ld/content/${orgId}/generate-outline`, data),
  generateModuleContent: (orgId, data) => apiClient.post(`/ld/content/${orgId}/generate-module`, data),
  generateAssessment: (orgId, data) => apiClient.post(`/ld/content/${orgId}/generate-assessment`, data),
  generateMicrolearning: (orgId, data) => apiClient.post(`/ld/content/${orgId}/generate-microlearning`, data),
  runSafetyCheck: (orgId, content) => apiClient.post(`/ld/content/${orgId}/safety-check`, { content }),
  createProgram: (orgId, data) => apiClient.post(`/ld/content/${orgId}/programs`, data),
  getPrograms: (orgId, params) => apiClient.get(`/ld/content/${orgId}/programs`, { params }),
  getProgram: (orgId, programId) => apiClient.get(`/ld/content/${orgId}/programs/${programId}`),
  saveModules: (orgId, programId, modules) => apiClient.post(`/ld/content/${orgId}/programs/${programId}/modules`, { modules }),
  saveAssessment: (orgId, programId, data) => apiClient.post(`/ld/content/${orgId}/programs/${programId}/assessments`, data),
  submitForReview: (orgId, data) => apiClient.post(`/ld/content/${orgId}/submit-review`, data),
  getReviewQueue: (orgId) => apiClient.get(`/ld/content/${orgId}/review-queue`),
  submitReview: (orgId, reviewId, data) => apiClient.patch(`/ld/content/${orgId}/reviews/${reviewId}`, data),

  // Knowledge Hub
  submitKnowledge: (orgId, data) => apiClient.post(`/ld/content/${orgId}/knowledge`, data),
  getKnowledgeFeed: (orgId, params) => apiClient.get(`/ld/content/${orgId}/knowledge`, { params }),
  searchKnowledge: (orgId, q) => apiClient.get(`/ld/content/${orgId}/knowledge/search`, { params: { q } }),
  reviewKnowledge: (orgId, itemId, data) => apiClient.post(`/ld/content/${orgId}/knowledge/${itemId}/review`, data),
  markHelpful: (orgId, itemId) => apiClient.post(`/ld/content/${orgId}/knowledge/${itemId}/helpful`),

  // ─── LMS ───────────────────────────────────────────────
  enroll: (orgId, data) => apiClient.post(`/ld/lms/${orgId}/enroll`, data),
  bulkEnroll: (orgId, data) => apiClient.post(`/ld/lms/${orgId}/bulk-enroll`, data),
  getLearnerFeed: (orgId) => apiClient.get(`/ld/lms/${orgId}/feed`),
  getLearnerStats: (orgId) => apiClient.get(`/ld/lms/${orgId}/stats`),
  getEnrollmentDetails: (orgId, enrollmentId) => apiClient.get(`/ld/lms/${orgId}/enrollments/${enrollmentId}`),
  chatWithCoach: (orgId, enrollmentId, moduleId, message, history) => apiClient.post(`/ld/lms/${orgId}/enrollments/${enrollmentId}/modules/${moduleId}/chat`, { message, history }),
  startModule: (orgId, enrollmentId, moduleId) => apiClient.post(`/ld/lms/${orgId}/enroll/${enrollmentId}/module/${moduleId}/start`),
  completeModule: (orgId, enrollmentId, moduleId, data) => apiClient.post(`/ld/lms/${orgId}/enroll/${enrollmentId}/module/${moduleId}/complete`, data),
  submitAssessment: (orgId, assessmentId, answers) => apiClient.post(`/ld/lms/${orgId}/assessments/${assessmentId}/submit`, { answers }),
  getComplianceStatus: (orgId) => apiClient.get(`/ld/lms/${orgId}/compliance`),
  getReinforcements: (orgId) => apiClient.get(`/ld/lms/${orgId}/reinforcements`),
  completeReinforcement: (orgId, scheduleId) => apiClient.post(`/ld/lms/${orgId}/reinforcements/${scheduleId}/complete`),
};

export default LD_API;
