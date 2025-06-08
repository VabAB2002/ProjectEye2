import { User } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterInput {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName?: string;
  organizationName: string;
  organizationType: 'INDIVIDUAL' | 'COMPANY';
}

export interface LoginInput {
  emailOrPhone: string;
  password: string;
}

export interface UserWithOrganization extends User {
  organization: {
    id: string;
    name: string;
    type: string;
  };
}