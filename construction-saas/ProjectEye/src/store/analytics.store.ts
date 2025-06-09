import { create } from 'zustand';
import { 
  analyticsApi, 
  DashboardData, 
  ProgressTrend, 
  BudgetBurnRate, 
  MilestoneTimeline,
  OrganizationAnalytics 
} from '../api/endpoints/analytics.api';

interface AnalyticsStore {
  dashboardData: DashboardData | null;
  progressTrends: ProgressTrend[];
  budgetBurnRate: BudgetBurnRate | null;
  milestoneTimeline: MilestoneTimeline[];
  organizationAnalytics: OrganizationAnalytics | null;
  
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardData: (projectId: string) => Promise<void>;
  fetchProgressTrends: (projectId: string, days?: number) => Promise<void>;
  fetchBudgetBurnRate: (projectId: string) => Promise<void>;
  fetchMilestoneTimeline: (projectId: string) => Promise<void>;
  fetchOrganizationAnalytics: () => Promise<void>;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  dashboardData: null,
  progressTrends: [],
  budgetBurnRate: null,
  milestoneTimeline: [],
  organizationAnalytics: null,
  
  isLoading: false,
  error: null,

  fetchDashboardData: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await analyticsApi.getDashboardData(projectId);
      set({ dashboardData: data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch dashboard data' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProgressTrends: async (projectId: string, days = 30) => {
    try {
      set({ isLoading: true, error: null });
      const data = await analyticsApi.getProgressTrends(projectId, days);
      set({ progressTrends: data.trends });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch progress trends' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBudgetBurnRate: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await analyticsApi.getBudgetBurnRate(projectId);
      set({ budgetBurnRate: data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch budget burn rate' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMilestoneTimeline: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await analyticsApi.getMilestoneTimeline(projectId);
      set({ milestoneTimeline: data.timeline });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch milestone timeline' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrganizationAnalytics: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await analyticsApi.getOrganizationAnalytics();
      set({ organizationAnalytics: data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch organization analytics' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));