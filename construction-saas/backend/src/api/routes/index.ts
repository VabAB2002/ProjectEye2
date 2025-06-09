import { Router } from 'express';
import { authRouter } from './auth.routes';
import { projectRouter } from './project.routes';
import { analyticsRouter } from './analytics.routes';

export const apiRouter = Router();

// Health check for API
apiRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Construction SaaS API',
    version: 'v1',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
apiRouter.use('/auth', authRouter);

// Project routes
apiRouter.use('/projects', projectRouter);

// Analytics routes
apiRouter.use('/analytics', analyticsRouter);