import api from '../api-client';

export const safetyAPI = {
  block: (userId) => api.post(`/safety/block/${userId}`),
  unblock: (userId) => api.delete(`/safety/block/${userId}`),
  getBlocked: () => api.get('/safety/blocked'),
  report: (data) => api.post('/safety/report', data),
};
