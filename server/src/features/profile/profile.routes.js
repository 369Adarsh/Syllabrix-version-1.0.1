const express = require('express');
const router = express.Router();
const controller = require('./profile.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { sanitizeBody } = require('../../middleware/sanitize.middleware');
const { checkNotBlocked } = require('../../middleware/block-check.middleware');
const { updateProfileValidation } = require('./profile.validation');

// GET /api/profile/suggestions — Follow suggestions (must be before :userId)
router.get('/suggestions', authenticate, controller.getSuggestions);

// GET /api/profile/username/:username — Get profile by username
router.get('/username/:username', authenticate, controller.getProfileByUsername);

// GET /api/profile/:userId — Get profile by ID
router.get('/:userId', authenticate, checkNotBlocked, controller.getProfile);

// PUT /api/profile — Update own profile
router.put('/', authenticate, sanitizeBody, updateProfileValidation, validate, controller.updateProfile);

module.exports = router;
