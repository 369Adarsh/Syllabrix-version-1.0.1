import api from '../api-client';
export const badgesAPI = {
  getAll: () => api.get('/badges'),
  getMyBadges: () => api.get('/badges/my-badges'),
  getUserBadges: (userId) => api.get(`/badges/${userId}`),
};
