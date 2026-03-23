import api from '../api-client';

export const jobsAPI = {
  create: (data) => api.post('/jobs', data),
  list: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  getApplications: (id) => api.get(`/jobs/${id}/applications`),
  getMyPosts: () => api.get('/jobs/my-posts'),
  getMyApplications: () => api.get('/jobs/my-applications'),
};
