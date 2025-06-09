// src/store/progress.store.ts
import { create } from 'zustand';
import { progressApi } from '../api/endpoints/progress.api';

interface ProgressState {
  updates: any[];
  currentUpdate: any | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUpdates: (projectId: string) => Promise<void>;
  fetchUpdateByDate: (projectId: string, date: string) => Promise<void>;
  fetchUpdateById: (projectId: string, updateId: string) => Promise<void>;
  createUpdate: (projectId: string, data: FormData) => Promise<void>;
  clearCurrentUpdate: () => void;
  clearError: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  updates: [],
  currentUpdate: null,
  isLoading: false,
  error: null,

  fetchUpdates: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await progressApi.list(projectId);
      if (response.success && response.data) {
        set({ 
          updates: response.data.updates,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch updates',
        isLoading: false 
      });
    }
  },

  fetchUpdateByDate: async (projectId, date) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await progressApi.getByDate(projectId, date);
      if (response.success) {
        set({ 
          currentUpdate: response.data.progressUpdate,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch update',
        isLoading: false 
      });
    }
  },

  fetchUpdateById: async (projectId, updateId) => {
    try {
      set({ isLoading: true, error: null });
      
      // First try to find the update in the existing updates array
      const existingUpdate = get().updates.find(update => update.id === updateId);
      if (existingUpdate) {
        set({ 
          currentUpdate: existingUpdate,
          isLoading: false 
        });
        return;
      }

      // If not found, fetch from API
      const response = await progressApi.getById(projectId, updateId);
      if (response.success) {
        set({ 
          currentUpdate: response.data.progressUpdate,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch update',
        isLoading: false 
      });
    }
  },

  createUpdate: async (projectId, data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await progressApi.create(projectId, data);
      if (response.success) {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to create update',
        isLoading: false 
      });
      throw error;
    }
  },

  clearCurrentUpdate: () => set({ currentUpdate: null }),
  clearError: () => set({ error: null }),
}));