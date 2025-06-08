import { Transaction, TransactionType, PaymentMode, ApprovalStatus } from '@prisma/client';

export interface CreateTransactionInput {
  type: TransactionType;
  category: string;
  amount: number;
  description?: string;
  vendorName?: string;
  billNumber?: string;
  billDate?: Date;
  paymentMode: PaymentMode;
}

export interface UpdateTransactionInput {
  category?: string;
  amount?: number;
  description?: string;
  vendorName?: string;
  billNumber?: string;
  billDate?: Date;
  paymentMode?: PaymentMode;
}

export interface ApproveTransactionInput {
  approvalStatus: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

export interface TransactionWithDetails extends Transaction {
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  project: {
    id: string;
    name: string;
  };
}

export interface TransactionFilters {
  type?: TransactionType;
  approvalStatus?: ApprovalStatus;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface FinancialSummary {
  totalBudget: number;
  totalExpenses: number;
  totalPayments: number;
  totalAdvances: number;
  pendingApprovals: number;
  remainingBudget: number;
  budgetUtilization: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyExpenses: {
    month: string;
    amount: number;
  }[];
}

// Common expense categories for construction
export const EXPENSE_CATEGORIES = [
  'MATERIAL',
  'LABOR',
  'EQUIPMENT',
  'TRANSPORTATION',
  'UTILITIES',
  'PROFESSIONAL_FEES',
  'PERMITS',
  'INSURANCE',
  'MISCELLANEOUS'
];