import { api } from '../client';
import { 
  ApiResponse, 
  LoginInput, 
  LoginResponse, 
  User 
} from '../types';

export const authApi = {
  login: async (credentials: LoginInput) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
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
};