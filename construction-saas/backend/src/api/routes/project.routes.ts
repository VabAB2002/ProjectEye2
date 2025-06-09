import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { checkProjectAccess, checkProjectPermission } from '../middlewares/project.middleware';
import { validate } from '../middlewares/validation.middleware';
import { progressRouter } from './progress.routes';
import { financialRouter } from './financial.routes';
import { milestoneRouter } from './milestone.routes';



import {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
  projectIdValidator,
  listProjectsValidator,
} from '../validators/project.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List projects
router.get('/', listProjectsValidator, validate, ProjectController.list);

// Create project (only OWNER role)
router.post(
  '/',
  authorize('OWNER'),
  createProjectValidator,
  validate,
  ProjectController.create
);

// Routes that require project access
router.get(
  '/:projectId',
  projectIdValidator,
  validate,
  checkProjectAccess,
  ProjectController.getById
);

// Update project - requires project access and edit permission
router.patch(
  '/:projectId',
  updateProjectValidator,
  validate,
  checkProjectAccess,
  checkProjectPermission('canEditProject'),
  ProjectController.update
);

// Get project statistics
router.get(
  '/:projectId/stats',
  projectIdValidator,
  validate,
  checkProjectAccess,
  ProjectController.getStats
);

// Manage project members
router.get(
  '/:projectId/members',
  projectIdValidator,
  validate,
  checkProjectAccess,
  ProjectController.getMembers
);

router.post(
  '/:projectId/members',
  addMemberValidator,
  validate,
  checkProjectAccess,
  checkProjectPermission('canAddMembers'),
  ProjectController.addMember
);

router.delete(
  '/:projectId/members/:userId',
  projectIdValidator,
  validate,
  checkProjectAccess,
  checkProjectPermission('canAddMembers'),
  ProjectController.removeMember
);

// Progress updates routes
router.use('/:projectId/progress', progressRouter);

// Financial management routes
router.use('/:projectId/transactions', financialRouter);

// Milestone routes
router.use('/:projectId/milestones', milestoneRouter);  

export const projectRouter = router;