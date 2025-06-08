import { prisma } from '../database/prisma';
import { RegisterInput, LoginInput, AuthTokens, UserWithOrganization } from '../../types/auth.types';
import { AppError } from '../../api/middlewares/error.middleware';
import { PasswordService } from './password.service';
import { JWTService } from './jwt.service';
import { logger } from '../utils/logger';

export class AuthService {
  static async register(input: RegisterInput): Promise<{ user: UserWithOrganization; tokens: AuthTokens }> {
    const { email, phone, password, firstName, lastName, organizationName, organizationType } = input;

    // Validate password
    const passwordValidation = PasswordService.validate(password);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.errors.join(', '), 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      throw new AppError('User with this email or phone already exists', 400);
    }

    // Hash password
    const passwordHash = await PasswordService.hash(password);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          type: organizationType,
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          phone,
          passwordHash,
          firstName,
          lastName,
          role: 'OWNER',
          organizationId: organization.id,
        },
        include: {
          organization: true,
        },
      });

      return user;
    });

    // Generate tokens
    const tokens = JWTService.generateTokens({
      userId: result.id,
      email: result.email,
      organizationId: result.organizationId,
      role: result.role,
    });

    // Create session
    await prisma.session.create({
      data: {
        userId: result.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    logger.info(`New user registered: ${result.email}`);

    return { user: result, tokens };
  }

  static async login(input: LoginInput): Promise<{ user: UserWithOrganization; tokens: AuthTokens }> {
    const { emailOrPhone, password } = input;

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        isActive: true,
      },
      include: {
        organization: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await PasswordService.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = JWTService.generateTokens({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    });

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    logger.info(`User logged in: ${user.email}`);

    return { user, tokens };
  }

  static async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    const payload = JWTService.verifyRefreshToken(refreshToken);

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Generate new tokens
    const tokens = JWTService.generateTokens({
      userId: session.user.id,
      email: session.user.email,
      organizationId: session.user.organizationId,
      role: session.user.role,
    });

    // Update session with new refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  static async logout(refreshToken: string): Promise<void> {
    await prisma.session.delete({
      where: { refreshToken },
    }).catch(() => {
      // Ignore error if session doesn't exist
    });
  }

  static async getProfile(userId: string): Promise<UserWithOrganization> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async registerWithOrganization(input: any): Promise<{ user: UserWithOrganization; tokens: AuthTokens }> {
    const { email, phone, password, firstName, lastName, role, organizationId } = input;

    // Validate password
    const passwordValidation = PasswordService.validate(password);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.errors.join(', '), 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      throw new AppError('User with this email or phone already exists', 400);
    }

    // Hash password
    const passwordHash = await PasswordService.hash(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        firstName,
        lastName,
        role,
        organizationId,
      },
      include: {
        organization: true,
      },
    });

    // Generate tokens
    const tokens = JWTService.generateTokens({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    });

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info(`New user registered: ${user.email}`);

    return { user, tokens };
  }
}