import { Router } from 'express';
import { AuthController } from '@api/controllers/auth.controller';
import { authenticate, authorize } from '@api/middlewares/auth.middleware';
import { validate } from '@api/middlewares/validation.middleware';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
} from '@api/validators/auth.validator';

const router = Router();

// Public routes
router.post('/register', registerValidator, validate, AuthController.register);
router.post('/login', loginValidator, validate, AuthController.login);
router.post('/refresh', refreshTokenValidator, validate, AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/invite', authenticate, authorize('OWNER'), AuthController.inviteUser);


// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);

export const authRouter = router;