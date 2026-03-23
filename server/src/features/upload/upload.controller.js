const uploadService = require('./upload.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

// POST /api/upload/single — Upload a single file (general purpose)
const uploadSingle = asyncHandler(async (req, res) => {
  const folder = req.body.folder || 'general';
  const result = await uploadService.uploadFile(req.file, folder);
  sendCreated(res, result, 'File uploaded!');
});

// POST /api/upload/multiple — Upload multiple files (for posts)
const uploadMultiple = asyncHandler(async (req, res) => {
  const folder = req.body.folder || 'posts';
  const results = await uploadService.uploadMultipleFiles(req.files, folder);
  sendCreated(res, results, `${results.length} file(s) uploaded!`);
});

// POST /api/upload/profile-photo — Upload/update profile photo
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadProfilePhoto(req.user.id, req.file);
  sendSuccess(res, result);
});

// POST /api/upload/cover-photo — Upload/update cover photo
const uploadCoverPhoto = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadCoverPhoto(req.user.id, req.file);
  sendSuccess(res, result);
});

// DELETE /api/upload/:publicId — Delete a file from Cloudinary
const deleteFile = asyncHandler(async (req, res) => {
  const result = await uploadService.deleteFile(req.params.publicId);
  sendSuccess(res, result);
});

module.exports = { uploadSingle, uploadMultiple, uploadProfilePhoto, uploadCoverPhoto, deleteFile };
