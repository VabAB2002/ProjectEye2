import { body, param, query, ValidationChain } from 'express-validator';

export const createProjectValidator: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Project name must be between 3 and 100 characters'),
  
  body('type')
    .isIn(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL'])
    .withMessage('Invalid project type'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('address')
    .isObject()
    .withMessage('Address must be an object'),
  
  body('address.line1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 is required'),
  
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('address.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Invalid pincode'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  
  body('estimatedEndDate')
    .isISO8601()
    .withMessage('Valid estimated end date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('Estimated end date must be after start date');
      }
      return true;
    }),
  
  body('totalBudget')
    .isFloat({ min: 1000, max: 10000000000 })
    .withMessage('Budget must be between ₹1,000 and ₹10,00,00,00,000'),
];

export const updateProjectValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Project name must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('status')
    .optional()
    .isIn(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'])
    .withMessage('Invalid status'),
  
  body('totalBudget')
    .optional()
    .isFloat({ min: 1000, max: 10000000000 })
    .withMessage('Budget must be between ₹1,000 and ₹10,00,00,00,000'),
];

export const addMemberValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  body('userId')
    .isUUID()
    .withMessage('Invalid user ID'),
  
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['PROJECT_MANAGER', 'CONTRACTOR', 'SUPERVISOR', 'VIEWER'])
    .withMessage('Invalid role'),
  
  body('permissions')
    .isObject()
    .withMessage('Permissions must be an object'),
  
  body('permissions.canViewFinancials')
    .isBoolean()
    .withMessage('canViewFinancials must be a boolean'),
  
  body('permissions.canApproveExpenses')
    .isBoolean()
    .withMessage('canApproveExpenses must be a boolean'),
];

export const projectIdValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
];

export const listProjectsValidator: ValidationChain[] = [
  query('status')
    .optional()
    .isIn(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'])
    .withMessage('Invalid status'),
  
  query('type')
    .optional()
    .isIn(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL'])
    .withMessage('Invalid project type'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];