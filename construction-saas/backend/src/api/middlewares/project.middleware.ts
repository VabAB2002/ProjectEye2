import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';
import { AppError } from './error.middleware';

export const checkProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.userId;

    // Check if user is a member of the project
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      throw new AppError('You do not have access to this project', 403);
    }

    // Attach member info to request for permission checking
    (req as any).projectMember = member;
    
    next();
  } catch (error) {
    next(error);
  }
};

export const checkProjectPermission = (permission: keyof any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const member = (req as any).projectMember;
    
    if (!member) {
      return next(new AppError('Project member info not found', 500));
    }

    if (!member.permissions[permission]) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};