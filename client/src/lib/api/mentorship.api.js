import api from '../api-client';
export const mentorshipAPI = {
  getMentors: (params) => api.get('/mentorship/mentors', { params }),
  getMentor: (id) => api.get(`/mentorship/mentors/${id}`),
  setupProfile: (data) => api.post('/mentorship/setup-profile', data),
  apply: (data) => api.post('/mentorship/apply', data),
  getMyApplications: () => api.get('/mentorship/my-applications'),
  getMenteeApplications: () => api.get('/mentorship/my-mentees'),
  updateApplication: (id, data) => api.put(`/mentorship/applications/${id}`, data),
  getMyMentees: () => api.get('/mentorship/mentees'),
  getMyMentor: () => api.get('/mentorship/my-mentor'),
  createSession: (data) => api.post('/mentorship/sessions', data),
  getSessions: () => api.get('/mentorship/sessions'),
  updateSession: (id, data) => api.put(`/mentorship/sessions/${id}`, data),
};
