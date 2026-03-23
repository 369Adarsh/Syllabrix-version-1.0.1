import api from '../api-client';

export const groupsAPI = {
  create: (data) => api.post('/groups', data),
  getMyGroups: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  getMembers: (id) => api.get(`/groups/${id}/members`),
  addMember: (id, data) => api.post(`/groups/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/groups/${id}/members/${userId}`),
  leave: (id) => api.post(`/groups/${id}/leave`),
  getMessages: (id, params) => api.get(`/groups/${id}/messages`, { params }),
  sendMessage: (id, data) => api.post(`/groups/${id}/messages`, data),
};
