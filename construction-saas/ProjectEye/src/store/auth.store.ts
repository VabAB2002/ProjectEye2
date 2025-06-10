// src/store/auth.store.ts
import { create } from 'zustand';
import { apiClient, api } from '../api/client';
import { User, LoginInput, LoginResponse, RegistrationInput, RegistrationResponse } from '../api/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginInput) => Promise<void>;
  register: (registrationData: RegistrationInput) => Promise<void>;
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

  register: async (registrationData) => {
    try {
      set({ isLoading: true, error: null });
      
      // Transform registration data to match backend expectations
      const backendData = transformRegistrationData(registrationData);
      
      const response = await api.post<{ data: RegistrationResponse }>('/auth/register', backendData);
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
        error: error.response?.data?.error?.message || 'Registration failed',
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

// Helper function to transform frontend registration data to backend format
function transformRegistrationData(data: RegistrationInput) {
  // Map our frontend roles to backend roles
  const roleMapping = {
    'VIEWER': 'VIEWER',
    'CONTRACTOR': 'CONTRACTOR', 
    'OWNER': 'OWNER'
  };

  // Map budget ranges to more descriptive organization types
  const getBudgetDescription = (range: string) => {
    switch (range) {
      case 'UNDER_10L': return 'Small Projects (Under ₹10L)';
      case '10L_50L': return 'Medium Projects (₹10L-₹50L)';
      case '50L_1CR': return 'Large Projects (₹50L-₹1Cr)';
      case 'ABOVE_1CR': return 'Enterprise Projects (Above ₹1Cr)';
      default: return 'General Construction';
    }
  };

  // Base transformation
  const baseData = {
    email: data.email,
    phone: data.phone,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName || '',
    role: roleMapping[data.role],
  };

  // Add organization data based on role
  let organizationData;

  switch (data.role) {
    case 'VIEWER':
      // Field workers get a simple organization
      organizationData = {
        organizationName: `${data.firstName}'s Profile`,
        organizationType: 'INDIVIDUAL'
      };
      break;
      
    case 'CONTRACTOR':
      organizationData = {
        organizationName: (data as any).companyName || `${data.firstName}'s Contracting`,
        organizationType: 'COMPANY',
        licenseNumber: (data as any).licenseNumber
      };
      break;
      
    case 'OWNER':
      organizationData = {
        organizationName: (data as any).companyName || `${data.firstName}'s Projects`,
        organizationType: 'COMPANY',
        projectBudgetRange: getBudgetDescription((data as any).projectBudgetRange)
      };
      break;
      
    default:
      organizationData = {
        organizationName: `${data.firstName}'s Organization`,
        organizationType: 'INDIVIDUAL'
      };
  }

  return {
    ...baseData,
    ...organizationData
  };
}