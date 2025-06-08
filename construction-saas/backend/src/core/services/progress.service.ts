import { prisma } from '../database/prisma';
import { CreateProgressUpdateInput, ProgressUpdateWithPhotos, PhotoMetadata } from '../../types/progress.types';
import { AppError } from '../../api/middlewares/error.middleware';
import { StorageService } from './storage.service';
import { logger } from '../utils/logger';

export class ProgressService {
  static async create(
    projectId: string,
    input: CreateProgressUpdateInput,
    reporterId: string,
    photos?: Express.Multer.File[]
  ): Promise<ProgressUpdateWithPhotos> {
    // Check if update already exists for this date
    const existingUpdate = await prisma.progressUpdate.findUnique({
      where: {
        projectId_date: {
          projectId,
          date: new Date(input.date),
        },
      },
    });

    if (existingUpdate) {
      throw new AppError('Progress update already exists for this date', 400);
    }

    // Validate milestone if provided
    if (input.milestoneId) {
      const milestone = await prisma.milestone.findFirst({
        where: {
          id: input.milestoneId,
          projectId,
        },
      });

      if (!milestone) {
        throw new AppError('Milestone not found', 404);
      }
    }

    // Create progress update
    const progressUpdate = await prisma.$transaction(async (tx) => {
      const update = await tx.progressUpdate.create({
        data: {
          projectId,
          reportedBy: reporterId,
          date: new Date(input.date),
          workDescription: input.workDescription,
          workersCount: input.workersCount ? parseInt(input.workersCount.toString()) : null,
          weatherConditions: input.weatherConditions,
          issues: input.issues,
          milestoneId: input.milestoneId,
        },
      });

      // Upload and save photos if provided
      if (photos && photos.length > 0) {
        const photoPromises = photos.map(async (photo, index) => {
          const { url, thumbnailUrl, key } = await StorageService.uploadImage(
            photo,
            `projects/${projectId}/progress/${update.id}`
          );

          const metadata: PhotoMetadata = {
            originalName: photo.originalname,
            mimeType: photo.mimetype,
            size: photo.size,
          };

          return tx.progressPhoto.create({
            data: {
              progressUpdateId: update.id,
              fileUrl: url,
              thumbnailUrl,
              caption: `Photo ${index + 1}`,
              metadata: metadata as any,
            },
          });
        });

        await Promise.all(photoPromises);
      }

      return update;
    });

    // Fetch complete update with relations
    return this.getById(progressUpdate.id);
  }

  static async update(
    progressUpdateId: string,
    projectId: string,
    input: Partial<CreateProgressUpdateInput>
  ): Promise<ProgressUpdateWithPhotos> {
    const existingUpdate = await prisma.progressUpdate.findFirst({
      where: {
        id: progressUpdateId,
        projectId,
      },
    });

    if (!existingUpdate) {
      throw new AppError('Progress update not found', 404);
    }

    await prisma.progressUpdate.update({
      where: { id: progressUpdateId },
      data: {
        workDescription: input.workDescription,
        workersCount: input.workersCount,
        weatherConditions: input.weatherConditions,
        issues: input.issues,
      },
    });

    return this.getById(progressUpdateId);
  }

  static async getById(progressUpdateId: string): Promise<ProgressUpdateWithPhotos> {
    const update = await prisma.progressUpdate.findUnique({
      where: { id: progressUpdateId },
      include: {
        photos: {
          orderBy: { uploadedAt: 'asc' },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!update) {
      throw new AppError('Progress update not found', 404);
    }

    return update as ProgressUpdateWithPhotos;
  }

  static async list(
    projectId: string,
    page = 1,
    limit = 10,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = { projectId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [updates, total] = await Promise.all([
      prisma.progressUpdate.findMany({
        where,
        include: {
          photos: {
            select: {
              id: true,
              thumbnailUrl: true,
            },
          },
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          milestone: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              photos: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.progressUpdate.count({ where }),
    ]);

    return {
      updates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getByDate(projectId: string, date: Date): Promise<ProgressUpdateWithPhotos | null> {
    const update = await prisma.progressUpdate.findUnique({
      where: {
        projectId_date: {
          projectId,
          date: new Date(date),
        },
      },
      include: {
        photos: {
          orderBy: { uploadedAt: 'asc' },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return update as ProgressUpdateWithPhotos | null;
  }

  static async addPhotos(
    progressUpdateId: string,
    photos: Express.Multer.File[]
  ): Promise<void> {
    const update = await prisma.progressUpdate.findUnique({
      where: { id: progressUpdateId },
    });

    if (!update) {
      throw new AppError('Progress update not found', 404);
    }

    const photoPromises = photos.map(async (photo, index) => {
      const { url, thumbnailUrl } = await StorageService.uploadImage(
        photo,
        `projects/${update.projectId}/progress/${update.id}`
      );

      const metadata: PhotoMetadata = {
        originalName: photo.originalname,
        mimeType: photo.mimetype,
        size: photo.size,
      };

      return prisma.progressPhoto.create({
        data: {
          progressUpdateId: update.id,
          fileUrl: url,
          thumbnailUrl,
          caption: `Additional photo ${index + 1}`,
          metadata: metadata as any,
        },
      });
    });

    await Promise.all(photoPromises);
  }

  static async deletePhoto(photoId: string, progressUpdateId: string): Promise<void> {
    const photo = await prisma.progressPhoto.findFirst({
      where: {
        id: photoId,
        progressUpdateId,
      },
    });

    if (!photo) {
      throw new AppError('Photo not found', 404);
    }

    // Delete from storage
    const key = photo.fileUrl.split('/').slice(-3).join('/');
    await StorageService.deleteFile(key);

    // Delete thumbnail
    if (photo.thumbnailUrl) {
      const thumbKey = photo.thumbnailUrl.split('/').slice(-4).join('/');
      await StorageService.deleteFile(thumbKey);
    }

    // Delete from database
    await prisma.progressPhoto.delete({
      where: { id: photoId },
    });
  }

  static async updatePhotoCaption(
    photoId: string,
    progressUpdateId: string,
    caption: string
  ): Promise<void> {
    const photo = await prisma.progressPhoto.findFirst({
      where: {
        id: photoId,
        progressUpdateId,
      },
    });

    if (!photo) {
      throw new AppError('Photo not found', 404);
    }

    await prisma.progressPhoto.update({
      where: { id: photoId },
      data: { caption },
    });
  }
}