import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s for normal requests
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('syllabrix_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  // Extend timeout for file uploads
  if (config.headers['Content-Type'] === 'multipart/form-data') {
    config.timeout = 120000; // 2 minutes for uploads (video can be large)
  }
  return config;
});

// Response interceptor — handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('syllabrix_token');
        localStorage.removeItem('syllabrix_user');
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
