import { apiClient } from '../client';

export interface TeamMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  permissions: {
    canViewFinancials: boolean;
    canApproveExpenses: boolean;
    canEditProject: boolean;
    canAddMembers: boolean;
    canUploadDocuments: boolean;
    canCreateMilestones: boolean;
  };
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    role: string;
    createdAt: string;
  };
}

export interface AddTeamMemberInput {
  userId: string;
  role: 'OWNER' | 'PROJECT_MANAGER' | 'CONTRACTOR' | 'SUPERVISOR' | 'VIEWER';
  permissions?: {
    canViewFinancials?: boolean;
    canApproveExpenses?: boolean;
    canEditProject?: boolean;
    canAddMembers?: boolean;
    canUploadDocuments?: boolean;
    canCreateMilestones?: boolean;
  };
}

export const teamApi = {
  // Get all team members for a project
  getMembers: async (projectId: string) => {
    const response = await apiClient.get(`/projects/${projectId}/members`);
    return response.data;
  },

  // Add a new team member
  addMember: async (projectId: string, data: AddTeamMemberInput) => {
    const response = await apiClient.post(`/projects/${projectId}/members`, data);
    return response.data;
  },

  // Remove a team member
  removeMember: async (projectId: string, userId: string) => {
    const response = await apiClient.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  // Update team member role/permissions (when backend supports it)
  updateMember: async (projectId: string, userId: string, data: Partial<AddTeamMemberInput>) => {
    const response = await apiClient.patch(`/projects/${projectId}/members/${userId}`, data);
    return response.data;
  },
};