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

// POST /api/auth/google — Google OAuth login
router.post('/google', authLimiter, authController.googleLogin);

// POST /api/auth/reset-password
router.post('/reset-password',
  authLimiter,
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

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

module.exports = router;
