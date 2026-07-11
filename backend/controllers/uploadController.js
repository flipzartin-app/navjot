const asyncHandler = require('express-async-handler');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

// @desc Upload a course video to Cloudinary
// @route POST /api/upload/video (multipart/form-data, field name "video")
const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No video file uploaded');
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'elearning/videos',
    resourceType: 'video',
  });

  res.status(201).json({
    videoUrl: result.secure_url,
    publicId: result.public_id,
    duration: result.duration || 0,
  });
});

// @desc Upload a course/profile image to Cloudinary
// @route POST /api/upload/image (multipart/form-data, field name "image")
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded');
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'elearning/images',
    resourceType: 'image',
  });

  res.status(201).json({ imageUrl: result.secure_url, publicId: result.public_id });
});

module.exports = { uploadVideo, uploadImage };
