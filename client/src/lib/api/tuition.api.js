import api from '../api-client';

export const tuitionAPI = {
  create: (data) => api.post('/tuition', data),
  list: (params) => api.get('/tuition', { params }),
  getById: (id) => api.get(`/tuition/${id}`),
  update: (id, data) => api.put(`/tuition/${id}`, data),
  delete: (id) => api.delete(`/tuition/${id}`),
  getMyAds: () => api.get('/tuition/my-ads'),
};
