import api from '../api-client';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  googleLogin: (idToken) => api.post('/auth/google', { id_token: idToken }),
  completeProfile: (type, data) => api.post(`/auth/complete-profile/${type}`, data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};
