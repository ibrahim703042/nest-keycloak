import { diskStorage } from 'multer';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';
import { existsSync, promises as fs } from 'fs';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads/images',
    filename: (req, file, callback) => {
      const uploadPath = './uploads/images';
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      let filename = `${baseName}${ext}`;
      let filePath = path.join(uploadPath, filename);

      // Ensure unique filenames
      if (existsSync(filePath)) {
        filename = `${baseName}-${Date.now()}${ext}`;
        filePath = path.join(uploadPath, filename);
      }

      callback(null, filename);
    },
  }),
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new BadRequestException('Invalid file type'), false);
    }
  },
};

export const deleteFile = async (filename: string): Promise<void> => {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
  const filePath = path.join(uploadsDir, filename);

  try {
    await fs.unlink(filePath);
    console.log(`Successfully deleted: ${filePath}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`File ${filename} not found in uploads directory`);
    } else {
      console.error(`Error deleting file ${filename}:`, err);
      throw new Error(`Failed to delete file: ${err.message}`);
    }
  }
};

export const deleteFiles = async (filenames: string[]): Promise<void> => {
  if (!Array.isArray(filenames)) {
    throw new TypeError('Expected array of filenames');
  }

  // Create deletion promises with individual error handling
  const deletionPromises = filenames.map(async (filename) => {
    try {
      await deleteFile(filename);
    } catch (error) {
      // Add context to the error without stopping other deletions
      console.error(`Failed to delete ${filename}:`, error.message);
      throw error; // Preserve error chain if needed
    }
  });

  // Wait for all operations to complete
  await Promise.all(deletionPromises);
};
