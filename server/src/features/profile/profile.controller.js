const profileService = require('./profile.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

// GET /api/profile/:userId — Get user profile by ID
const getProfile = asyncHandler(async (req, res) => {
  const result = await profileService.getProfile(
    parseInt(req.params.userId), req.user.id
  );
  sendSuccess(res, result);
});

// GET /api/profile/username/:username — Get user profile by username
const getProfileByUsername = asyncHandler(async (req, res) => {
  const result = await profileService.getProfileByUsername(
    req.params.username, req.user.id
  );
  sendSuccess(res, result);
});

// PUT /api/profile — Update own profile
const updateProfile = asyncHandler(async (req, res) => {
  const { bio, phone, city, state, gender, ...profileData } = req.body;
  const userData = { bio, phone, city, state, gender };

  // Remove undefined values
  Object.keys(userData).forEach(k => userData[k] === undefined && delete userData[k]);

  const result = await profileService.updateProfile(
    req.user.id, req.user.userType, userData, profileData
  );
  sendSuccess(res, result, 'Profile updated!');
});

// GET /api/profile/suggestions — Get follow suggestions
const getSuggestions = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const suggestions = await profileService.getSuggestions(req.user.id, limit);
  sendSuccess(res, suggestions);
});

module.exports = { getProfile, getProfileByUsername, updateProfile, getSuggestions };
