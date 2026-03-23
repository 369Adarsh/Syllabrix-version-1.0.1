import api from '../api-client';
export const materialsAPI = {
  list: (params) => api.get('/materials', { params }),
  getById: (id) => api.get(`/materials/${id}`),
  upload: (data) => api.post('/materials', data),
  download: (id) => api.post(`/materials/${id}/download`),
};
