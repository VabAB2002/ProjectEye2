import { create } from 'zustand';
import { teamApi, TeamMember, AddTeamMemberInput } from '../api/endpoints/team.api';

interface TeamState {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMembers: (projectId: string) => Promise<void>;
  addMember: (projectId: string, data: AddTeamMemberInput) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  updateMember: (projectId: string, userId: string, data: Partial<AddTeamMemberInput>) => Promise<void>;
  clearError: () => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await teamApi.getMembers(projectId);
      if (response.success && response.data) {
        set({ 
          members: response.data.members,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch team members',
        isLoading: false 
      });
    }
  },

  addMember: async (projectId: string, data: AddTeamMemberInput) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await teamApi.addMember(projectId, data);
      if (response.success && response.data) {
        // Add the new member to the current list
        const currentMembers = get().members;
        set({ 
          members: [...currentMembers, response.data.member],
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to add team member',
        isLoading: false 
      });
      throw error;
    }
  },

  removeMember: async (projectId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await teamApi.removeMember(projectId, userId);
      
      // Remove the member from the current list
      const currentMembers = get().members;
      set({ 
        members: currentMembers.filter(member => member.userId !== userId),
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to remove team member',
        isLoading: false 
      });
      throw error;
    }
  },

  updateMember: async (projectId: string, userId: string, data: Partial<AddTeamMemberInput>) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await teamApi.updateMember(projectId, userId, data);
      if (response.success && response.data) {
        // Update the member in the current list
        const currentMembers = get().members;
        const updatedMembers = currentMembers.map(member =>
          member.userId === userId 
            ? { ...member, ...response.data.member }
            : member
        );
        set({ 
          members: updatedMembers,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to update team member',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));