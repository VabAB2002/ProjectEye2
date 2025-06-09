import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../../core/services/analytics.service';
import { asyncHandler } from '../middlewares/error.middleware';

export class AnalyticsController {
  static getDashboardData = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      
      const dashboardData = await AnalyticsService.getDashboardData(
        projectId,
        req.user!.organizationId
      );

      res.json({
        success: true,
        data: dashboardData,
      });
    }
  );

  static getProgressTrends = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      const { days = '30' } = req.query;
      
      const trends = await AnalyticsService.getProgressTrends(
        projectId,
        parseInt(days as string)
      );

      res.json({
        success: true,
        data: { trends },
      });
    }
  );

  static getBudgetBurnRate = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      
      const burnRate = await AnalyticsService.getBudgetBurnRate(projectId);

      res.json({
        success: true,
        data: burnRate,
      });
    }
  );

  static getMilestoneTimeline = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      
      const timeline = await AnalyticsService.getMilestoneTimeline(projectId);

      res.json({
        success: true,
        data: { timeline },
      });
    }
  );

  static getOrganizationAnalytics = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const analytics = await AnalyticsService.getOrganizationAnalytics(
        req.user!.organizationId
      );

      res.json({
        success: true,
        data: analytics,
      });
    }
  );
}