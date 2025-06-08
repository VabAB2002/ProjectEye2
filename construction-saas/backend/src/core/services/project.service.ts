import { prisma } from '../database/prisma';
import { 
  CreateProjectInput, 
  UpdateProjectInput, 
  AddProjectMemberInput,
  ProjectWithDetails,
  ProjectFilters 
} from '../../types/project.types';
import { AppError } from '../../api/middlewares/error.middleware';
import { logger } from '../utils/logger';
import { Prisma } from '@prisma/client';

export class ProjectService {
  static async create(
    input: CreateProjectInput, 
    organizationId: string, 
    userId: string
  ): Promise<ProjectWithDetails> {
    try {
      const project = await prisma.$transaction(async (tx) => {
        // Create project
        const newProject = await tx.project.create({
          data: {
            ...input,
            organizationId,
            startDate: new Date(input.startDate),
            estimatedEndDate: new Date(input.estimatedEndDate),
          },
        });

        // Add creator as project owner
        await tx.projectMember.create({
          data: {
            projectId: newProject.id,
            userId,
            role: 'OWNER',
            permissions: {
              canViewFinancials: true,
              canApproveExpenses: true,
              canEditProject: true,
              canAddMembers: true,
              canUploadDocuments: true,
              canCreateMilestones: true,
            },
          },
        });

        return newProject;
      });

      // Fetch complete project details
      const projectWithDetails = await this.getById(project.id, organizationId);
      
      logger.info(`Project created: ${project.id} by user ${userId}`);
      
      return projectWithDetails;
    } catch (error) {
      logger.error('Error creating project:', error);
      throw new AppError('Failed to create project', 500);
    }
  }

  static async update(
    projectId: string,
    input: UpdateProjectInput,
    organizationId: string
  ): Promise<ProjectWithDetails> {
    // Check if project exists and belongs to organization
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!existingProject) {
      throw new AppError('Project not found', 404);
    }

    // Update project
    await prisma.project.update({
      where: { id: projectId },
      data: {
        ...input,
        estimatedEndDate: input.estimatedEndDate 
          ? new Date(input.estimatedEndDate) 
          : undefined,
      },
    });

    return this.getById(projectId, organizationId);
  }

  static async getById(
    projectId: string,
    organizationId: string
  ): Promise<ProjectWithDetails> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                profilePicture: true,
              },
            },
          },
        },
        milestones: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            progressUpdates: true,
            transactions: true,
            documents: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return project as ProjectWithDetails;
  }

  static async list(
    organizationId: string,
    filters: ProjectFilters,
    page = 1,
    limit = 10
  ) {
    const where: Prisma.ProjectWhereInput = {
      organizationId,
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          _count: {
            select: {
              members: true,
              progressUpdates: true,
              transactions: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.project.count({ where }),
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async addMember(
    projectId: string,
    input: AddProjectMemberInput,
    organizationId: string
  ) {
    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user belongs to the organization
    const user = await prisma.user.findFirst({
      where: {
        id: input.userId,
        organizationId,
      },
    });

    if (!user) {
      throw new AppError('User not found in organization', 404);
    }

    // Check if member already exists
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: input.userId,
        },
      },
    });

    if (existingMember) {
      throw new AppError('User is already a member of this project', 400);
    }

    // Add member
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: input.userId,
        role: input.role,
        permissions: input.permissions,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    logger.info(`Member ${input.userId} added to project ${projectId}`);

    return member;
  }

  static async removeMember(
    projectId: string,
    userId: string,
    organizationId: string
  ) {
    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if member exists
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      throw new AppError('Member not found in project', 404);
    }

    // Don't allow removing the owner
    if (member.role === 'OWNER') {
      throw new AppError('Cannot remove project owner', 400);
    }

    // Remove member
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    logger.info(`Member ${userId} removed from project ${projectId}`);
  }

  static async getProjectStats(projectId: string, organizationId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      include: {
        _count: {
          select: {
            members: true,
            milestones: true,
            progressUpdates: true,
            transactions: true,
            materials: true,
            documents: true,
          },
        },
        transactions: {
          where: {
            approvalStatus: 'APPROVED',
          },
          select: {
            amount: true,
            type: true,
          },
        },
        milestones: {
          select: {
            status: true,
            progressPercentage: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Calculate financial stats
    const totalExpenses = project.transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPayments = project.transactions
      .filter(t => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Calculate progress stats
    const completedMilestones = project.milestones.filter(
      m => m.status === 'COMPLETED'
    ).length;

    const averageProgress = project.milestones.length > 0
      ? project.milestones.reduce((sum, m) => sum + m.progressPercentage, 0) / 
        project.milestones.length
      : 0;

    // Calculate time stats
    const today = new Date();
    const startDate = new Date(project.startDate);
    const estimatedEndDate = new Date(project.estimatedEndDate);
    const totalDays = Math.ceil(
      (estimatedEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.ceil(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const timeProgress = (elapsedDays / totalDays) * 100;

    return {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        totalBudget: Number(project.totalBudget),
      },
      counts: project._count,
      financial: {
        totalBudget: Number(project.totalBudget),
        totalExpenses,
        totalPayments,
        remainingBudget: Number(project.totalBudget) - totalExpenses,
        budgetUtilization: (totalExpenses / Number(project.totalBudget)) * 100,
      },
      progress: {
        totalMilestones: project.milestones.length,
        completedMilestones,
        averageProgress,
        timeProgress,
        daysElapsed: elapsedDays,
        totalDays,
      },
    };
  }
}