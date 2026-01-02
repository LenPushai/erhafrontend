// ============================================================================
// ERHA FRONTEND - API CONFIGURATION
// ============================================================================

import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') as string,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url);
    console.error('Error details:', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;