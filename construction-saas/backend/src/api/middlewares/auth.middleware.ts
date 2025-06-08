import { Request, Response, NextFunction } from 'express';
import { JWTService } from '@core/services/jwt.service';
import { AppError } from './error.middleware';
import { TokenPayload } from '../../types/auth.types';  // Fixed import path

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }
    
    const token = authHeader.split(' ')[1];
    const payload = JWTService.verifyAccessToken(token);
    
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden - Insufficient permissions', 403));
    }
    
    next();
  };
};