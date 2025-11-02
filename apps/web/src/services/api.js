import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token (if needed)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

// API Methods
export const api = {
  // Health check
  getHealth: () => apiClient.get('/health'),
  
  // Generic GET
  get: (endpoint) => apiClient.get(endpoint),
  
  // Generic POST
  post: (endpoint, data) => apiClient.post(endpoint, data),
  
  // Generic PUT
  put: (endpoint, data) => apiClient.put(endpoint, data),
  
  // Generic DELETE
  delete: (endpoint) => apiClient.delete(endpoint),
};

export default api;
