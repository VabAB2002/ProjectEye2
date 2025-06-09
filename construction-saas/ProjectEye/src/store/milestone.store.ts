import { create } from 'zustand';
import { milestoneApi } from '../api/endpoints/milestone.api';

interface Milestone {
  id: string;
  name: string;
  description?: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  progressPercentage: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  order: number;
  parentId?: string;
  _count?: {
    progressUpdates: number;
    subMilestones?: number;
  };
  progressUpdates?: Array<{
    id: string;
    date: string;
    workDescription: string;
  }>;
  subMilestones?: Milestone[];
}

interface MilestoneProgress {
  milestone: Milestone;
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;
  isDelayed: boolean;
  delayDays: number;
  progressPercentage: number;
  timeProgressPercentage: number;
}

interface MilestoneState {
  milestones: Milestone[];
  currentMilestone: Milestone | null;
  milestoneProgress: MilestoneProgress | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMilestones: (projectId: string, filters?: any) => Promise<void>;
  fetchMilestone: (projectId: string, milestoneId: string) => Promise<void>;
  fetchMilestoneProgress: (projectId: string, milestoneId: string) => Promise<void>;
  createMilestone: (projectId: string, data: any) => Promise<void>;
  updateMilestone: (projectId: string, milestoneId: string, data: any) => Promise<void>;
  createFromTemplate: (projectId: string, projectType: string) => Promise<void>;
  linkProgressUpdate: (projectId: string, milestoneId: string, progressUpdateId: string) => Promise<void>;
  clearError: () => void;
}

export const useMilestoneStore = create<MilestoneState>((set) => ({
  milestones: [],
  currentMilestone: null,
  milestoneProgress: null,
  isLoading: false,
  error: null,

  fetchMilestones: async (projectId, filters) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await milestoneApi.list(projectId, filters);
      if (response.success && response.data) {
        set({ 
          milestones: response.data.milestones,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch milestones',
        isLoading: false 
      });
    }
  },

  fetchMilestone: async (projectId, milestoneId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await milestoneApi.getById(projectId, milestoneId);
      if (response.success && response.data) {
        set({ 
          currentMilestone: response.data.milestone,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch milestone',
        isLoading: false 
      });
    }
  },

  fetchMilestoneProgress: async (projectId, milestoneId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await milestoneApi.getProgress(projectId, milestoneId);
      if (response.success && response.data) {
        set({ 
          milestoneProgress: response.data.progress,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch milestone progress',
        isLoading: false 
      });
    }
  },

  createMilestone: async (projectId, data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await milestoneApi.create(projectId, data);
      if (response.success) {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to create milestone',
        isLoading: false 
      });
      throw error;
    }
  },

  updateMilestone: async (projectId, milestoneId, data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await milestoneApi.update(projectId, milestoneId, data);
      if (response.success) {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to update milestone',
        isLoading: false 
      });
      throw error;
    }
  },

  createFromTemplate: async (projectId, projectType) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await milestoneApi.createFromTemplate(projectId, projectType);
      if (response.success) {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to create milestones from template',
        isLoading: false 
      });
      throw error;
    }
  },

  linkProgressUpdate: async (projectId, milestoneId, progressUpdateId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await milestoneApi.linkProgress(projectId, milestoneId, progressUpdateId);
      if (response.success) {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to link progress update',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));