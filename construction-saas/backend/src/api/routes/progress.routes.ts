import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkProjectAccess, checkProjectPermission } from '../middlewares/project.middleware';
import { validate } from '../middlewares/validation.middleware';
import { uploadPhotos } from '../middlewares/upload.middleware';
import {
  createProgressValidator,
  updateProgressValidator,
  listProgressValidator,
  progressByDateValidator,
  photoIdValidator,
  updatePhotoCaptionValidator,
} from '../validators/progress.validator';

const router = Router({ mergeParams: true }); // Important: mergeParams to get projectId

// All routes require authentication
router.use(authenticate);

// All routes require project access
router.use(checkProjectAccess);

// List progress updates
router.get(
  '/',
  listProgressValidator,
  validate,
  ProgressController.list
);

// Get progress by date
router.get(
  '/date/:date',
  progressByDateValidator,
  validate,
  ProgressController.getByDate
);

// Get specific progress update
router.get(
  '/:updateId',
  ProgressController.getById
);

// Create progress update (requires upload documents permission)
router.post(
  '/',
  checkProjectPermission('canUploadDocuments'),
  uploadPhotos,
  createProgressValidator,
  validate,
  ProgressController.create
);

// Update progress update
router.patch(
  '/:updateId',
  checkProjectPermission('canUploadDocuments'),
  updateProgressValidator,
  validate,
  ProgressController.update
);

// Add photos to existing update
router.post(
  '/:updateId/photos',
  checkProjectPermission('canUploadDocuments'),
  uploadPhotos,
  ProgressController.addPhotos
);

// Delete photo
router.delete(
  '/:updateId/photos/:photoId',
  checkProjectPermission('canUploadDocuments'),
  photoIdValidator,
  validate,
  ProgressController.deletePhoto
);

// Update photo caption
router.patch(
  '/:updateId/photos/:photoId',
  checkProjectPermission('canUploadDocuments'),
  updatePhotoCaptionValidator,
  validate,
  ProgressController.updatePhotoCaption
);

export const progressRouter = router;