import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { isAcceptedImage } from '../utils/imageValidation';

const uploadsDir = path.join(process.cwd(), config.uploadsDir);
if (!config.useR2 && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `invite-${uniqueSuffix}${ext}`);
  },
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (isAcceptedImage(file.mimetype, file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PNG, JPG, or WebP.'));
  }
};

export const upload = multer({
  storage: config.useR2 ? memoryStorage : diskStorage,
  fileFilter,
  limits: { fileSize: config.maxFileSize },
});

export function getFileUrl(storedPathOrKey: string): string {
  if (!storedPathOrKey) return '';
  const filename = path.basename(storedPathOrKey);
  if (config.useR2 && config.r2.publicUrl) {
    return config.r2.publicUrl.replace(/\/$/, '') + '/' + filename;
  }
  return `/uploads/${filename}`;
}
