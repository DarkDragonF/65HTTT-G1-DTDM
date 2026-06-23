const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('./errorHandler');

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

let storage;

const bucketName = process.env.GCS_BUCKET;

if (bucketName && bucketName !== 'placeholder' && bucketName.trim() !== '') {
  console.log(`[Upload Middleware] GCS is configured. Streaming uploads directly to bucket: ${bucketName}`);
  const { Storage } = require('@google-cloud/storage');
  
  // Set up storage client - uses ADC (application default credentials) automatically on Cloud Run
  const gcs = new Storage();
  
  storage = {
    _handleFile: (req, file, cb) => {
      const bucket = gcs.bucket(bucketName);
      const folder = req.uploadFolder || 'general';
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${uuidv4()}-${Date.now()}${ext}`;
      const blob = bucket.file(`${folder}/${filename}`);

      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      blobStream.on('error', (err) => {
        cb(err);
      });

      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${folder}/${filename}`;
        cb(null, {
          filename,
          path: publicUrl, // Multer stores this in req.file.path
          size: file.size,
        });
      });

      file.stream.pipe(blobStream);
    },

    _removeFile: (req, file, cb) => {
      const bucket = gcs.bucket(bucketName);
      const folder = req.uploadFolder || 'general';
      const blob = bucket.file(`${folder}/${file.filename}`);
      blob.delete()
        .then(() => cb(null))
        .catch((err) => cb(err));
    }
  };
} else {
  console.log('[Upload Middleware] GCS is not configured. Falling back to local disk storage.');
  storage = multer.diskStorage({
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
}

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
