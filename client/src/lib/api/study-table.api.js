import api from '../api-client';

export const studyTableApi = {
  getWorkspaces: () => api.get('/study-table'),
  createWorkspace: (data) => api.post('/study-table', data),
  getWorkspaceDetails: (id) => api.get(`/study-table/${id}`),
  uploadDocument: (id, formData) => api.post(`/study-table/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  generateArtifact: (id, data) => api.post(`/study-table/${id}/artifacts`, data),
  getArtifact: (id, artifactId) => api.get(`/study-table/${id}/artifacts/${artifactId}`),
  chat: (id, data) => api.post(`/study-table/${id}/chat`, data)
};
