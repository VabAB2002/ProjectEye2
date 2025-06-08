import { prisma } from '../src/core/database/prisma';
import { TransactionType, PaymentMode, ApprovalStatus } from '@prisma/client';
import { EXPENSE_CATEGORIES } from '../src/types/financial.types';

async function seedTransactions(projectId: string) {
  const transactions = [
    {
      type: 'EXPENSE' as TransactionType,
      category: 'MATERIAL',
      amount: 150000,
      description: 'Cement bags - 500 units',
      vendorName: 'ABC Cement Suppliers',
      billNumber: 'INV-2025-001',
      billDate: new Date('2025-01-10'),
      paymentMode: 'BANK_TRANSFER' as PaymentMode,
      approvalStatus: 'APPROVED' as ApprovalStatus,
    },
    {
      type: 'EXPENSE' as TransactionType,
      category: 'LABOR',
      amount: 25000,
      description: 'Weekly labor payment',
      vendorName: 'Labor Contractor',
      paymentMode: 'CASH' as PaymentMode,
      approvalStatus: 'APPROVED' as ApprovalStatus,
    },
    {
      type: 'PAYMENT' as TransactionType,
      category: 'MISCELLANEOUS',
      amount: 50000,
      description: 'Advance payment from client',
      paymentMode: 'BANK_TRANSFER' as PaymentMode,
      approvalStatus: 'APPROVED' as ApprovalStatus,
    },
    {
      type: 'EXPENSE' as TransactionType,
      category: 'EQUIPMENT',
      amount: 5000,
      description: 'Scaffolding rental',
      vendorName: 'Equipment Rentals Ltd',
      paymentMode: 'UPI' as PaymentMode,
      approvalStatus: 'PENDING' as ApprovalStatus,
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: {
        projectId,
        ...transaction,
      },
    });
  }

  console.log('Test transactions created');
}

// Usage: ts-node scripts/seed-transactions.ts PROJECT_ID
const projectId = process.argv[2];
if (projectId) {
  seedTransactions(projectId)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} else {
  console.error('Please provide a project ID');
  process.exit(1);
}