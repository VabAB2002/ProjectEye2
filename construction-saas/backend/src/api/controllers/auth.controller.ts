import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@core/services/auth.service';
import { asyncHandler } from '@api/middlewares/error.middleware';
import { AppError } from '@api/middlewares/error.middleware';
import { prisma } from '@core/database/prisma';

export class AuthController {
  static register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user, tokens } = await AuthService.register(req.body);
      
      // Remove sensitive data
      const userResponse = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization,
      };
      
      res.status(201).json({
        success: true,
        data: {
          user: userResponse,
          tokens,
        },
      });
    }
  );
  
  static login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { user, tokens } = await AuthService.login(req.body);
      
      // Remove sensitive data
      const userResponse = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization,
        lastLogin: user.lastLogin,
      };
      
      res.json({
        success: true,
        data: {
          user: userResponse,
          tokens,
        },
      });
    }
  );
  
  static refreshToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshTokens(refreshToken);
      
      res.json({
        success: true,
        data: { tokens },
      });
    }
  );
  
  static logout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    }
  );
  
  static getProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const user = await AuthService.getProfile(userId);
      
      // Remove sensitive data
      const userResponse = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language,
        organization: user.organization,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      };


      
      
      res.json({
        success: true,
        data: { user: userResponse },
      });
    }
  );

  static inviteUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, phone, password, firstName, lastName, role } = req.body;
      const organizationId = req.user!.organizationId;

      // Get organization
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
      });

      if (!organization) {
        throw new AppError('Organization not found', 404);
      }

      // Register user with existing organization
      const { user, tokens } = await AuthService.registerWithOrganization({
        email,
        phone,
        password,
        firstName,
        lastName,
        role: role || 'CONTRACTOR',
        organizationId
      });

      res.status(201).json({
        success: true,
        data: { user, tokens }
      });
    }
  );
}

