import { body, param, query, ValidationChain } from 'express-validator';

export const createMilestoneValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Milestone name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('plannedStart')
    .isISO8601()
    .withMessage('Valid planned start date is required'),
  
  body('plannedEnd')
    .isISO8601()
    .withMessage('Valid planned end date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.plannedStart)) {
        throw new Error('Planned end date must be after start date');
      }
      return true;
    }),
  
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Invalid parent milestone ID'),
  
  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
];

export const updateMilestoneValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  param('milestoneId')
    .isUUID()
    .withMessage('Invalid milestone ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('plannedStart')
    .optional()
    .isISO8601()
    .withMessage('Invalid planned start date'),
  
  body('plannedEnd')
    .optional()
    .isISO8601()
    .withMessage('Invalid planned end date'),
  
  body('actualStart')
    .optional()
    .isISO8601()
    .withMessage('Invalid actual start date'),
  
  body('actualEnd')
    .optional()
    .isISO8601()
    .withMessage('Invalid actual end date'),
  
  body('progressPercentage')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED'])
    .withMessage('Invalid status'),
];

export const listMilestonesValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  query('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED'])
    .withMessage('Invalid status'),
  
  query('parentId')
    .optional()
    .isUUID()
    .withMessage('Invalid parent ID'),
];

export const milestoneIdValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  param('milestoneId')
    .isUUID()
    .withMessage('Invalid milestone ID'),
];

export const createFromTemplateValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  body('projectType')
    .isIn(['RESIDENTIAL', 'COMMERCIAL'])
    .withMessage('Project type must be RESIDENTIAL or COMMERCIAL'),
];

export const linkProgressValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  param('milestoneId')
    .isUUID()
    .withMessage('Invalid milestone ID'),
  
  body('progressUpdateId')
    .isUUID()
    .withMessage('Invalid progress update ID'),
];