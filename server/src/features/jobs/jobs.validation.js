const { body } = require('express-validator');
const createJobValidation = [
  body('title').trim().notEmpty().withMessage('Title required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description required').isLength({ max: 5000 }),
  body('job_type').notEmpty().isIn(['full_time','part_time','freelance','contract','online_only']),
  body('subject').optional().trim().isLength({ max: 100 }),
  body('location').optional().trim().isLength({ max: 200 }),
  body('salary_min').optional().isFloat({ min: 0 }),
  body('salary_max').optional().isFloat({ min: 0 }),
  body('is_remote').optional().isBoolean(),
  body('is_urgent').optional().isBoolean(),
  body('expires_at').optional().isISO8601(),
];
const applyJobValidation = [
  body('cover_message').optional().trim().isLength({ max: 2000 }),
  body('resume_url').optional().trim(),
];
module.exports = { createJobValidation, applyJobValidation };
