const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadVideo, uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Files are held in memory only long enough to stream to Cloudinary - never written to disk.
const videoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB cap
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB cap

router.post('/video', protect, authorize('instructor', 'admin'), videoUpload.single('video'), uploadVideo);
router.post('/image', protect, authorize('instructor', 'admin'), imageUpload.single('image'), uploadImage);

module.exports = router;
