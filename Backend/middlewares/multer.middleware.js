import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Allowed file types
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// File size limits (in bytes)
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB

/**
 * Generate unique filename to prevent conflicts
 */
const generateFilename = (file) => {
  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const ext = path.extname(file.originalname);
  const nameWithoutExt = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
  return `${nameWithoutExt}-${uniqueSuffix}${ext}`;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, generateFilename(file));
  }
});

/**
 * File filter to validate file types
 */
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'videoFile') {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Allowed: MP4, WebM, MOV, AVI, MKV'), false);
    }
  } else if (file.fieldname === 'thumbnail' || file.fieldname === 'avatar' || file.fieldname === 'coverImage') {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Allowed: JPEG, PNG, WebP, GIF'), false);
    }
  } else {
    // For other fields, accept common types
    cb(null, true);
  }
};

export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // Max file size (largest allowed)
    files: 5, // Max number of files
  }
});