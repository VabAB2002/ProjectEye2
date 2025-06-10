import { api } from '../client';
import { 
  ApiResponse, 
  LoginInput, 
  RoleBasedLoginInput,
  LoginResponse, 
  RegistrationInput,
  RegistrationResponse,
  User 
} from '../types';

export const authApi = {
  register: async (registrationData: any) => {
    const response = await api.post<ApiResponse<RegistrationResponse>>('/auth/register', registrationData);
    return response.data;
  },

  login: async (credentials: LoginInput) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
  },

  roleBasedLogin: async (credentials: RoleBasedLoginInput) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/role-login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/profile');
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<any>>('/auth/logout', { refreshToken });
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<{ tokens: any }>>('/auth/refresh', { refreshToken });
    return response.data;
  },

  invite: async (inviteData: {
    email: string;
    phone?: string;
    firstName: string;
    lastName?: string;
    role?: string;
    password: string;
  }) => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/invite', inviteData);
    return response.data;
  },
};