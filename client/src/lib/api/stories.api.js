import apiClient from '@/lib/api-client';

export const storiesAPI = {
  getFeed: () => apiClient.get('/stories/feed'),
  create: (formData) => apiClient.post('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  markViewed: (storyId) => apiClient.post(`/stories/${storyId}/view`),
  delete: (storyId) => apiClient.delete(`/stories/${storyId}`),
};
