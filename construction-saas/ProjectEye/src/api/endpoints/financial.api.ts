import { api } from '../client';
import { ApiResponse } from '../types';

export const financialApi = {
  list: async (projectId: string, filters?: {
    type?: string;
    approvalStatus?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse<any>>(
      `/projects/${projectId}/transactions`,
      { params: filters }
    );
    return response.data;
  },

  getSummary: async (projectId: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/projects/${projectId}/transactions/summary`
    );
    return response.data;
  },

  getById: async (projectId: string, transactionId: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/projects/${projectId}/transactions/${transactionId}`
    );
    return response.data;
  },

  create: async (projectId: string, data: FormData) => {
    const response = await api.post<ApiResponse<any>>(
      `/projects/${projectId}/transactions`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  approve: async (projectId: string, transactionId: string, data: {
    approvalStatus: 'APPROVED' | 'REJECTED';
    remarks?: string;
  }) => {
    const response = await api.post<ApiResponse<any>>(
      `/projects/${projectId}/transactions/${transactionId}/approve`,
      data
    );
    return response.data;
  },

  update: async (projectId: string, transactionId: string, data: any) => {
    const response = await api.patch<ApiResponse<any>>(
      `/projects/${projectId}/transactions/${transactionId}`,
      data
    );
    return response.data;
  },

  delete: async (projectId: string, transactionId: string) => {
    const response = await api.delete<ApiResponse<any>>(
      `/projects/${projectId}/transactions/${transactionId}`
    );
    return response.data;
  },
};