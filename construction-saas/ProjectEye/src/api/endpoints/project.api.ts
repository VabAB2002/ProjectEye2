import { api } from '../client';
import { ApiResponse, Project, ProjectStats } from '../types';

export const projectApi = {
  list: async (params?: {
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse<{
      projects: Project[];
      pagination: any;
    }>>('/projects', { params });
    return response.data;
  },

  getById: async (projectId: string) => {
    const response = await api.get<ApiResponse<{ project: Project }>>(`/projects/${projectId}`);
    return response.data;
  },

  getStats: async (projectId: string) => {
    const response = await api.get<ApiResponse<{ stats: ProjectStats }>>(`/projects/${projectId}/stats`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post<ApiResponse<{ project: Project }>>('/projects', data);
    return response.data;
  },

  update: async (projectId: string, data: any) => {
    const response = await api.patch<ApiResponse<{ project: Project }>>(`/projects/${projectId}`, data);
    return response.data;
  },
};