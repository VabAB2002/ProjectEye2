import { prisma } from '../database/prisma';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  ApproveTransactionInput,
  TransactionWithDetails,
  TransactionFilters,
  FinancialSummary
} from '../../types/financial.types';
import { AppError } from '../../api/middlewares/error.middleware';
import { logger } from '../utils/logger';
import { StorageService } from './storage.service';
import { Prisma } from '@prisma/client';

export class FinancialService {
  static async createTransaction(
    projectId: string,
    input: CreateTransactionInput,
    createdBy: string,
    receiptFile?: Express.Multer.File
  ): Promise<TransactionWithDetails> {
    // Validate project budget
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { totalBudget: true }
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // If expense, check if it exceeds budget
    if (input.type === 'EXPENSE') {
      const totalExpenses = await this.getTotalExpenses(projectId);
      if (totalExpenses + input.amount > Number(project.totalBudget)) {
        logger.warn(`Budget exceeded for project ${projectId}`);
        // Still allow but flag it
      }
    }

    let receiptUrl: string | undefined;

    // Upload receipt if provided
    if (receiptFile) {
      const { url } = await StorageService.uploadImage(
        receiptFile,
        `projects/${projectId}/receipts`
      );
      receiptUrl = url;
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        projectId,
        type: input.type,
        category: input.category,
        amount: input.amount,
        description: input.description,
        vendorName: input.vendorName,
        billNumber: input.billNumber,
        billDate: input.billDate ? new Date(input.billDate) : null,
        paymentMode: input.paymentMode,
        receiptUrl,
        approvalStatus: 'PENDING',
      },
      include: {
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`Transaction created: ${transaction.id} by user ${createdBy}`);

    // TODO: Send notification to project owner for approval

    return transaction as TransactionWithDetails;
  }

  static async updateTransaction(
    transactionId: string,
    projectId: string,
    input: UpdateTransactionInput
  ): Promise<TransactionWithDetails> {
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        projectId,
      },
    });

    if (!existingTransaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (existingTransaction.approvalStatus !== 'PENDING') {
      throw new AppError('Cannot update approved or rejected transactions', 400);
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...input,
        billDate: input.billDate ? new Date(input.billDate) : undefined,
      },
      include: {
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated as TransactionWithDetails;
  }

  static async approveTransaction(
    transactionId: string,
    projectId: string,
    input: ApproveTransactionInput,
    approverId: string
  ): Promise<TransactionWithDetails> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        projectId,
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.approvalStatus !== 'PENDING') {
      throw new AppError('Transaction has already been processed', 400);
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        approvalStatus: input.approvalStatus,
        approvedBy: approverId,
        approvedAt: new Date(),
        metadata: input.remarks ? { remarks: input.remarks } : undefined,
      },
      include: {
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(
      `Transaction ${transactionId} ${input.approvalStatus.toLowerCase()} by ${approverId}`
    );

    return updated as TransactionWithDetails;
  }

  static async getTransaction(
    transactionId: string,
    projectId: string
  ): Promise<TransactionWithDetails> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        projectId,
      },
      include: {
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction as TransactionWithDetails;
  }

  static async listTransactions(
    projectId: string,
    filters: TransactionFilters,
    page = 1,
    limit = 10
  ) {
    // Build amount filter first
    let amount: { gte?: number; lte?: number } = {};
    if (filters.minAmount !== undefined) amount.gte = filters.minAmount;
    if (filters.maxAmount !== undefined) amount.lte = filters.maxAmount;

    // Now build where
    const where: Prisma.TransactionWhereInput = {
      projectId,
      ...(filters.type && { type: filters.type }),
      ...(filters.approvalStatus && { approvalStatus: filters.approvalStatus }),
      ...(filters.category && { category: filters.category }),
      ...(Object.keys(amount).length > 0 && { amount }),
    };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getFinancialSummary(projectId: string): Promise<FinancialSummary> {
    const [project, transactions] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        select: { totalBudget: true },
      }),
      prisma.transaction.findMany({
        where: { projectId },
        select: {
          type: true,
          category: true,
          amount: true,
          approvalStatus: true,
          createdAt: true,
        },
      }),
    ]);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const approvedTransactions = transactions.filter(
      (t) => t.approvalStatus === 'APPROVED'
    );

    // Calculate totals
    const totalExpenses = approvedTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPayments = approvedTransactions
      .filter((t) => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalAdvances = approvedTransactions
      .filter((t) => t.type === 'ADVANCE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const pendingApprovals = transactions.filter(
      (t) => t.approvalStatus === 'PENDING'
    ).length;

    const totalBudget = Number(project.totalBudget);
    const remainingBudget = totalBudget - totalExpenses;
    const budgetUtilization = (totalExpenses / totalBudget) * 100;

    // Category breakdown
    const categoryMap = new Map<string, number>();
    approvedTransactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + Number(t.amount));
      });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100,
      })
    );

    // Monthly expenses
    const monthlyMap = new Map<string, number>();
    approvedTransactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const month = new Date(t.createdAt).toISOString().slice(0, 7); // YYYY-MM
        const current = monthlyMap.get(month) || 0;
        monthlyMap.set(month, current + Number(t.amount));
      });

    const monthlyExpenses = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalBudget,
      totalExpenses,
      totalPayments,
      totalAdvances,
      pendingApprovals,
      remainingBudget,
      budgetUtilization,
      categoryBreakdown,
      monthlyExpenses,
    };
  }

  static async deleteTransaction(transactionId: string, projectId: string): Promise<void> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        projectId,
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.approvalStatus === 'APPROVED') {
      throw new AppError('Cannot delete approved transactions', 400);
    }

    // Delete receipt from storage if exists
    if (transaction.receiptUrl) {
      const key = transaction.receiptUrl.split('/').slice(-2).join('/');
      await StorageService.deleteFile(key);
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    logger.info(`Transaction ${transactionId} deleted`);
  }

  private static async getTotalExpenses(projectId: string): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: {
        projectId,
        type: 'EXPENSE',
        approvalStatus: 'APPROVED',
      },
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount || 0);
  }
}