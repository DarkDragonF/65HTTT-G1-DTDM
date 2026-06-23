const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('./errorHandler');

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.uploadFolder || 'general';
    const uploadPath = path.resolve(__dirname, '../../uploads', folder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPG, PNG, and WebP are allowed.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

/**
 * Middleware factory that sets the upload folder before multer processes the file.
 * @param {string} folder - Subfolder inside uploads/ (e.g., 'logos', 'foods')
 */
const uploadTo = (folder) => {
  return [
    (req, res, next) => {
      req.uploadFolder = folder;
      next();
    },
    upload.single('image'),
    (err, req, res, next) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size exceeds 5MB limit.', 400));
        }
        return next(new AppError(err.message, 400));
      }
      next(err);
    },
  ];
};

module.exports = { upload, uploadTo };
