import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../config';
import { TokenPayload } from '../../types/auth.types';
import { AppError } from '../../api/middlewares/error.middleware';

export class JWTService {
  static generateTokens(payload: TokenPayload) {
    const signOptions: SignOptions = {
      expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, signOptions);

    const refreshSignOptions: SignOptions = {
      expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
    };

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, refreshSignOptions);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
    };
  }

  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      throw new AppError('Invalid access token', 401);
    }
  }

  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }
}