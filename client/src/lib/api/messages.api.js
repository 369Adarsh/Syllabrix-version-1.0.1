import api from '../api-client';

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId, params) => api.get(`/messages/${userId}`, { params }),
  send: (userId, data) => api.post(`/messages/${userId}`, data),
  markRead: (msgId) => api.put(`/messages/${msgId}/read`),
  delete: (msgId) => api.delete(`/messages/${msgId}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
};
