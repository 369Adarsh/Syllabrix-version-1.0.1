import api from '../api-client';

export const profileAPI = {
  getById: (id) => api.get(`/profile/${id}`),
  getByUsername: (username) => api.get(`/profile/username/${username}`),
  update: (data) => api.put('/profile', data),
  getSuggestions: () => api.get('/profile/suggestions'),
};
