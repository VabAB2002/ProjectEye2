import { create } from 'zustand';
import { apiClient, api } from '../api/client';
import { User, LoginInput, LoginResponse } from '../api/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.post<{ data: LoginResponse }>('/auth/login', credentials);
      const { user, tokens } = response.data.data;
      
      await apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Login failed',
        isLoading: false,
        isAuthenticated: false 
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = await apiClient.getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      await apiClient.clearTokens();
      set({ 
        user: null, 
        isAuthenticated: false,
        error: null 
      });
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      
      const token = await apiClient.getAccessToken();
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      const response = await api.get<{ data: { user: User } }>('/auth/profile');
      const user = response.data.data.user;
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      await apiClient.clearTokens();
      set({ 
        user: null,
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));