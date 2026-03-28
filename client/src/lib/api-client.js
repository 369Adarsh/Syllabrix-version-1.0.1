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
    // Only force-redirect to sign-in for session expiry (not for auth endpoints themselves,
    // which return 401 as a normal "wrong credentials" response)
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/google');
    if (error.response?.status === 401 && !isAuthEndpoint) {
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
