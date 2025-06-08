import { Project, ProjectMember, Milestone } from '@prisma/client';

export interface CreateProjectInput {
  name: string;
  type: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
  description?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  startDate: Date;
  estimatedEndDate: Date;
  totalBudget: number;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
  estimatedEndDate?: Date;
  totalBudget?: number;
  status?: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
}

export interface AddProjectMemberInput {
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
}

export interface ProjectWithDetails extends Project {
  members: ProjectMember[];
  milestones: Milestone[];
  _count: {
    progressUpdates: number;
    transactions: number;
    documents: number;
  };
}

export interface ProjectFilters {
  status?: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  type?: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
  search?: string;
}