import api from '../api-client';
export const experienceAPI = {
  getSectors: () => api.get('/experience/sectors'),
  getProfessions: (params) => api.get('/experience/professions', { params }),
  getProfession: (slug) => api.get(`/experience/professions/${slug}`),
  getActivity: (id) => api.get(`/experience/activities/${id}`),
  startActivity: (id) => api.post(`/experience/activities/${id}/start`),
  submitActivity: (id, data) => api.post(`/experience/activities/${id}/submit`, data),
  getMyProgress: () => api.get('/experience/my-progress'),
  getProgressForProfession: (id) => api.get(`/experience/my-progress/${id}`),
  createTeam: (data) => api.post('/experience/teams', data),
  getTeam: (id) => api.get(`/experience/teams/${id}`),
  joinTeam: (id) => api.post(`/experience/teams/${id}/join`),
  leaveTeam: (id) => api.post(`/experience/teams/${id}/leave`),
};
