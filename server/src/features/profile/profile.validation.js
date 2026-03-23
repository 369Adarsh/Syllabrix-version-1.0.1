const { body } = require('express-validator');

const updateProfileValidation = [
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio max 500 characters'),
  body('phone').optional().trim().matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
  body('city').optional().trim().isLength({ max: 100 }),
  body('state').optional().trim().isLength({ max: 100 }),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  // Student fields
  body('full_name').optional().trim().isLength({ min: 2, max: 100 }),
  body('school_name').optional().trim().isLength({ max: 200 }),
  body('class_name').optional().trim().isLength({ max: 50 }),
  body('board').optional().isIn(['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other']),
  body('skills').optional().isArray(),
  body('interests').optional().isArray(),
  // Teacher fields
  body('subject_primary').optional().trim().isLength({ max: 100 }),
  body('subjects_additional').optional().isArray(),
  body('qualifications').optional().isArray(),
  body('teacher_type').optional().isIn(['freelancer', 'institute_affiliated', 'both']),
  body('experience_years').optional().isInt({ min: 0, max: 60 }),
  body('hourly_rate').optional().isFloat({ min: 0 }),
  // Institute fields
  body('name').optional().trim().isLength({ min: 2, max: 200 }),
  body('institute_type').optional().isIn(['school', 'college', 'university', 'coaching', 'online_academy', 'other']),
  body('website').optional().trim(),
  body('about').optional().trim().isLength({ max: 2000 }),
  body('facilities').optional().isArray(),
  body('boards_offered').optional().isArray(),
  // Parent fields
  body('relationship').optional().isIn(['mother', 'father', 'guardian', 'other']),
  body('notification_email').optional().isEmail(),
  body('weekly_report_enabled').optional().isBoolean(),
  body('screen_time_limit_minutes').optional().isInt({ min: 0, max: 1440 }),
  body('content_filter_level').optional().isIn(['strict', 'moderate', 'standard']),
];

module.exports = { updateProfileValidation };
