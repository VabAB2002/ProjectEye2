import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config';
import { AppError } from '../../api/middlewares/error.middleware';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

export class StorageService {
  private static s3Client = new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId!,
      secretAccessKey: config.aws.secretAccessKey!,
    },
  });

  static async uploadImage(
    file: Express.Multer.File,
    folder: string
  ): Promise<{ url: string; thumbnailUrl: string; key: string }> {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const key = `${folder}/${fileName}`;
      const thumbnailKey = `${folder}/thumbnails/${fileName}`;

      // Process image - create main and thumbnail
      const mainImage = await sharp(file.buffer)
        .resize(1920, 1920, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      const thumbnail = await sharp(file.buffer)
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center' 
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      if (config.upload.localStorage) {
        // Local storage for development
        const uploadPath = config.upload.localUploadPath;
        const mainPath = path.join(uploadPath, key);
        const thumbPath = path.join(uploadPath, thumbnailKey);

        await fs.mkdir(path.dirname(mainPath), { recursive: true });
        await fs.mkdir(path.dirname(thumbPath), { recursive: true });

        await fs.writeFile(mainPath, mainImage);
        await fs.writeFile(thumbPath, thumbnail);

        return {
          url: `/uploads/${key}`,
          thumbnailUrl: `/uploads/${thumbnailKey}`,
          key,
        };
      } else {
        // S3 upload for production
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: config.aws.s3BucketName!,
            Key: key,
            Body: mainImage,
            ContentType: 'image/jpeg',
          })
        );

        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: config.aws.s3BucketName!,
            Key: thumbnailKey,
            Body: thumbnail,
            ContentType: 'image/jpeg',
          })
        );

        const url = `https://${config.aws.s3BucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
        const thumbnailUrl = `https://${config.aws.s3BucketName}.s3.${config.aws.region}.amazonaws.com/${thumbnailKey}`;

        return { url, thumbnailUrl, key };
      }
    } catch (error) {
      throw new AppError('Failed to upload image', 500);
    }
  }

  static async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (config.upload.localStorage) {
      return `/uploads/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: config.aws.s3BucketName!,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  static async deleteFile(key: string): Promise<void> {
    try {
      if (config.upload.localStorage) {
        const filePath = path.join(config.upload.localUploadPath, key);
        await fs.unlink(filePath).catch(() => {});
      } else {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: config.aws.s3BucketName!,
            Key: key,
          })
        );
      }
    } catch (error) {
      // Log error but don't throw - deletion failures shouldn't break the flow
      console.error('Failed to delete file:', error);
    }
  }
}