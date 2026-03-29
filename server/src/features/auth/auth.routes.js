// ============================================================
// Auth Routes — All authentication endpoints
// ============================================================

const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { authLimiter } = require('../../middleware/rate-limit.middleware');
const { sanitizeBody } = require('../../middleware/sanitize.middleware');
const {
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
} = require('./auth.validation');

// ======================== PUBLIC ROUTES ========================

// POST /api/auth/register
router.post('/register',
  authLimiter,
  sanitizeBody,
  registerValidation,
  validate,
  authController.register
);

// POST /api/auth/login
router.post('/login',
  authLimiter,
  sanitizeBody,
  loginValidation,
  validate,
  authController.login
);

// POST /api/auth/forgot-password
router.post('/forgot-password',
  authLimiter,
  forgotPasswordValidation,
  validate,
  authController.forgotPassword
);

// POST /api/auth/reset-password
router.post('/reset-password',
  authLimiter,
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', authController.verifyEmail);

// POST /api/auth/resend-verification
router.post('/resend-verification', authLimiter, authController.resendVerification);

// ======================== PROTECTED ROUTES ========================

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me — Get current user + profile
router.get('/me', authenticate, authController.getMe);

// POST /api/auth/complete-profile — Complete type-specific profile
// Validation depends on user type (checked in controller)
router.post('/complete-profile/student',
  authenticate,
  sanitizeBody,
  completeStudentProfileValidation,
  validate,
  authController.completeProfile
);

router.post('/complete-profile/teacher',
  authenticate,
  sanitizeBody,
  completeTeacherProfileValidation,
  validate,
  authController.completeProfile
);

router.post('/complete-profile/institute',
  authenticate,
  sanitizeBody,
  completeInstituteProfileValidation,
  validate,
  authController.completeProfile
);

router.post('/complete-profile/parent',
  authenticate,
  sanitizeBody,
  completeParentProfileValidation,
  validate,
  authController.completeProfile
);

router.post('/complete-profile/professional_learner',
  authenticate,
  sanitizeBody,
  completeProfessionalLearnerProfileValidation,
  validate,
  authController.completeProfile
);

router.post('/complete-profile/organization',
  authenticate,
  sanitizeBody,
  completeOrganizationProfileValidation,
  validate,
  authController.completeProfile
);

// POST /api/auth/apply-mentor — Existing users applying to become a mentor
router.post('/apply-mentor', authenticate, sanitizeBody, authController.applyMentor);

// PATCH /api/auth/skip-profile — Skip profile completion wizard
router.patch('/skip-profile', authenticate, authController.skipProfile);

// PATCH /api/auth/update-profile — Edit profile sections after completion
router.patch('/update-profile', authenticate, sanitizeBody, authController.updateProfile);

module.exports = router;
