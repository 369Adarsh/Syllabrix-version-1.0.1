const express = require('express');
const router = express.Router();
const controller = require('./upload.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { uploadSingle, uploadMultiple, uploadAvatar } = require('../../middleware/upload.middleware');
const { uploadLimiter } = require('../../middleware/rate-limit.middleware');

// POST /api/upload/single — Upload one file (returns URL to use in posts, jobs, etc.)
router.post('/single',
  authenticate,
  uploadLimiter,
  uploadSingle,
  controller.uploadSingle
);

// POST /api/upload/multiple — Upload up to 5 files
router.post('/multiple',
  authenticate,
  uploadLimiter,
  uploadMultiple,
  controller.uploadMultiple
);

// POST /api/upload/profile-photo — Upload/change profile photo
router.post('/profile-photo',
  authenticate,
  uploadAvatar,
  controller.uploadProfilePhoto
);

// POST /api/upload/cover-photo — Upload/change cover photo
router.post('/cover-photo',
  authenticate,
  uploadAvatar,
  controller.uploadCoverPhoto
);

// DELETE /api/upload/:publicId — Delete uploaded file
router.delete('/:publicId',
  authenticate,
  controller.deleteFile
);

module.exports = router;
