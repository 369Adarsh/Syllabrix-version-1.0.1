import api from '../api-client';
export const parentAPI = {
  getChildren: () => api.get('/parent/children'),
  linkChild: (data) => api.post('/parent/link-child', data),
  unlinkChild: (childId) => api.delete(`/parent/child/${childId}/link`),
  getChildActivity: (childId, params) => api.get(`/parent/child/${childId}/activity`, { params }),
  getControls: (childId) => api.get(`/parent/child/${childId}/controls`),
  updateControls: (childId, data) => api.put(`/parent/child/${childId}/controls`, data),
  getPendingApprovals: () => api.get('/parent/approvals/pending'),
  approveRequest: (requestId) => api.post(`/parent/approvals/${requestId}/approve`),
  denyRequest: (requestId) => api.post(`/parent/approvals/${requestId}/deny`),
  getWeeklyDigest: () => api.get('/parent/weekly-digest'),
  getChildScreenTime: (childId) => api.get(`/parent/child/${childId}/screen-time`),
  updateSettings: (childId, data) => api.put(`/parent/child/${childId}/settings`, data),
};
