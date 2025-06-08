import { Router } from 'express';
import { MilestoneController } from '../controllers/milestone.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkProjectAccess, checkProjectPermission } from '../middlewares/project.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createMilestoneValidator,
  updateMilestoneValidator,
  listMilestonesValidator,
  milestoneIdValidator,
  createFromTemplateValidator,
  linkProgressValidator,
} from '../validators/milestone.validator';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authenticate);

// All routes require project access
router.use(checkProjectAccess);

// List milestones
router.get(
  '/',
  listMilestonesValidator,
  validate,
  MilestoneController.listMilestones
);

// Create from template (requires create milestone permission)
router.post(
  '/template',
  checkProjectPermission('canCreateMilestones'),
  createFromTemplateValidator,
  validate,
  MilestoneController.createFromTemplate
);

// Get specific milestone
router.get(
  '/:milestoneId',
  milestoneIdValidator,
  validate,
  MilestoneController.getMilestone
);

// Get milestone progress
router.get(
  '/:milestoneId/progress',
  milestoneIdValidator,
  validate,
  MilestoneController.getMilestoneProgress
);

// Create milestone
router.post(
  '/',
  checkProjectPermission('canCreateMilestones'),
  createMilestoneValidator,
  validate,
  MilestoneController.createMilestone
);

// Update milestone
router.patch(
  '/:milestoneId',
  checkProjectPermission('canCreateMilestones'),
  updateMilestoneValidator,
  validate,
  MilestoneController.updateMilestone
);

// Link progress update to milestone
router.post(
  '/:milestoneId/link-progress',
  checkProjectPermission('canCreateMilestones'),
  linkProgressValidator,
  validate,
  MilestoneController.linkProgressUpdate
);

// Delete milestone
router.delete(
  '/:milestoneId',
  checkProjectPermission('canCreateMilestones'),
  milestoneIdValidator,
  validate,
  MilestoneController.deleteMilestone
);

export const milestoneRouter = router;