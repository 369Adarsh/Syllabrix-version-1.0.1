// ============================================================
// Auth Validation — Express-validator rules for auth endpoints
// ============================================================

const { body } = require('express-validator');

const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('user_type')
    .notEmpty().withMessage('User type is required')
    .isIn(['student', 'teacher', 'institute', 'parent']).withMessage('Invalid user type'),

  body('date_of_birth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format (use YYYY-MM-DD)'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender'),

  body('city').optional().trim().isLength({ max: 100 }),
  body('state').optional().trim().isLength({ max: 100 }),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),

  body('password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters'),
];

const completeStudentProfileValidation = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('school_name')
    .optional().trim().isLength({ max: 200 }),

  body('class_name')
    .optional().trim().isLength({ max: 50 }),

  body('board')
    .optional()
    .isIn(['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other']),

  body('medium')
    .optional()
    .isIn(['English', 'Hindi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Other']),

  body('skills').optional().isArray(),
  body('interests').optional().isArray(),
  body('bio').optional().trim().isLength({ max: 500 }),
];

const completeTeacherProfileValidation = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }),

  body('subject_primary')
    .trim()
    .notEmpty().withMessage('Primary subject is required')
    .isLength({ max: 100 }),

  body('teacher_type')
    .optional()
    .isIn(['freelancer', 'institute_affiliated', 'both']),

  body('experience_years')
    .optional()
    .isInt({ min: 0, max: 60 }),

  body('qualifications').optional().isArray(),
  body('subjects_additional').optional().isArray(),
];

const completeInstituteProfileValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Institute name is required')
    .isLength({ min: 2, max: 200 }),

  body('institute_type')
    .notEmpty().withMessage('Institute type is required')
    .isIn(['school', 'college', 'university', 'coaching', 'online_academy', 'other']),

  body('city').optional().trim().isLength({ max: 100 }),
  body('state').optional().trim().isLength({ max: 100 }),
  body('website').optional().trim().isURL().withMessage('Invalid website URL'),
];

const completeParentProfileValidation = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }),

  body('relationship')
    .notEmpty().withMessage('Relationship is required')
    .isIn(['mother', 'father', 'guardian', 'other']),

  body('notification_email')
    .optional()
    .isEmail().withMessage('Invalid notification email'),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  completeStudentProfileValidation,
  completeTeacherProfileValidation,
  completeInstituteProfileValidation,
  completeParentProfileValidation,
};
