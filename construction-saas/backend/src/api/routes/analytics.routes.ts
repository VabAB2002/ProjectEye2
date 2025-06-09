import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkProjectAccess } from '../middlewares/project.middleware';

export const analyticsRouter = Router();

// Project analytics routes
analyticsRouter.get(
  '/projects/:projectId/dashboard',
  authenticate,
  checkProjectAccess,
  AnalyticsController.getDashboardData
);

analyticsRouter.get(
  '/projects/:projectId/progress-trends',
  authenticate,
  checkProjectAccess,
  AnalyticsController.getProgressTrends
);

analyticsRouter.get(
  '/projects/:projectId/budget-burn-rate',
  authenticate,
  checkProjectAccess,
  AnalyticsController.getBudgetBurnRate
);

analyticsRouter.get(
  '/projects/:projectId/milestone-timeline',
  authenticate,
  checkProjectAccess,
  AnalyticsController.getMilestoneTimeline
);

// Organization analytics
analyticsRouter.get(
  '/organization',
  authenticate,
  AnalyticsController.getOrganizationAnalytics
);