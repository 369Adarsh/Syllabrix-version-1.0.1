// ============================================================
// Auth Controller — Parse request, call service, send response
// ============================================================

const authService = require('./auth.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { username, email, password, user_type, date_of_birth, gender, city, state } = req.body;

  const result = await authService.register({
    username, email, password, user_type, date_of_birth, gender, city, state,
  });

  sendCreated(res, result, 'Registration successful! Please complete your profile.');
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const deviceInfo = req.headers['user-agent'] || null;
  const ipAddress = req.ip || req.connection.remoteAddress || null;

  const result = await authService.login(email, password, deviceInfo, ipAddress);

  sendSuccess(res, result, 'Login successful!');
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    await authService.logout(token);
  }

  sendSuccess(res, null, 'Logged out successfully.');
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentUser(req.user.id);
  sendSuccess(res, result);
});

// POST /api/auth/complete-profile
const completeProfile = asyncHandler(async (req, res) => {
  const result = await authService.completeProfile(
    req.user.id,
    req.user.userType,
    req.body
  );

  sendSuccess(res, result, 'Profile completed successfully!');
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  sendSuccess(res, result);
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);
  sendSuccess(res, result);
});

// POST /api/auth/google
const googleLogin = asyncHandler(async (req, res) => {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ success: false, message: 'Google ID token required' });
  const result = await authService.googleLogin(id_token);
  sendSuccess(res, result, 'Google login successful!');
});

module.exports = {
  register, login, logout, getMe, googleLogin,
  completeProfile, forgotPassword, resetPassword,
};
