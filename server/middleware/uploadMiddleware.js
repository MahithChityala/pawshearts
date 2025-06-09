const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/appError');

// Set storage engine for local uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Use absolute path for uploads directory
    const uploadDir = path.join(__dirname, '..', 'uploads', 'communities');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    console.log('Uploading file to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    console.log('Generated filename:', uniqueFilename);
    cb(null, uniqueFilename);
  }
});

// File filter to validate image types
const fileFilter = (req, file, cb) => {
  // Accept only image files
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid file type. Only JPEG, JPG, PNG, GIF, and WEBP files are allowed.',
        400
      )
    );
  }
};

// Configure multer with size limits
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB limit
};

// Create the multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits
});

// Middleware for handling single image upload
exports.uploadSingleImage = upload.single('image');

// Middleware for handling multiple image uploads
exports.uploadMultipleImages = upload.array('images', 10); // Max 10 images

// Middleware for handling product images upload
exports.uploadProductImages = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

// Middleware for handling review images upload
exports.uploadReviewImages = upload.array('images', 5); // Max 5 images for reviews

// Format error for multer errors
exports.handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large. Maximum size is 5MB.', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files uploaded.', 400));
    }
    return next(new AppError(`Upload error: ${err.message}`, 400));
  }
  next(err);
};

// Process uploaded files and add URLs to req object
exports.processUploadedFiles = (req, res, next) => {
  if (req.file) {
    console.log('Processing file:', req.file);
    // Store just the filename in the database
    req.fileUrl = req.file.filename;
  }
  next();
}; 