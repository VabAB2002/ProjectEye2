import { body, param, query, ValidationChain } from 'express-validator';
import { EXPENSE_CATEGORIES } from '../../types/financial.types';

export const createTransactionValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  body('type')
    .isIn(['EXPENSE', 'PAYMENT', 'ADVANCE'])
    .withMessage('Invalid transaction type'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(EXPENSE_CATEGORIES)
    .withMessage('Invalid category'),
  
  body('amount')
    .isFloat({ min: 0.01, max: 1000000000 })
    .withMessage('Amount must be between 0.01 and 1,00,00,00,000'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('vendorName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Vendor name must be between 2 and 100 characters'),
  
  body('billNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Bill number must not exceed 50 characters'),
  
  body('billDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid bill date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Bill date cannot be in the future');
      }
      return true;
    }),
  
  body('paymentMode')
    .isIn(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI'])
    .withMessage('Invalid payment mode'),
];

export const updateTransactionValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  param('transactionId')
    .isUUID()
    .withMessage('Invalid transaction ID'),
  
  body('category')
    .optional()
    .trim()
    .isIn(EXPENSE_CATEGORIES)
    .withMessage('Invalid category'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01, max: 1000000000 })
    .withMessage('Amount must be between 0.01 and 1,00,00,00,000'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('vendorName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Vendor name must be between 2 and 100 characters'),
  
  body('billNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Bill number must not exceed 50 characters'),
  
  body('billDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid bill date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Bill date cannot be in the future');
      }
      return true;
    }),
  
  body('paymentMode')
    .optional()
    .isIn(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI'])
    .withMessage('Invalid payment mode'),
];

export const approveTransactionValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  param('transactionId')
    .isUUID()
    .withMessage('Invalid transaction ID'),
  
  body('approvalStatus')
    .isIn(['APPROVED', 'REJECTED'])
    .withMessage('Invalid approval status'),
  
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Remarks must not exceed 200 characters'),
];

export const listTransactionsValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  query('type')
    .optional()
    .isIn(['EXPENSE', 'PAYMENT', 'ADVANCE'])
    .withMessage('Invalid transaction type'),
  
  query('approvalStatus')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED'])
    .withMessage('Invalid approval status'),
  
  query('category')
    .optional()
    .isIn(EXPENSE_CATEGORIES)
    .withMessage('Invalid category'),
  
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be positive'),
  
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be positive'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const transactionIdValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  param('transactionId')
    .isUUID()
    .withMessage('Invalid transaction ID'),
];