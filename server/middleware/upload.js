const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../config/cloudinary');

// Ensure local uploads directory exists for fallback
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer in-memory storage so we can stream to Cloudinary or save to disk fallback
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, webp) are permitted.'));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // Maximum 5 files per submission
  },
  fileFilter,
});

/**
 * Process uploaded files: Upload to Cloudinary if configured; otherwise save to local disk
 * @param {Array} files Array of multer file objects
 * @param {string} folder Target folder name
 * @param {object} req Express request object for local URL construction
 * @returns {Promise<Array<{url: string, publicId: string}>>}
 */
const processFiles = async (files, folder = 'civicconnect', req = null) => {
  if (!files || files.length === 0) return [];

  const results = [];

  for (const file of files) {
    if (isCloudinaryConfigured) {
      try {
        const uploadRes = await uploadToCloudinary(file.buffer, folder);
        results.push(uploadRes);
        continue;
      } catch (err) {
        console.error('[Cloudinary Upload Error]', err.message);
        // Fall through to local fallback if Cloudinary upload fails
      }
    }

    // Local disk fallback
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname) || '.jpg';
    const filename = `img-${uniqueSuffix}${extension}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    const protocol = req ? req.protocol : 'http';
    const host = req ? req.get('host') : 'localhost:5000';
    const localUrl = `${protocol}://${host}/uploads/${filename}`;

    results.push({
      url: localUrl,
      publicId: filename,
    });
  }

  return results;
};

module.exports = {
  upload,
  processFiles,
};
