import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Ensure we don't double up on /api
const BASE = (API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`) + '/admin';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('syllabrix_token')}` }
});

export const adminAPI = {
  // Users
  getUsers: (params = {}) => axios.get(`${BASE}/users`, { ...getHeaders(), params }),
  getUserActivity: (id, params = {}) => axios.get(`${BASE}/users/${id}/activity`, { ...getHeaders(), params }),
  setUserStatus: (id, status, reason) =>
    axios.post(`${BASE}/users/${id}/status`, { status, reason }, getHeaders()),
  verifyUserEmail: (id) =>
    axios.post(`${BASE}/users/${id}/verify-email`, {}, getHeaders()),
  deleteUser: (id) =>
    axios.delete(`${BASE}/users/${id}`, getHeaders()),

  // Reports / Moderation
  getReports: (params = {}) => axios.get(`${BASE}/reports`, { ...getHeaders(), params }),
  updateReport: (id, status, note) => 
    axios.patch(`${BASE}/reports/${id}`, { status, note }, getHeaders()),

  // Revenue & Growth Stats
  getRevenueStats: () => axios.get(`${BASE}/revenue/stats`, getHeaders()),
  getGrowthStats: () => axios.get(`${BASE}/overview/growth`, getHeaders()),

  // Global Audit & Activities
  getAuditLogs: (params = {}) => axios.get(`${BASE}/audit`, { ...getHeaders(), params }),
  extractReport: (type, params = {}) => axios.get(`${BASE}/reports/extract/${type}`, { ...getHeaders(), params }),

  // Super Admin Workbench
  getTables: () => axios.get(`${BASE}/workbench/tables`, getHeaders()),
  getTableData: (tableName, params = {}) => axios.get(`${BASE}/workbench/tables/${tableName}`, { ...getHeaders(), params }),
  updateRecord: (tableName, id, data) => axios.patch(`${BASE}/workbench/tables/${tableName}/${id}`, data, getHeaders()),
  runQuery: (sql) => axios.post(`${BASE}/workbench/query`, { sql }, getHeaders()),

  // Academic Library Management
  getLibraryStats: () => axios.get(`${BASE}/library/stats`, getHeaders()),
  getLibraryTree: () => axios.get(`${BASE}/library/tree`, getHeaders()),
  searchLibrary: (q) => axios.get(`${BASE}/library/search`, { ...getHeaders(), params: { q } }),
  getLibraryBoards: () => axios.get(`${BASE}/library/boards`, getHeaders()),
  createLibraryBoard: (data) => axios.post(`${BASE}/library/boards`, data, getHeaders()),
  getLibraryClasses: (board_id) => axios.get(`${BASE}/library/classes`, { ...getHeaders(), params: { board_id } }),
  createLibraryClass: (data) => axios.post(`${BASE}/library/classes`, data, getHeaders()),
  getLibrarySubjects: (class_id) => axios.get(`${BASE}/library/subjects`, { ...getHeaders(), params: { class_id } }),
  createLibrarySubject: (data) => axios.post(`${BASE}/library/subjects`, data, getHeaders()),
  deleteLibrarySubject: (id) => axios.delete(`${BASE}/library/subjects/${id}`, getHeaders()),
  getLibraryBooks: (subject_id) => axios.get(`${BASE}/library/books`, { ...getHeaders(), params: { subject_id } }),
  createLibraryBook: (formData) => axios.post(`${BASE}/library/books`, formData, { headers: { ...getHeaders().headers, 'Content-Type': 'multipart/form-data' } }),
  deleteLibraryBook: (id) => axios.delete(`${BASE}/library/books/${id}`, getHeaders()),
  getLibraryChapters: (book_id) => axios.get(`${BASE}/library/chapters`, { ...getHeaders(), params: { book_id } }),
  createLibraryChapter: (data) => axios.post(`${BASE}/library/chapters`, data, getHeaders()),
  updateLibraryChapter: (id, data) => axios.patch(`${BASE}/library/chapters/${id}`, data, getHeaders()),
  bulkCreateLibraryChapters: (data) => axios.post(`${BASE}/library/chapters/bulk`, data, getHeaders()),
  deleteLibraryChapter: (id) => axios.delete(`${BASE}/library/chapters/${id}`, getHeaders()),
  getLibraryTopics: (chapter_id) => axios.get(`${BASE}/library/topics`, { ...getHeaders(), params: { chapter_id } }),
  createLibraryTopic: (data) => axios.post(`${BASE}/library/topics`, data, getHeaders()),
  deleteLibraryTopic: (id) => axios.delete(`${BASE}/library/topics/${id}`, getHeaders()),
  getLibraryUploads: (entity_type, entity_id) => axios.get(`${BASE}/library/uploads`, { ...getHeaders(), params: { entity_type, entity_id } }),
  uploadLibraryFile: (formData) => axios.post(`${BASE}/library/uploads`, formData, { headers: { ...getHeaders().headers, 'Content-Type': 'multipart/form-data' } }),
  extractPdfTitle: (formData) => axios.post(`${BASE}/library/extract-pdf-title`, formData, { headers: { ...getHeaders().headers, 'Content-Type': 'multipart/form-data' } }),
  toggleLibraryAiIndex: (id) => axios.patch(`${BASE}/library/uploads/${id}/ai-index`, {}, getHeaders()),
  deleteLibraryUpload: (id) => axios.delete(`${BASE}/library/uploads/${id}`, getHeaders()),
  getExamTree: () => axios.get(`${BASE}/library/exams/tree`, getHeaders()),
  getExamSubjects: (exam_id) => axios.get(`${BASE}/library/exams/subjects`, { ...getHeaders(), params: { exam_id } }),
  getCompetitiveBooks: (subject_id) => axios.get(`${BASE}/library/exams/books`, { ...getHeaders(), params: { subject_id } }),
  getUniversityTree: () => axios.get(`${BASE}/library/university/tree`, getHeaders()),
  getUniversitySubjects: (course_id) => axios.get(`${BASE}/library/university/subjects`, { ...getHeaders(), params: { course_id } }),
  getUniversitySubjectBooks: (subject_id) => axios.get(`${BASE}/library/university/books`, { ...getHeaders(), params: { subject_id } }),

  // Notification Alerts
  getAlerts: () => axios.get(`${BASE}/alerts`, getHeaders()),

  // SyllaTrace Diagnostics
  debugHealth:      ()       => axios.get(`${BASE}/debug/health`,       getHeaders()),
  debugTrace:       (params) => axios.get(`${BASE}/debug/trace`,        { ...getHeaders(), params }),
  debugErrors:      ()       => axios.get(`${BASE}/debug/errors`,       getHeaders()),
  debugSlowQueries: ()       => axios.get(`${BASE}/debug/slow-queries`, getHeaders()),
  debugRouteStats:  ()       => axios.get(`${BASE}/debug/route-stats`,  getHeaders()),
  debugClear:       ()       => axios.delete(`${BASE}/debug/clear`,     getHeaders()),

  // 2FA
  setup2FA: () => axios.post(`${BASE}/2fa/setup`, {}, getHeaders()),
  verify2FA: (token) => axios.post(`${BASE}/2fa/verify`, { token }, getHeaders()),

  // Enterprise & Master Command
  getOrganizations: (params = {}) => axios.get(`${BASE}/enterprise/organizations`, { ...getHeaders(), params }),
  getSkillInsights: () => axios.get(`${BASE}/enterprise/skills`, getHeaders()),
  getEnterpriseEnrollments: (params = {}) => axios.get(`${BASE}/enterprise/enrollments`, { ...getHeaders(), params }),
  getMasterHealth: () => axios.get(`${BASE}/master/health`, getHeaders()),
};
