import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

// Add request interceptor for auth token
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

// Add response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        return apiClient.post('/auth/refresh-token', { refreshToken })
          .then(response => {
            const newToken = response.data?.accessToken || response.accessToken;
            localStorage.setItem('authToken', newToken);
            apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            return apiClient(originalRequest);
          })
          .catch(err => {
            processQueue(err, null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(err);
          });
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        return Promise.reject(error);
      }
    }

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
