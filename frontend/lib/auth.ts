import { authAPI } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  random_image_id: number;
  xp_total: number;
  streak_count: number;
  last_active_date?: string;
  title: string;
  study_time: number;
  rank?: number;
  recent_activities?: any[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const auth = {
  // Login user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('🔧 Auth.login called with:', { email, password });
      const response = await authAPI.login(email, password);
      console.log('📦 Auth API response:', response);
      
      // Handle both mock and real API response structures
      let user, token;
      if (response.data.data.user && response.data.data.token) {
        // Mock response structure
        user = response.data.data.user;
        token = response.data.data.token;
      } else if (response.data.data && response.data.token) {
        // Real API response structure
        user = response.data.data;
        token = response.data.token;
      } else {
        throw new Error('Invalid response structure');
      }
      
      console.log('👤 Extracted user and token:', { user, token });
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error: any) {
      console.error('❌ Auth login error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  },

  // Register user
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authAPI.register(name, email, password);
      const { user, token } = response.data.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Get token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  },

  // Refresh user data
  refreshUser: async (): Promise<User> => {
    try {
      const response = await authAPI.me();
      const user = response.data.data;
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      // If refresh fails, logout user
      auth.logout();
      throw new Error('Session expired');
    }
  },

  // Update user data in localStorage
  updateUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};
