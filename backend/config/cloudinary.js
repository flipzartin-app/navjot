const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Streams an in-memory file buffer (from multer.memoryStorage()) straight to Cloudinary.
// resourceType: 'video' | 'image'
const uploadBufferToCloudinary = (buffer, { folder, resourceType }) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

module.exports = { cloudinary, uploadBufferToCloudinary };
