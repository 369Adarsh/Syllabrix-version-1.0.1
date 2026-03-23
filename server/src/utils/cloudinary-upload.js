// Cloudinary upload helper
const cloudinary = require('../config/cloudinary');
const config = require('../config/env');
const { ApiError } = require('./api-error');

const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const folder = `${config.CLOUDINARY.FOLDER}/${options.folder || 'general'}`;

    const uploadOptions = {
      folder,
      resource_type: options.resourceType || 'auto',
      ...options,
    };

    // Remove our custom options before passing to cloudinary
    delete uploadOptions.folder;
    uploadOptions.folder = folder;

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(new ApiError('File upload failed: ' + error.message, 500));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    return false;
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
