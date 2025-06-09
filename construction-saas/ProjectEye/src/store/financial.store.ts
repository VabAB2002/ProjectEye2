import { create } from 'zustand';
import { financialApi } from '../api/endpoints/financial.api';

interface Transaction {
  id: string;
  type: 'EXPENSE' | 'PAYMENT' | 'ADVANCE';
  category: string;
  amount: number;
  description?: string;
  vendorName?: string;
  billNumber?: string;
  billDate?: string;
  paymentMode: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'UPI';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: any;
  approvedAt?: string;
  receiptUrl?: string;
  createdAt: string;
}

interface FinancialSummary {
  totalBudget: number;
  totalExpenses: number;
  totalPayments: number;
  totalAdvances: number;
  pendingApprovals: number;
  remainingBudget: number;
  budgetUtilization: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyExpenses: Array<{
    month: string;
    amount: number;
  }>;
}

interface FinancialState {
  transactions: Transaction[];
  summary: FinancialSummary | null;
  currentTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTransactions: (projectId: string, filters?: any) => Promise<void>;
  fetchSummary: (projectId: string) => Promise<void>;
  createTransaction: (projectId: string, data: FormData) => Promise<void>;
  approveTransaction: (projectId: string, transactionId: string, data: any) => Promise<void>;
  clearError: () => void;
}

export const useFinancialStore = create<FinancialState>((set) => ({
  transactions: [],
  summary: null,
  currentTransaction: null,
  isLoading: false,
  error: null,

  fetchTransactions: async (projectId, filters) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await financialApi.list(projectId, filters);
      if (response.success && response.data) {
        set({ 
          transactions: response.data.transactions,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch transactions',
        isLoading: false 
      });
    }
  },

  fetchSummary: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await financialApi.getSummary(projectId);
      if (response.success && response.data) {
        set({ 
          summary: response.data.summary,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to fetch summary',
        isLoading: false 
      });
    }
  },

  createTransaction: async (projectId, data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await financialApi.create(projectId, data);
      if (response.success) {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to create transaction',
        isLoading: false 
      });
      throw error;
    }
  },

  approveTransaction: async (projectId, transactionId, data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await financialApi.approve(projectId, transactionId, data);
      if (response.success) {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Failed to approve transaction',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));