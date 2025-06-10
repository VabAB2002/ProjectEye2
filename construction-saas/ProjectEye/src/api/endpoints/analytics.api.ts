import { api } from '../client';

export interface DashboardData {
  project: {
    id: string;
    name: string;
    status: string;
    budget: number;
    startDate: string;
    estimatedEndDate: string;
    daysRemaining: number;
    isDelayed: boolean;
  };
  metrics: {
    totalSpent: number;
    budgetUtilization: number;
    progressUpdates: number;
    completedMilestones: number;
    totalMilestones: number;
    teamMembers: number;
    pendingApprovals: number;
  };
}

export interface ProgressTrend {
  date: string;
  workerCount: number;
  weatherCondition: string;
  hasIssues: boolean;
}

export interface BudgetBurnRate {
  burnRate: Array<{
    date: string;
    cumulativeSpent: number;
    budgetRemaining: number;
  }>;
  project: {
    budget: number;
    dailyBudgetTarget: number;
    totalDays: number;
  };
}

export interface MilestoneTimeline {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  actualStart?: string;
  actualEnd?: string;
  progress: number;
  isDelayed: boolean;
}

export interface OrganizationAnalytics {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
  };
  financial: {
    totalBudget: number;
    totalExpenses: number;
    budgetUtilization: number;
  };
  projectTypes: Array<{
    type: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    name: string;
    status: string;
    lastUpdate: string;
  }>;
}

export const analyticsApi = {
  getDashboardData: async (projectId: string): Promise<DashboardData> => {
    const response = await api.get(`/analytics/projects/${projectId}/dashboard`);
    return response.data.data;
  },

  getProgressTrends: async (projectId: string, days: number = 30): Promise<{ trends: ProgressTrend[] }> => {
    const response = await api.get(`/analytics/projects/${projectId}/progress-trends?days=${days}`);
    return response.data.data;
  },

  getBudgetBurnRate: async (projectId: string): Promise<BudgetBurnRate> => {
    const response = await api.get(`/analytics/projects/${projectId}/budget-burn-rate`);
    return response.data.data;
  },

  getMilestoneTimeline: async (projectId: string): Promise<{ timeline: MilestoneTimeline[] }> => {
    const response = await api.get(`/analytics/projects/${projectId}/milestone-timeline`);
    return response.data.data;
  },

  getOrganizationAnalytics: async (): Promise<OrganizationAnalytics> => {
    const response = await api.get('/analytics/organization');
    return response.data.data;
  },

  getProjectOverview: async (projectId: string) => {
    const response = await api.get(`/analytics/projects/${projectId}/overview`);
    return response.data.data;
  },

  getFinancialAnalytics: async (projectId: string) => {
    const response = await api.get(`/analytics/projects/${projectId}/financial`);
    return response.data.data;
  },

  getMilestoneAnalytics: async (projectId: string) => {
    const response = await api.get(`/analytics/projects/${projectId}/milestones`);
    return response.data.data;
  },

  getTeamAnalytics: async (projectId: string) => {
    const response = await api.get(`/analytics/projects/${projectId}/team`);
    return response.data.data;
  },
};