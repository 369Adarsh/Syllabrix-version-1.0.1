import api from '../api-client';
export const parentAPI = {
  getChildren: () => api.get('/parent/children'),
  linkChild: (data) => api.post('/parent/link-child', data),
  getChildActivity: (childId) => api.get(`/parent/child/${childId}/activity`),
  getControls: (childId) => api.get(`/parent/child/${childId}/controls`),
  updateControls: (childId, data) => api.put(`/parent/child/${childId}/controls`, data),
};
