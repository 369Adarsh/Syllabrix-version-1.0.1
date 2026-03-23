import api from '../api-client';

export const followAPI = {
  toggle: (userId) => api.post(`/follow/${userId}`),
  getFollowers: (userId, params) => api.get(`/follow/${userId}/followers`, { params }),
  getFollowing: (userId, params) => api.get(`/follow/${userId}/following`, { params }),
  getStatus: (userId) => api.get(`/follow/${userId}/status`),
};
