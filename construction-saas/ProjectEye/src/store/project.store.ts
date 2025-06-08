import { create } from 'zustand';
import { Project, ProjectStats } from '../api/types';
import { projectApi } from '../api/endpoints/project.api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  currentProjectStats: ProjectStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: (filters?: any) => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  currentProjectStats: null,
  isLoading: false,
  error: null,

  fetchProjects: async (filters) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await projectApi.list(filters);
      if (response.success && response.data) {
        set({ 
          projects: response.data.projects,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch projects',
        isLoading: false 
      });
    }
  },

  selectProject: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      
      const [projectResponse, statsResponse] = await Promise.all([
        projectApi.getById(projectId),
        projectApi.getStats(projectId)
      ]);

      if (projectResponse.success && projectResponse.data) {
        set({ 
          currentProject: projectResponse.data.project,
          currentProjectStats: statsResponse.data?.stats || null,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch project details',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));