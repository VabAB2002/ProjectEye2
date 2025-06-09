import { api } from '../client';
import { ApiResponse } from '../types';

export const milestoneApi = {
  list: async (projectId: string, filters?: {
    status?: string;
    parentId?: string | null;
  }) => {
    const response = await api.get<ApiResponse<any>>(
      `/projects/${projectId}/milestones`,
      { params: filters }
    );
    return response.data;
  },

  getById: async (projectId: string, milestoneId: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/projects/${projectId}/milestones/${milestoneId}`
    );
    return response.data;
  },

  getProgress: async (projectId: string, milestoneId: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/projects/${projectId}/milestones/${milestoneId}/progress`
    );
    return response.data;
  },

  create: async (projectId: string, data: {
    name: string;
    description?: string;
    plannedStart: string;
    plannedEnd: string;
    parentId?: string;
    order: number;
  }) => {
    const response = await api.post<ApiResponse<any>>(
      `/projects/${projectId}/milestones`,
      data
    );
    return response.data;
  },

  update: async (projectId: string, milestoneId: string, data: any) => {
    const response = await api.patch<ApiResponse<any>>(
      `/projects/${projectId}/milestones/${milestoneId}`,
      data
    );
    return response.data;
  },

  createFromTemplate: async (projectId: string, projectType: 'RESIDENTIAL' | 'COMMERCIAL') => {
    const response = await api.post<ApiResponse<any>>(
      `/projects/${projectId}/milestones/template`,
      { projectType }
    );
    return response.data;
  },

  linkProgress: async (projectId: string, milestoneId: string, progressUpdateId: string) => {
    const response = await api.post<ApiResponse<any>>(
      `/projects/${projectId}/milestones/${milestoneId}/link-progress`,
      { progressUpdateId }
    );
    return response.data;
  },

  delete: async (projectId: string, milestoneId: string) => {
    const response = await api.delete<ApiResponse<any>>(
      `/projects/${projectId}/milestones/${milestoneId}`
    );
    return response.data;
  },
};