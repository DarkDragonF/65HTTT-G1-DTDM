const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

/**
 * Ensures upload directories exist.
 * Creates them if they don't.
 */
const ensureUploadDirs = () => {
  const dirs = ['logos', 'foods', 'general'];
  dirs.forEach((dir) => {
    const fullPath = path.join(UPLOADS_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

/**
 * Gets the public URL for a locally stored file.
 * @param {object} file - Multer file object
 * @param {string} folder - The upload subfolder (e.g., 'logos', 'foods')
 * @returns {string} Public URL path
 */
const getFileUrl = (file, folder) => {
  return `/uploads/${folder}/${file.filename}`;
};

/**
 * Deletes a file from local storage.
 * @param {string} fileUrl - The URL path (e.g., '/uploads/foods/image.jpg')
 */
const deleteFile = (fileUrl) => {
  if (!fileUrl) return;
  try {
    const filePath = path.join(UPLOADS_DIR, '..', fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Failed to delete file:', error.message);
  }
};

// TODO: Google Cloud Storage integration
// const { Storage } = require('@google-cloud/storage');
// const gcs = new Storage({ keyFilename: process.env.GCS_KEY_FILE });
// const bucket = gcs.bucket(process.env.GCS_BUCKET);
//
// const uploadToGCS = async (file, folder) => {
//   const blob = bucket.file(`${folder}/${file.filename}`);
//   const stream = blob.createWriteStream({
//     metadata: { contentType: file.mimetype },
//   });
//   return new Promise((resolve, reject) => {
//     stream.on('error', reject);
//     stream.on('finish', () => {
//       const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//       resolve(publicUrl);
//     });
//     stream.end(file.buffer);
//   });
// };

module.exports = { ensureUploadDirs, getFileUrl, deleteFile };
