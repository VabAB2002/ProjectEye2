import { prisma } from '../database/prisma';
import {
  CreateMilestoneInput,
  UpdateMilestoneInput,
  MilestoneWithDetails,
  MilestoneFilters,
  MilestoneProgress,
  MILESTONE_TEMPLATES
} from '../../types/milestone.types';
import { AppError } from '../../api/middlewares/error.middleware';
import { logger } from '../utils/logger';
import { Prisma } from '@prisma/client';

export class MilestoneService {
  static async createMilestone(
    projectId: string,
    input: CreateMilestoneInput
  ): Promise<MilestoneWithDetails> {
    // Validate parent milestone if provided
    if (input.parentId) {
      const parent = await prisma.milestone.findFirst({
        where: {
          id: input.parentId,
          projectId,
        },
      });

      if (!parent) {
        throw new AppError('Parent milestone not found', 404);
      }
    }

    // Check for order conflicts
    const existingMilestone = await prisma.milestone.findFirst({
      where: {
        projectId,
        order: input.order,
        parentId: input.parentId || null,
      },
    });

    if (existingMilestone) {
      // Shift other milestones
      await prisma.milestone.updateMany({
        where: {
          projectId,
          order: { gte: input.order },
          parentId: input.parentId || null,
        },
        data: {
          order: { increment: 1 },
        },
      });
    }

    const milestone = await prisma.milestone.create({
      data: {
        projectId,
        name: input.name,
        description: input.description,
        plannedStart: new Date(input.plannedStart),
        plannedEnd: new Date(input.plannedEnd),
        parentId: input.parentId,
        order: input.order,
        status: 'PENDING',
      },
      include: {
        _count: {
          select: {
            progressUpdates: true,
          },
        },
      },
    });

    logger.info(`Milestone created: ${milestone.id} for project ${projectId}`);

    return milestone as MilestoneWithDetails;
  }

  static async updateMilestone(
    milestoneId: string,
    projectId: string,
    input: UpdateMilestoneInput
  ): Promise<MilestoneWithDetails> {
    const existingMilestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        projectId,
      },
    });

    if (!existingMilestone) {
      throw new AppError('Milestone not found', 404);
    }

    // Auto-update status based on dates and progress
    let status = input.status || existingMilestone.status;
    
    if (input.actualEnd) {
      status = 'COMPLETED';
    } else if (input.actualStart) {
      status = 'IN_PROGRESS';
    } else if (input.progressPercentage === 100) {
      status = 'COMPLETED';
    } else if (input.progressPercentage && input.progressPercentage > 0) {
      status = 'IN_PROGRESS';
    }

    // Check if delayed
    const today = new Date();
    if (status !== 'COMPLETED' && new Date(existingMilestone.plannedEnd) < today) {
      status = 'DELAYED';
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...input,
        plannedStart: input.plannedStart ? new Date(input.plannedStart) : undefined,
        plannedEnd: input.plannedEnd ? new Date(input.plannedEnd) : undefined,
        actualStart: input.actualStart ? new Date(input.actualStart) : undefined,
        actualEnd: input.actualEnd ? new Date(input.actualEnd) : undefined,
        status,
      },
      include: {
        progressUpdates: {
          select: {
            id: true,
            date: true,
            workDescription: true,
          },
          orderBy: { date: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            progressUpdates: true,
          },
        },
      },
    });

    // If milestone completed, check if we need to update parent
    if (status === 'COMPLETED' && existingMilestone.parentId) {
      await this.updateParentProgress(existingMilestone.parentId);
    }

    return updated as MilestoneWithDetails;
  }

  static async getMilestone(
    milestoneId: string,
    projectId: string
  ): Promise<MilestoneWithDetails> {
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        projectId,
      },
      include: {
        progressUpdates: {
          select: {
            id: true,
            date: true,
            workDescription: true,
          },
          orderBy: { date: 'desc' },
        },
        _count: {
          select: {
            progressUpdates: true,
          },
        },
      },
    });

    if (!milestone) {
      throw new AppError('Milestone not found', 404);
    }

    // Get sub-milestones if this is a parent
    const subMilestones = await prisma.milestone.findMany({
      where: {
        parentId: milestoneId,
      },
      orderBy: { order: 'asc' },
    });

    return {
      ...milestone,
      subMilestones,
    } as MilestoneWithDetails;
  }

  static async listMilestones(
    projectId: string,
    filters: MilestoneFilters
  ) {
    const where: Prisma.MilestoneWhereInput = {
      projectId,
      ...(filters.status && { status: filters.status }),
      ...(filters.parentId !== undefined && { parentId: filters.parentId }),
    };

    if (filters.startDate || filters.endDate) {
      where.plannedStart = {};
      if (filters.startDate) where.plannedStart.gte = new Date(filters.startDate);
      if (filters.endDate) where.plannedStart.lte = new Date(filters.endDate);
    }

    const milestones = await prisma.milestone.findMany({
      where,
      include: {
        _count: {
          select: {
            progressUpdates: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Get sub-milestones count for parent milestones
    const milestonesWithSubCount = await Promise.all(
      milestones.map(async (milestone) => {
        const subMilestoneCount = await prisma.milestone.count({
          where: { parentId: milestone.id },
        });

        return {
          ...milestone,
          _count: {
            ...milestone._count,
            subMilestones: subMilestoneCount,
          },
        };
      })
    );

    return milestonesWithSubCount;
  }

  static async getMilestoneProgress(
    milestoneId: string,
    projectId: string
  ): Promise<MilestoneProgress> {
    const milestone = await this.getMilestone(milestoneId, projectId);

    const today = new Date();
    const plannedStart = new Date(milestone.plannedStart);
    const plannedEnd = new Date(milestone.plannedEnd);
    
    const totalDays = Math.ceil(
      (plannedEnd.getTime() - plannedStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let elapsedDays = 0;
    let remainingDays = totalDays;
    
    if (today >= plannedStart) {
      elapsedDays = Math.ceil(
        (today.getTime() - plannedStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      remainingDays = Math.max(0, totalDays - elapsedDays);
    }

    const timeProgressPercentage = (elapsedDays / totalDays) * 100;
    const isDelayed = today > plannedEnd && milestone.status !== 'COMPLETED';
    const delayDays = isDelayed
      ? Math.ceil((today.getTime() - plannedEnd.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      milestone,
      totalDays,
      elapsedDays,
      remainingDays,
      isDelayed,
      delayDays,
      progressPercentage: milestone.progressPercentage,
      timeProgressPercentage: Math.min(100, timeProgressPercentage),
    };
  }

  static async deleteMilestone(milestoneId: string, projectId: string): Promise<void> {
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        projectId,
      },
    });

    if (!milestone) {
      throw new AppError('Milestone not found', 404);
    }

    // Check if milestone has progress updates
    const hasUpdates = await prisma.progressUpdate.count({
      where: { milestoneId },
    });

    if (hasUpdates > 0) {
      throw new AppError('Cannot delete milestone with progress updates', 400);
    }

    // Delete sub-milestones first
    await prisma.milestone.deleteMany({
      where: { parentId: milestoneId },
    });

    // Delete the milestone
    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    // Reorder remaining milestones
    await prisma.milestone.updateMany({
      where: {
        projectId,
        order: { gt: milestone.order },
        parentId: milestone.parentId,
      },
      data: {
        order: { decrement: 1 },
      },
    });

    logger.info(`Milestone ${milestoneId} deleted`);
  }

  static async createMilestonesFromTemplate(
    projectId: string,
    projectType: 'RESIDENTIAL' | 'COMMERCIAL'
  ): Promise<MilestoneWithDetails[]> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { startDate: true },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const templates = MILESTONE_TEMPLATES[projectType];
    let currentDate = new Date(project.startDate);
    
    const milestones = [];

    for (const template of templates) {
      const plannedStart = new Date(currentDate);
      const plannedEnd = new Date(currentDate);
      plannedEnd.setDate(plannedEnd.getDate() + template.duration);

      const milestone = await this.createMilestone(projectId, {
        name: template.name,
        plannedStart,
        plannedEnd,
        order: template.order,
      });

      milestones.push(milestone);
      currentDate = new Date(plannedEnd);
      currentDate.setDate(currentDate.getDate() + 1); // 1 day gap between milestones
    }

    logger.info(`Created ${milestones.length} milestones from ${projectType} template`);

    return milestones;
  }

  private static async updateParentProgress(parentId: string): Promise<void> {
    const subMilestones = await prisma.milestone.findMany({
      where: { parentId },
    });

    if (subMilestones.length === 0) return;

    const totalProgress = subMilestones.reduce(
      (sum, milestone) => sum + milestone.progressPercentage,
      0
    );
    const averageProgress = Math.round(totalProgress / subMilestones.length);

    const allCompleted = subMilestones.every((m) => m.status === 'COMPLETED');
    const anyInProgress = subMilestones.some((m) => m.status === 'IN_PROGRESS');

    await prisma.milestone.update({
      where: { id: parentId },
      data: {
        progressPercentage: averageProgress,
        status: allCompleted ? 'COMPLETED' : anyInProgress ? 'IN_PROGRESS' : 'PENDING',
      },
    });
  }

  static async linkProgressUpdate(
    progressUpdateId: string,
    milestoneId: string,
    projectId: string
  ): Promise<void> {
    // Verify both exist and belong to the same project
    const [progressUpdate, milestone] = await Promise.all([
      prisma.progressUpdate.findFirst({
        where: { id: progressUpdateId, projectId },
      }),
      prisma.milestone.findFirst({
        where: { id: milestoneId, projectId },
      }),
    ]);

    if (!progressUpdate || !milestone) {
      throw new AppError('Progress update or milestone not found', 404);
    }

    await prisma.progressUpdate.update({
      where: { id: progressUpdateId },
      data: { milestoneId },
    });

    // Update milestone status if needed
    if (milestone.status === 'PENDING') {
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: { 
          status: 'IN_PROGRESS',
          actualStart: progressUpdate.date,
        },
      });
    }
  }
}