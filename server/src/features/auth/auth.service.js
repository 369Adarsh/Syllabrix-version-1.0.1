// ============================================================
// Auth Service — Business logic for authentication
// ============================================================

const crypto = require('crypto');
const { ApiError } = require('../../utils/api-error');
const { hashPassword, comparePassword } = require('../../utils/password-utils');
const { generateToken, verifyToken, generateResetToken, generateVerificationToken } = require('../../utils/token-utils');
const { calculateAge } = require('../../../../shared/utils/calculate-age');
const { getAgeGroup } = require('../../../../shared/constants/age-groups');
const queries = require('./auth.queries');

// ======================== GENERATE SYLLABRIX ID ========================
const generateSyllabrixId = async (user_type, username) => {
  const prefixes = { student: 'S', teacher: 'T', institute: 'I', parent: 'P', mentor: 'M' };
  const prefix = prefixes[user_type] || 'U';
  const initials = (username || 'USR').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3).padEnd(3, 'X');
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${initials}${num}`;
};

// ======================== REGISTER ========================

const register = async (userData) => {
  const { username, email, password, user_type, date_of_birth, gender, city, state } = userData;

  const existingEmail = await queries.findUserByEmail(email);
  if (existingEmail) throw ApiError.conflict('An account with this email already exists.');

  const existingUsername = await queries.findUserByUsername(username);
  if (existingUsername) throw ApiError.conflict('This username is already taken.');

  const age = calculateAge(date_of_birth);
  if (age !== null && age < 5) throw ApiError.badRequest('Users must be at least 5 years old to register.');

  const age_group = age !== null ? getAgeGroup(age) : '18+';
  const password_hash = await hashPassword(password);
  const syllabrix_id = await generateSyllabrixId(user_type, username);

  const userId = await queries.createUser({
    username, email, password_hash, user_type, age_group,
    date_of_birth, gender, city, state, country: 'India', syllabrix_id,
  });

  const token = generateToken(userId);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await queries.createSession(userId, tokenHash, null, null, expiresAt);

  const user = await queries.findUserById(userId);
  return { user, token, requiresProfileCompletion: true };
};

// ======================== GOOGLE LOGIN ========================

const googleLogin = async (googleIdToken) => {
  // Verify Google token by calling Google's tokeninfo endpoint
  const https = require('https');
  const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${googleIdToken}`;

  const googleData = await new Promise((resolve, reject) => {
    https.get(verifyUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid token')); }
      });
    }).on('error', reject);
  });

  if (googleData.error_description) throw ApiError.badRequest('Invalid Google token');
  const { sub: googleId, email, name, picture } = googleData;
  if (!email) throw ApiError.badRequest('Google account has no email');

  // Check if user exists by google_id
  let user = await queries.findUserByGoogleId(googleId);

  if (!user) {
    // Check by email
    user = await queries.findUserByEmail(email);
    if (user) {
      // Link Google to existing account
      const { pool } = require('../../database/connection');
      await pool.query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
    } else {
      // Create new user
      const username = email.split('@')[0].replace(/[^a-z0-9_]/gi, '').slice(0, 30) || 'user' + Date.now();
      const syllabrix_id = await generateSyllabrixId('student', username);
      const password_hash = await hashPassword(crypto.randomBytes(16).toString('hex'));

      const userId = await queries.createUser({
        username, email, password_hash, user_type: 'student', age_group: '18+',
        date_of_birth: null, gender: null, city: null, state: null, country: 'India',
        syllabrix_id, google_id: googleId,
      });

      if (picture) {
        const { pool } = require('../../database/connection');
        await pool.query('UPDATE users SET profile_photo_url = ? WHERE id = ?', [picture, userId]);
      }

      user = await queries.findUserById(userId);
    }
  }

  const token = generateToken(user.id);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await queries.createSession(user.id, tokenHash, null, null, expiresAt);
  await queries.updateLastLogin(user.id);

  user = await queries.findUserById(user.id);
  return { user, token };
};

// ======================== LOGIN ========================

const login = async (email, password, deviceInfo, ipAddress) => {
  // Find user by email
  const user = await queries.findUserByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Check if banned
  if (user.is_banned) {
    throw ApiError.forbidden('Your account has been banned due to policy violations.');
  }

  // Check if active
  if (!user.is_active) {
    throw ApiError.forbidden('Your account has been deactivated.');
  }

  // Compare password
  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Generate JWT token
  const token = generateToken(user.id);

  // Create session
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await queries.createSession(user.id, tokenHash, deviceInfo, ipAddress, expiresAt);

  // Update last login
  await queries.updateLastLogin(user.id);

  // Get clean user (without password_hash)
  const cleanUser = await queries.findUserById(user.id);

  return {
    user: cleanUser,
    token,
    requiresProfileCompletion: !user.is_profile_complete,
  };
};

// ======================== LOGOUT ========================

const logout = async (token) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await queries.deactivateSession(tokenHash);
};

// ======================== GET CURRENT USER ========================

const getCurrentUser = async (userId) => {
  const user = await queries.findUserById(userId);
  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  // Get type-specific profile
  let profile = null;
  switch (user.user_type) {
    case 'student':
      profile = await queries.getStudentProfile(userId);
      break;
    case 'teacher':
      profile = await queries.getTeacherProfile(userId);
      break;
    case 'institute':
      profile = await queries.getInstituteProfile(userId);
      break;
    case 'parent':
      profile = await queries.getParentProfile(userId);
      break;
  }

  return { user, profile };
};

// ======================== COMPLETE PROFILE ========================

const completeProfile = async (userId, userType, profileData) => {
  const user = await queries.findUserById(userId);
  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  if (user.is_profile_complete) {
    throw ApiError.badRequest('Profile is already complete.');
  }

  // Create type-specific profile
  switch (userType) {
    case 'student': {
      const age = calculateAge(user.date_of_birth);
      const requiresGuardian = ['5-7', '8-10', '11-13'].includes(user.age_group);
      await queries.createStudentProfile({
        user_id: userId,
        full_name: profileData.full_name,
        age,
        school_name: profileData.school_name,
        class_name: profileData.class_name,
        board: profileData.board,
        medium: profileData.medium,
        skills: profileData.skills,
        interests: profileData.interests,
        guardian_user_id: profileData.guardian_user_id,
        requires_guardian: requiresGuardian,
      });
      break;
    }
    case 'teacher':
      await queries.createTeacherProfile({
        user_id: userId,
        full_name: profileData.full_name,
        subject_primary: profileData.subject_primary,
        subjects_additional: profileData.subjects_additional,
        qualifications: profileData.qualifications,
        teacher_type: profileData.teacher_type,
        institute_name: profileData.institute_name,
        experience_years: profileData.experience_years,
      });
      break;
    case 'institute':
      await queries.createInstituteProfile({
        user_id: userId,
        name: profileData.name,
        institute_type: profileData.institute_type,
        city: profileData.city,
        state: profileData.state,
        website: profileData.website,
        about: profileData.about,
        established_year: profileData.established_year,
        registration_number: profileData.registration_number,
      });
      break;
    case 'parent':
      await queries.createParentProfile({
        user_id: userId,
        full_name: profileData.full_name,
        relationship: profileData.relationship,
        notification_email: profileData.notification_email,
      });
      break;
    default:
      throw ApiError.badRequest('Invalid user type.');
  }

  // Update bio, city, state if provided
  const userUpdates = {};
  if (profileData.bio) userUpdates.bio = profileData.bio;
  if (profileData.city) userUpdates.city = profileData.city;
  if (profileData.state) userUpdates.state = profileData.state;
  if (profileData.phone) userUpdates.phone = profileData.phone;

  if (Object.keys(userUpdates).length > 0) {
    await queries.updateUserProfile(userId, userUpdates);
  }

  // Mark profile as complete
  await queries.markProfileComplete(userId);

  return getCurrentUser(userId);
};

// ======================== FORGOT PASSWORD ========================

const forgotPassword = async (email) => {
  const user = await queries.findUserByEmail(email);
  if (!user) {
    // Don't reveal if email exists
    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  const resetToken = generateResetToken(user.id);

  // In production, send email with reset link
  // For now, return the token (dev only)
  return {
    message: 'If an account exists with this email, a reset link has been sent.',
    resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
  };
};

// ======================== RESET PASSWORD ========================

const resetPassword = async (token, newPassword) => {
  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'reset') {
    throw ApiError.badRequest('Invalid or expired reset token.');
  }

  const password_hash = await hashPassword(newPassword);
  await queries.updatePassword(decoded.userId, password_hash);

  // Deactivate all sessions (force re-login)
  await queries.deactivateAllSessions(decoded.userId);

  return { message: 'Password reset successful. Please login with your new password.' };
};

module.exports = {
  register, login, logout, getCurrentUser, googleLogin,
  completeProfile, forgotPassword, resetPassword,
};
