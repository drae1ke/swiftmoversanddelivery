const express = require('express');
const multer = require('multer');

const { authenticate } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// Configure multer for memory storage (buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Single image upload
router.post('/image', authenticate, upload.single('image'), uploadController.uploadImage);

// Multiple images upload (up to 10)
router.post('/images', authenticate, upload.array('images', 10), uploadController.uploadImages);

module.exports = router;
