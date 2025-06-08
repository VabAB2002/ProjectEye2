// Base API Response
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
      message: string;
      details?: any;
    };
    meta?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    };
  }
  
  // Auth Types
  export interface LoginInput {
    emailOrPhone: string;
    password: string;
  }
  
  export interface User {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: 'OWNER' | 'PROJECT_MANAGER' | 'CONTRACTOR' | 'SUPERVISOR' | 'VIEWER';
    language: string;
    organization: {
      id: string;
      name: string;
      type: string;
    };
    profilePicture?: string;
  }
  
  export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }
  
  export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
  }
  
  // Project Types
  export interface Project {
    id: string;
    name: string;
    type: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
    description?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      landmark?: string;
    };
    startDate: string;
    estimatedEndDate: string;
    actualEndDate?: string;
    totalBudget: string;
    status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ProjectStats {
    project: {
      id: string;
      name: string;
      status: string;
      totalBudget: number;
    };
    counts: {
      members: number;
      milestones: number;
      progressUpdates: number;
      transactions: number;
      materials: number;
      documents: number;
    };
    financial: {
      totalBudget: number;
      totalExpenses: number;
      totalPayments: number;
      remainingBudget: number;
      budgetUtilization: number;
    };
    progress: {
      totalMilestones: number;
      completedMilestones: number;
      averageProgress: number;
      timeProgress: number;
      daysElapsed: number;
      totalDays: number;
    };
  }