// src/api/endpoints/progress.api.ts
import { api } from '../client';
import { ApiResponse } from '../types';

export const progressApi = {
  list: async (projectId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get<ApiResponse<any>>(`/projects/${projectId}/progress`, { params });
    return response.data;
  },

  getById: async (projectId: string, updateId: string) => {
    const response = await api.get<ApiResponse<any>>(`/projects/${projectId}/progress/${updateId}`);
    return response.data;
  },

  getByDate: async (projectId: string, date: string) => {
    const response = await api.get<ApiResponse<any>>(`/projects/${projectId}/progress/date/${date}`);
    return response.data;
  },

  create: async (projectId: string, data: FormData) => {
    const response = await api.post<ApiResponse<any>>(
      `/projects/${projectId}/progress`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  update: async (projectId: string, updateId: string, data: any) => {
    const response = await api.patch<ApiResponse<any>>(
      `/projects/${projectId}/progress/${updateId}`,
      data
    );
    return response.data;
  },

  deletePhoto: async (projectId: string, updateId: string, photoId: string) => {
    const response = await api.delete<ApiResponse<any>>(
      `/projects/${projectId}/progress/${updateId}/photos/${photoId}`
    );
    return response.data;
  },
};