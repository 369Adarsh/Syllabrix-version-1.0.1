import api from '../api-client';
export const celebrationsAPI = {
  getFeed: (params) => api.get('/celebrations/feed', { params }),
  getUserCelebrations: (userId) => api.get(`/celebrations/${userId}`),
};
