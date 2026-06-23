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
 * Gets the public URL for a uploaded file.
 * Supports GCS absolute path and local relative path.
 * @param {object} file - Multer file object
 * @param {string} folder - The upload subfolder (e.g., 'logos', 'foods')
 * @returns {string} Public URL path
 */
const getFileUrl = (file, folder) => {
  if (file.path) {
    return file.path; // Returns the public GCS URL directly
  }
  return `/uploads/${folder}/${file.filename}`;
};

/**
 * Deletes a file (handles GCS deletion or local storage deletion).
 * @param {string} fileUrl - The URL path (e.g., '/uploads/foods/image.jpg' or GCS URL)
 */
const deleteFile = async (fileUrl) => {
  if (!fileUrl) return;

  // Check if it is a Google Cloud Storage URL
  if (fileUrl.startsWith('https://storage.googleapis.com/')) {
    const bucketName = process.env.GCS_BUCKET;
    if (!bucketName || bucketName === 'placeholder') {
      console.warn('[Storage Util] Cannot delete GCS file: GCS_BUCKET is not configured.');
      return;
    }
    try {
      const { Storage } = require('@google-cloud/storage');
      const gcs = new Storage();
      
      // Extract the object name from the GCS URL:
      // URL format: https://storage.googleapis.com/bucket-name/folder/filename
      const objectPath = fileUrl.replace(`https://storage.googleapis.com/${bucketName}/`, '');
      console.log(`[Storage Util] Deleting GCS file: ${objectPath} from bucket: ${bucketName}...`);
      
      await gcs.bucket(bucketName).file(objectPath).delete();
      console.log(`✅ [Storage Util] Successfully deleted GCS file: ${objectPath}`);
    } catch (error) {
      console.error('[Storage Util] Failed to delete GCS file:', error.message);
    }
    return;
  }

  // Fallback to local file deletion
  try {
    const filePath = path.join(UPLOADS_DIR, '..', fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Failed to delete local file:', error.message);
  }
};

module.exports = { ensureUploadDirs, getFileUrl, deleteFile };
