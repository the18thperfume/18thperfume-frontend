import axios from 'axios';
import appConfig from './config';

// API client configuration
const apiClient = axios.create({
  baseURL: appConfig.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: appConfig.api.timeout,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(appConfig.auth.tokenKey);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem(appConfig.auth.tokenKey);
        localStorage.removeItem(appConfig.auth.refreshTokenKey);
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
