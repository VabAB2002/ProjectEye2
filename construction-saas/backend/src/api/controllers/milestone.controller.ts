import { Request, Response, NextFunction } from 'express';
import { MilestoneService } from '../../core/services/milestone.service';
import { asyncHandler } from '../middlewares/error.middleware';

export class MilestoneController {
  static createMilestone = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      
      const milestone = await MilestoneService.createMilestone(
        projectId,
        req.body
      );

      res.status(201).json({
        success: true,
        data: { milestone },
      });
    }
  );

  static updateMilestone = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, milestoneId } = req.params;
      
      const milestone = await MilestoneService.updateMilestone(
        milestoneId,
        projectId,
        req.body
      );

      res.json({
        success: true,
        data: { milestone },
      });
    }
  );

  static getMilestone = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, milestoneId } = req.params;
      
      const milestone = await MilestoneService.getMilestone(
        milestoneId,
        projectId
      );

      res.json({
        success: true,
        data: { milestone },
      });
    }
  );

  static listMilestones = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      const { status, parentId } = req.query;
      
      const milestones = await MilestoneService.listMilestones(
        projectId,
        {
          status: status as string,
          parentId: parentId === 'null' ? null : parentId as string,
        }
      );

      res.json({
        success: true,
        data: { milestones },
      });
    }
  );

  static getMilestoneProgress = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, milestoneId } = req.params;
      
      const progress = await MilestoneService.getMilestoneProgress(
        milestoneId,
        projectId
      );

      res.json({
        success: true,
        data: { progress },
      });
    }
  );

  static deleteMilestone = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, milestoneId } = req.params;
      
      await MilestoneService.deleteMilestone(milestoneId, projectId);

      res.json({
        success: true,
        message: 'Milestone deleted successfully',
      });
    }
  );

  static createFromTemplate = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      const { projectType } = req.body;
      
      const milestones = await MilestoneService.createMilestonesFromTemplate(
        projectId,
        projectType
      );

      res.status(201).json({
        success: true,
        data: { 
          milestones,
          count: milestones.length 
        },
      });
    }
  );

  static linkProgressUpdate = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, milestoneId } = req.params;
      const { progressUpdateId } = req.body;
      
      await MilestoneService.linkProgressUpdate(
        progressUpdateId,
        milestoneId,
        projectId
      );

      res.json({
        success: true,
        message: 'Progress update linked to milestone successfully',
      });
    }
  );
}