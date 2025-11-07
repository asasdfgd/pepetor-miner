import api from './api';

const authService = {
  // Register new user
  register: async (credentials) => {
    try {
      const response = await api.post('/auth/register', {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        fullName: credentials.fullName || '',
      });
      
      if (response.success && response.data) {
        return {
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        };
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      if (response.success && response.data) {
        return {
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        };
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh-token', {
        refreshToken,
      });
      
      if (response.success && response.data) {
        return {
          accessToken: response.data.accessToken,
        };
      }
      
      throw new Error(response.message || 'Token refresh failed');
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout', {});
      return response.success;
    } catch (error) {
      // Logout locally even if backend request fails
      return true;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch profile');
    } catch (error) {
      throw error;
    }
  },

  // Wallet authentication
  walletAuth: async (walletAddress, signature = null, message = null) => {
    try {
      const response = await api.post('/auth/wallet-auth', {
        walletAddress,
        signature,
        message,
      });
      
      if (response.success && response.data) {
        return {
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        };
      }
      
      throw new Error(response.message || 'Wallet authentication failed');
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
export const { register, login, logout, refreshToken, getProfile, walletAuth } = authService;