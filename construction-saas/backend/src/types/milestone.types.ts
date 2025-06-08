import { Milestone } from '@prisma/client';

export interface CreateMilestoneInput {
  name: string;
  description?: string;
  plannedStart: Date;
  plannedEnd: Date;
  parentId?: string;
  order: number;
}

export interface UpdateMilestoneInput {
  name?: string;
  description?: string;
  plannedStart?: Date;
  plannedEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  progressPercentage?: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
}

export interface MilestoneWithDetails extends Milestone {
  subMilestones?: Milestone[];
  progressUpdates?: {
    id: string;
    date: Date;
    workDescription: string;
  }[];
  _count?: {
    progressUpdates: number;
    subMilestones: number;
  };
}

export interface MilestoneFilters {
  status?: string;
  parentId?: string | null;
  startDate?: Date;
  endDate?: Date;
}

export interface MilestoneProgress {
  milestone: MilestoneWithDetails;
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;
  isDelayed: boolean;
  delayDays: number;
  progressPercentage: number;
  timeProgressPercentage: number;
}

// Common milestone templates for construction
export const MILESTONE_TEMPLATES = {
  RESIDENTIAL: [
    { name: 'Site Preparation', duration: 7, order: 1 },
    { name: 'Foundation', duration: 21, order: 2 },
    { name: 'Structure', duration: 45, order: 3 },
    { name: 'Roofing', duration: 14, order: 4 },
    { name: 'External Walls', duration: 21, order: 5 },
    { name: 'MEP First Fix', duration: 21, order: 6 },
    { name: 'Internal Walls & Plastering', duration: 30, order: 7 },
    { name: 'Flooring', duration: 21, order: 8 },
    { name: 'MEP Second Fix', duration: 14, order: 9 },
    { name: 'Painting', duration: 21, order: 10 },
    { name: 'Final Finishing', duration: 14, order: 11 },
    { name: 'Handover', duration: 7, order: 12 },
  ],
  COMMERCIAL: [
    { name: 'Site Preparation', duration: 14, order: 1 },
    { name: 'Foundation & Basement', duration: 45, order: 2 },
    { name: 'Structural Frame', duration: 90, order: 3 },
    { name: 'External Envelope', duration: 60, order: 4 },
    { name: 'MEP Installation', duration: 90, order: 5 },
    { name: 'Interior Fit-out', duration: 60, order: 6 },
    { name: 'Testing & Commissioning', duration: 30, order: 7 },
    { name: 'External Works', duration: 30, order: 8 },
    { name: 'Final Inspection & Handover', duration: 14, order: 9 },
  ],
};