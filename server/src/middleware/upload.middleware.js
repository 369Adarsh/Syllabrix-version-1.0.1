// File upload middleware using Multer
const multer = require('multer');
const path = require('path');

// Store in memory (we upload to Cloudinary, not disk)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImages = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const allowedDocs = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
  const allowedVideos = ['.mp4', '.mov', '.avi', '.webm'];
  const allowedAll = [...allowedImages, ...allowedDocs, ...allowedVideos];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedAll.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported. Allowed: images, documents, videos.'), false);
  }
};

// Upload configurations
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
}).single('file');

const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).array('files', 5); // Max 5 files

const uploadAvatar = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for avatars
}).single('avatar');

const uploadResumePdf = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for resumes
}).single('resume');

module.exports = { uploadSingle, uploadMultiple, uploadAvatar, uploadResumePdf };
