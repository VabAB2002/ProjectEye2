import multer from 'multer';
import { config } from '../../config';
import { AppError } from './error.middleware';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxFiles,
  },
});

export const uploadPhotos = upload.array('photos', config.upload.maxFiles);
export const uploadSinglePhoto = upload.single('photo');    
export const uploadSinglePhotoreceipt = upload.single('receipt');
export const uploadReceipt = upload.single('receipt');