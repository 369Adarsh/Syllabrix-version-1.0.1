// ============================================================
// Upload Service — Handles all file uploads to Cloudinary
// ============================================================

const { ApiError } = require('../../utils/api-error');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/cloudinary-upload');
const { pool } = require('../../database/connection');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_SIZES = {
  image: 5 * 1024 * 1024,       // 5 MB
  video: 50 * 1024 * 1024,      // 50 MB
  document: 10 * 1024 * 1024,   // 10 MB
};

const getMediaType = (mimetype) => {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) return 'video';
  if (ALLOWED_DOC_TYPES.includes(mimetype)) return 'document';
  return null;
};

// ======================== SINGLE FILE UPLOAD ========================

const uploadFile = async (file, folder = 'general') => {
  if (!file) throw ApiError.badRequest('No file provided.');

  const mediaType = getMediaType(file.mimetype);
  if (!mediaType) {
    throw ApiError.badRequest(
      'File type not supported. Allowed: JPG, PNG, GIF, WEBP, MP4, MOV, PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX'
    );
  }

  // Check file size
  if (file.size > MAX_SIZES[mediaType]) {
    const maxMB = MAX_SIZES[mediaType] / (1024 * 1024);
    throw ApiError.badRequest(`File too large. Maximum size for ${mediaType}: ${maxMB}MB`);
  }

  const resourceType = mediaType === 'image' ? 'image'
    : mediaType === 'video' ? 'video'
    : 'raw';

  const result = await uploadToCloudinary(file.buffer, {
    folder,
    resourceType,
  });

  return {
    url: result.url,
    public_id: result.publicId,
    media_type: mediaType,
    format: result.format,
    width: result.width || null,
    height: result.height || null,
    bytes: result.bytes,
    original_name: file.originalname,
  };
};

// ======================== MULTIPLE FILE UPLOAD ========================

const uploadMultipleFiles = async (files, folder = 'posts') => {
  if (!files || files.length === 0) throw ApiError.badRequest('No files provided.');
  if (files.length > 5) throw ApiError.badRequest('Maximum 5 files per upload.');

  const results = [];
  for (const file of files) {
    const result = await uploadFile(file, folder);
    results.push(result);
  }

  return results;
};

// ======================== PROFILE PHOTO UPLOAD ========================

const uploadProfilePhoto = async (userId, file) => {
  if (!file) throw ApiError.badRequest('No image provided.');

  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw ApiError.badRequest('Profile photo must be JPG, PNG, or WEBP.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw ApiError.badRequest('Profile photo must be under 5MB.');
  }

  // Get current photo to delete old one
  const [users] = await pool.query(
    'SELECT profile_photo_url FROM users WHERE id = ?', [userId]
  );

  const result = await uploadToCloudinary(file.buffer, {
    folder: 'avatars',
    resourceType: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  // Update user profile photo URL
  await pool.query(
    'UPDATE users SET profile_photo_url = ? WHERE id = ?',
    [result.url, userId]
  );

  return {
    url: result.url,
    message: 'Profile photo updated!',
  };
};

// ======================== COVER PHOTO UPLOAD ========================

const uploadCoverPhoto = async (userId, file) => {
  if (!file) throw ApiError.badRequest('No image provided.');

  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw ApiError.badRequest('Cover photo must be JPG, PNG, or WEBP.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw ApiError.badRequest('Cover photo must be under 5MB.');
  }

  const result = await uploadToCloudinary(file.buffer, {
    folder: 'covers',
    resourceType: 'image',
    transformation: [
      { width: 1200, height: 400, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  await pool.query(
    'UPDATE users SET cover_photo_url = ? WHERE id = ?',
    [result.url, userId]
  );

  return {
    url: result.url,
    message: 'Cover photo updated!',
  };
};

// ======================== DELETE FILE ========================

const deleteFile = async (publicId) => {
  if (!publicId) throw ApiError.badRequest('No file ID provided.');
  const success = await deleteFromCloudinary(publicId);
  if (!success) throw ApiError.internal('Failed to delete file.');
  return { message: 'File deleted.' };
};

// ======================== RESUME UPLOAD ========================

const RESUME_TABLE_MAP = {
  student: 'student_profiles',
  teacher: 'teacher_profiles',
  professional_learner: 'professional_learner_profiles',
};

const uploadResumeFile = async (userId, userType, file) => {
  if (!file) throw ApiError.badRequest('No file provided.');
  if (file.mimetype !== 'application/pdf') throw ApiError.badRequest('Resume must be a PDF file.');
  if (file.size > 5 * 1024 * 1024) throw ApiError.badRequest('Resume must be under 5MB.');

  const table = RESUME_TABLE_MAP[userType];
  if (!table) throw ApiError.badRequest('Resume upload is not available for your account type.');

  const result = await uploadToCloudinary(file.buffer, {
    folder: 'resumes',
    resourceType: 'raw',
    public_id: `resume_${userId}_${Date.now()}`,
  });

  await pool.query(`UPDATE \`${table}\` SET resume_url = ? WHERE user_id = ?`, [result.url, userId]);

  return { url: result.url, message: 'Resume uploaded successfully!' };
};

module.exports = {
  uploadFile, uploadMultipleFiles,
  uploadProfilePhoto, uploadCoverPhoto,
  deleteFile, getMediaType, uploadResumeFile,
};
