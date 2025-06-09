import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../../core/services/project.service';
import { asyncHandler } from '../middlewares/error.middleware';

export class ProjectController {
  static create = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const project = await ProjectService.create(
        req.body,
        req.user!.organizationId,
        req.user!.userId
      );

      res.status(201).json({
        success: true,
        data: { project },
      });
    }
  );

  static update = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      
      const project = await ProjectService.update(
        projectId,
        req.body,
        req.user!.organizationId
      );

      res.json({
        success: true,
        data: { project },
      });
    }
  );

  static getById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      
      const project = await ProjectService.getById(
        projectId,
        req.user!.organizationId
      );

      res.json({
        success: true,
        data: { project },
      });
    }
  );

  static list = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { status, type, search, page = '1', limit = '10' } = req.query;
      
      const result = await ProjectService.list(
        req.user!.organizationId,
        {
          status: status as any,
          type: type as any,
          search: search as string,
        },
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result,
      });
    }
  );

  static addMember = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      
      const member = await ProjectService.addMember(
        projectId,
        req.body,
        req.user!.organizationId
      );

      res.status(201).json({
        success: true,
        data: { member },
      });
    }
  );

  static removeMember = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, userId } = req.params;
      
      await ProjectService.removeMember(
        projectId,
        userId,
        req.user!.organizationId
      );

      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    }
  );

  static getMembers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      
      const members = await ProjectService.getMembers(
        projectId,
        req.user!.organizationId
      );

      res.json({
        success: true,
        data: { members },
      });
    }
  );

  static getStats = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      
      const stats = await ProjectService.getProjectStats(
        projectId,
        req.user!.organizationId
      );

      res.json({
        success: true,
        data: { stats },
      });
    }
  );
}