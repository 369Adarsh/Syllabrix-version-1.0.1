// ============================================================
// Auth Validation — Express-validator rules for auth endpoints
// ============================================================

const { body } = require('express-validator');

const registerValidation = [
  // username field receives the full name from the frontend — server auto-generates a clean username
  body('username')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

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
    .isIn(['student', 'teacher', 'institute', 'parent', 'professional_learner', 'organization']).withMessage('Invalid user type'),

  body('date_of_birth')
    .optional({ nullable: true, checkFalsy: true })
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
  body('website').optional({ checkFalsy: true }).trim().isURL().withMessage('Invalid website URL'),
];

const completeParentProfileValidation = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }),

  body('relationship')
    .notEmpty().withMessage('Relationship is required')
    .customSanitizer(v => (typeof v === 'string' ? v.toLowerCase() : v))
    .isIn(['mother', 'father', 'guardian', 'other']).withMessage('Invalid relationship'),

  body('notification_email')
    .optional()
    .isEmail().withMessage('Invalid notification email'),
];

const completeOrganizationProfileValidation = [
  body('official_company_name')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 200 }),
  body('industry').optional().trim().isLength({ max: 100 }),
  body('company_size').optional({ checkFalsy: true })
    .isIn(['1-50','51-200','201-500','501-2000','2001-10000','10000+',
           '1-50 (Startup)','51-200 (Small)','201-500 (Mid-market)',
           '501-2000 (Enterprise)','2001-10000 (Large Enterprise)','10000+ (Global Enterprise)']),
  body('website').optional({ checkFalsy: true }).trim().isURL().withMessage('Invalid website URL'),
  body('linkedin_url').optional({ checkFalsy: true }).trim().isURL().withMessage('Invalid LinkedIn URL'),
  body('founded_year').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
];

const completeProfessionalLearnerProfileValidation = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }),

  body('industry').optional().trim().isLength({ max: 100 }),
  body('current_company').optional().trim().isLength({ max: 200 }),
  body('designation').optional().trim().isLength({ max: 150 }),
  body('experience_years').optional().isInt({ min: 0, max: 60 }),
  body('education_level').optional({ checkFalsy: true })
    .customSanitizer(v => {
      // Normalize display labels → DB values
      const map = { 'High School':'high_school','Graduation':'graduation','Post Graduation':'post_graduation','Doctorate':'doctorate','Other':'other' };
      return map[v] || v;
    })
    .isIn(['high_school', 'graduation', 'post_graduation', 'doctorate', 'other']),
  body('skills').optional().isArray(),
  body('learning_goals').optional().isArray(),
  body('hobby').optional().isArray(),
  body('mandatory_courses').optional().isObject(),
];

const updateIdentityValidation = [
  body('username')
    .optional()
    .trim()
    .matches(/^[a-z0-9_.]{3,30}$/).withMessage('Username must be 3–30 characters: lowercase letters, numbers, underscores and dots only.'),

  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Display name must be 2–100 characters.'),
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
  completeProfessionalLearnerProfileValidation,
  completeOrganizationProfileValidation,
  updateIdentityValidation,
};
