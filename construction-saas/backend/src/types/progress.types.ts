import { ProgressUpdate, ProgressPhoto } from '@prisma/client';

export interface CreateProgressUpdateInput {
  date: Date;
  workDescription: string;
  workersCount?: number;
  weatherConditions?: string;
  issues?: string;
  milestoneId?: string;
}

export interface ProgressUpdateWithPhotos extends ProgressUpdate {
  photos: ProgressPhoto[];
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
  };
  milestone?: {
    id: string;
    name: string;
  } | null;
}

export interface PhotoMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  location?: {
    lat: number;
    lng: number;
  };
  deviceInfo?: {
    model?: string;
    os?: string;
  };
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  location?: string; // S3 URL
  key?: string; // S3 key
  buffer?: Buffer; // For local storage
}