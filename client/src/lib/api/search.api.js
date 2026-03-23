import api from '../api-client';

export const searchAPI = {
  search: (params) => api.get('/search', { params }),
  getTrending: () => api.get('/search/trending'),
  getHistory: () => api.get('/search/history'),
  clearHistory: () => api.delete('/search/history'),
};
