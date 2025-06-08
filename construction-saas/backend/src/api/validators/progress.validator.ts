import { body, param, query, ValidationChain } from 'express-validator';

export const createProgressValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  body('date')
    .isISO8601()
    .withMessage('Valid date is required')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (date > today) {
        throw new Error('Cannot create progress update for future dates');
      }
      return true;
    }),
  
  body('workDescription')
    .trim()
    .notEmpty()
    .withMessage('Work description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Work description must be between 10 and 1000 characters'),
  
  body('workersCount')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Workers count must be between 0 and 1000'),
  
  body('weatherConditions')
    .optional()
    .trim()
    .isIn(['sunny', 'cloudy', 'rainy', 'stormy', 'foggy'])
    .withMessage('Invalid weather condition'),
  
  body('issues')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Issues description must not exceed 500 characters'),
  
  body('milestoneId')
    .optional()
    .isUUID()
    .withMessage('Invalid milestone ID'),
];

export const updateProgressValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  param('updateId')
    .isUUID()
    .withMessage('Invalid update ID'),
  
  body('workDescription')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Work description must be between 10 and 1000 characters'),
  
  body('workersCount')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Workers count must be between 0 and 1000'),
  
  body('weatherConditions')
    .optional()
    .trim()
    .isIn(['sunny', 'cloudy', 'rainy', 'stormy', 'foggy'])
    .withMessage('Invalid weather condition'),
  
  body('issues')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Issues description must not exceed 500 characters'),
];

export const listProgressValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date'),
];

export const progressByDateValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  param('date')
    .isISO8601()
    .withMessage('Invalid date format'),
];

export const photoIdValidator: ValidationChain[] = [
  param('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  
  param('updateId')
    .isUUID()
    .withMessage('Invalid update ID'),
  
  param('photoId')
    .isUUID()
    .withMessage('Invalid photo ID'),
];

export const updatePhotoCaptionValidator: ValidationChain[] = [
  ...photoIdValidator,
  
  body('caption')
    .trim()
    .notEmpty()
    .withMessage('Caption is required')
    .isLength({ max: 200 })
    .withMessage('Caption must not exceed 200 characters'),
];