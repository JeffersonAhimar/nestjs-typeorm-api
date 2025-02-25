import { HttpException, HttpStatus } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';

export const createMulterOptions = (
  uploadDir: string,
  maxFileSizeMB: number,
  allowedMimeTypes: string[],
) => {
  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(process.cwd(), uploadDir);

        // Create folder if not exists
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),

    limits: {
      fileSize: maxFileSizeMB * 1024 * 1024,
    },

    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
      req.maxFileSizeMB = maxFileSizeMB; // Save the limit to use in filter

      if (!allowedMimeTypes.includes(file.mimetype)) {
        const fileTypeException = new HttpException(
          `File type not allowed. Only these are allowed: ${allowedMimeTypes.join(', ')}`,
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );
        return cb(fileTypeException, false);
      }

      cb(null, true);
    },
  };
};
