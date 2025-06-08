import { Request, Response, NextFunction } from 'express';
import { ProgressService } from '../../core/services/progress.service';
import { asyncHandler } from '../middlewares/error.middleware';

export class ProgressController {
  static create = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      const files = req.files as Express.Multer.File[];
      
      const progressUpdate = await ProgressService.create(
        projectId,
        req.body,
        req.user!.userId,
        files
      );

      res.status(201).json({
        success: true,
        data: { progressUpdate },
      });
    }
  );

  static update = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, updateId } = req.params;
      
      const progressUpdate = await ProgressService.update(
        updateId,
        projectId,
        req.body
      );

      res.json({
        success: true,
        data: { progressUpdate },
      });
    }
  );

  static getById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { updateId } = req.params;
      
      const progressUpdate = await ProgressService.getById(updateId);

      res.json({
        success: true,
        data: { progressUpdate },
      });
    }
  );

  static list = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      const { page = '1', limit = '10', startDate, endDate } = req.query;
      
      const result = await ProgressService.list(
        projectId,
        parseInt(page as string),
        parseInt(limit as string),
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: result,
      });
    }
  );

  static getByDate = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, date } = req.params;
      
      const progressUpdate = await ProgressService.getByDate(
        projectId,
        new Date(date)
      );

      if (!progressUpdate) {
        return res.json({
          success: true,
          data: { progressUpdate: null },
        });
      }

      return res.json({
        success: true,
        data: { progressUpdate },
      });
    }
  );

  static addPhotos = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { updateId } = req.params;
      const files = req.files as Express.Multer.File[];
      
      await ProgressService.addPhotos(updateId, files);

      res.json({
        success: true,
        message: 'Photos added successfully',
      });
    }
  );

  static deletePhoto = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { updateId, photoId } = req.params;
      
      await ProgressService.deletePhoto(photoId, updateId);

      res.json({
        success: true,
        message: 'Photo deleted successfully',
      });
    }
  );

  static updatePhotoCaption = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { updateId, photoId } = req.params;
      const { caption } = req.body;
      
      await ProgressService.updatePhotoCaption(photoId, updateId, caption);

      res.json({
        success: true,
        message: 'Photo caption updated successfully',
      });
    }
  );
}