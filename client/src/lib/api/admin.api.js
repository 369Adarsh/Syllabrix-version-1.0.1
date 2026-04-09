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

  // 2FA
  setup2FA: () => axios.post(`${BASE}/2fa/setup`, {}, getHeaders()),
  verify2FA: (token) => axios.post(`${BASE}/2fa/verify`, { token }, getHeaders()),

  // Enterprise & Master Command
  getOrganizations: (params = {}) => axios.get(`${BASE}/enterprise/organizations`, { ...getHeaders(), params }),
  getSkillInsights: () => axios.get(`${BASE}/enterprise/skills`, getHeaders()),
  getEnterpriseEnrollments: (params = {}) => axios.get(`${BASE}/enterprise/enrollments`, { ...getHeaders(), params }),
  getMasterHealth: () => axios.get(`${BASE}/master/health`, getHeaders()),
};
