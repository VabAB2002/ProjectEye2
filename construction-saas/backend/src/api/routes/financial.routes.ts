import { Router } from 'express';
import { FinancialController } from '../controllers/financial.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkProjectAccess, checkProjectPermission } from '../middlewares/project.middleware';
import { validate } from '../middlewares/validation.middleware';
import { uploadReceipt } from '../middlewares/upload.middleware';
import {
  createTransactionValidator,
  updateTransactionValidator,
  approveTransactionValidator,
  listTransactionsValidator,
  transactionIdValidator,
} from '../validators/financial.validator';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// All routes require project access
router.use(checkProjectAccess);

// List transactions (with view financials permission)
router.get(
  '/',
  checkProjectPermission('canViewFinancials'),
  listTransactionsValidator,
  validate,
  FinancialController.listTransactions
);

// Get financial summary
router.get(
  '/summary',
  checkProjectPermission('canViewFinancials'),
  FinancialController.getFinancialSummary
);

// Get specific transaction
router.get(
  '/:transactionId',
  checkProjectPermission('canViewFinancials'),
  transactionIdValidator,
  validate,
  FinancialController.getTransaction
);

// Create transaction (any member can create)
router.post(
  '/',
  uploadReceipt,  // Changed from uploadSinglePhoto
  createTransactionValidator,
  validate,
  FinancialController.createTransaction
);

// Update transaction (only if pending)
router.patch(
  '/:transactionId',
  updateTransactionValidator,
  validate,
  FinancialController.updateTransaction
);

// Approve/Reject transaction (requires approval permission)
router.post(
  '/:transactionId/approve',
  checkProjectPermission('canApproveExpenses'),
  approveTransactionValidator,
  validate,
  FinancialController.approveTransaction
);

// Delete transaction (only if pending)
router.delete(
  '/:transactionId',
  transactionIdValidator,
  validate,
  FinancialController.deleteTransaction
);

export const financialRouter = router;