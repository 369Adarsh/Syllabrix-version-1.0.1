import api from '../api-client';

export const postsAPI = {
  create: (data) => api.post('/posts', data),
  getFeed: (params) => api.get('/posts/feed', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  getUserPosts: (userId, params) => api.get(`/posts/user/${userId}`, { params }),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  like: (id, data) => api.post(`/likes/${id}`, data),
  getLikes: (id) => api.get(`/likes/${id}`),
  comment: (id, data) => api.post(`/comments/${id}`, data),
  getComments: (id, params) => api.get(`/comments/${id}`, { params }),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  share: (id) => api.post(`/shares/${id}`),
  toggleSave: (id) => api.post(`/saves/${id}`),
  getSaved: (params) => api.get('/saves', { params }),
};
