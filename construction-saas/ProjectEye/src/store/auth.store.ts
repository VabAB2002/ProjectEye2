// src/store/auth.store.ts - Updated with registration functionality
import { create } from 'zustand';
import { apiClient, api } from '../api/client';
import { authApi } from '../api/endpoints/auth.api';
import { 
  User, 
  LoginInput, 
  RoleBasedLoginInput,
  LoginResponse, 
  RegistrationInput, 
  RegistrationResponse,
  FieldWorkerRegistrationInput,
  ContractorRegistrationInput,
  OwnerRegistrationInput,
  UserRole
} from '../api/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginInput) => Promise<void>;
  roleBasedLogin: (credentials: RoleBasedLoginInput) => Promise<void>;
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
      
      const response = await authApi.login(credentials);
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        await apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Login failed',
        isLoading: false,
        isAuthenticated: false 
      });
      throw error;
    }
  },

  roleBasedLogin: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authApi.roleBasedLogin(credentials);
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        await apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
      } else {
        throw new Error('Role-based login failed');
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Role-based login failed',
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
      
      const response = await authApi.register(backendData);
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        await apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
      } else {
        throw new Error('Registration failed');
      }
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

      const response = await authApi.getProfile();
      if (response.success && response.data) {
        const user = response.data.user;
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        throw new Error('Failed to get profile');
      }
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
function transformRegistrationData(data: FieldWorkerRegistrationInput | ContractorRegistrationInput | OwnerRegistrationInput) {
  // Map our frontend roles to backend roles
  const roleMapping = {
    'VIEWER': 'VIEWER',
    'CONTRACTOR': 'CONTRACTOR', 
    'OWNER': 'OWNER'
  };

  // Map budget ranges to organization descriptions
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
    role: roleMapping[data.role], // Add role to the data sent to backend
  };

  // Add organization data based on role
  let organizationData;

  switch (data.role) {
    case 'VIEWER':
      // Field workers get a simple individual organization
      organizationData = {
        organizationName: `${data.firstName}'s Profile`,
        organizationType: 'INDIVIDUAL' as const
      };
      break;
      
    case 'CONTRACTOR':
      organizationData = {
        organizationName: (data as any).companyName || `${data.firstName}'s Contracting`,
        organizationType: 'COMPANY' as const,
      };
      break;
      
    case 'OWNER':
      organizationData = {
        organizationName: (data as any).companyName || `${data.firstName}'s Projects`,
        organizationType: 'COMPANY' as const,
      };
      break;
      
    default:
      organizationData = {
        organizationName: `${(data as any).firstName}'s Organization`,
        organizationType: 'INDIVIDUAL' as const
      };
  }

  return {
    ...baseData,
    ...organizationData
  };
}