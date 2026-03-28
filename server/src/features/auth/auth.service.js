// ============================================================
// Auth Service — Business logic for authentication
// ============================================================

const crypto = require('crypto');
const { ApiError } = require('../../utils/api-error');
const { hashPassword, comparePassword } = require('../../utils/password-utils');
const { generateToken, verifyToken, generateResetToken, generateVerificationToken } = require('../../utils/token-utils');
const { calculateAge } = require('../../../../shared/utils/calculate-age');
const { getAgeGroup } = require('../../../../shared/constants/age-groups');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../../services/email.service');
const { CLIENT_URL } = require('../../config/env');
const queries = require('./auth.queries');

// ======================== GENERATE SYLLABRIX ID ========================
// Format: PREFIX-FFFFFFFFLPPPPYY  (10 chars after dash)
//   FFF  = first 3 letters of first name  (3)
//   L    = first letter of last name       (1)
//   PPPP = last 4 digits of phone          (4)
//   YY   = last 2 digits of birth year     (2)
// Total body = 10 chars → e.g. S-AAAS321008
const generateSyllabrixId = async (user_type, username, phone, date_of_birth) => {
  const prefixes = { student: 'S', teacher: 'T', institute: 'I', parent: 'G', mentor: 'M', professional_learner: 'P', organization: 'O' };
  const prefix = prefixes[user_type] || 'U';

  // Split into first and last name words
  const words = (username || 'User').replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
  const firstName = words[0] || 'USR';
  const lastName = words[1] || '';

  // 3 chars: first name
  const firstPart = firstName.toUpperCase().slice(0, 3).padEnd(3, 'X');
  // 1 char: last name initial (X if no last name)
  const lastInit = (lastName[0] || 'X').toUpperCase();
  // 4 chars: last 4 digits of phone, or 4 random digits
  const phonePart = phone
    ? phone.replace(/\D/g, '').slice(-4).padStart(4, '0')
    : String(Math.floor(1000 + Math.random() * 9000));
  // 2 chars: last 2 digits of birth year, or 2 random digits
  const dobPart = date_of_birth
    ? String(new Date(date_of_birth).getFullYear()).slice(-2)
    : String(Math.floor(10 + Math.random() * 90));

  // Combine: 3+1+4+2 = 10 chars
  const base = `${firstPart}${lastInit}${phonePart}${dobPart}`;
  let candidateId = `${prefix}-${base}`;

  // Collision check — if this ID already exists, append a random digit (makes it 11 chars)
  const collision1 = await queries.findUserBySyllabrixId(candidateId);
  if (collision1) {
    candidateId = `${prefix}-${base}${Math.floor(Math.random() * 10)}`;
    const collision2 = await queries.findUserBySyllabrixId(candidateId);
    if (collision2) {
      // Very rare: use full random suffix
      candidateId = `${prefix}-${base}${Math.floor(Math.random() * 100)}`;
    }
  }

  return candidateId;
};

// ======================== REGISTER ========================

const register = async (userData) => {
  const { username, email, password, user_type, date_of_birth, gender, city, state, phone } = userData;

  const existingEmail = await queries.findUserByEmail(email);
  if (existingEmail) throw ApiError.conflict('An account with this email already exists.');

  const existingUsername = await queries.findUserByUsername(username);
  if (existingUsername) throw ApiError.conflict('This username is already taken.');

  const age = calculateAge(date_of_birth);
  if (age !== null && age < 5) throw ApiError.badRequest('Users must be at least 5 years old to register.');

  const age_group = age !== null ? getAgeGroup(age) : '18+';
  const password_hash = await hashPassword(password);
  const syllabrix_id = await generateSyllabrixId(user_type, username, phone, date_of_birth);

  const userId = await queries.createUser({
    username, email, password_hash, user_type, age_group,
    date_of_birth, gender, city, state, country: 'India', syllabrix_id, phone,
  });

  const user = await queries.findUserById(userId);

  // Send verification email (non-blocking — don't fail registration if email fails)
  try {
    const verificationToken = generateVerificationToken(userId);
    const verificationUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail({
      to: email,
      username,
      verificationUrl,
    });
  } catch (emailErr) {
    console.error('Failed to send verification email:', emailErr.message);
  }

  // Don't create a session yet — user must verify email first before logging in
  return { user, requiresEmailVerification: true };
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
      const syllabrix_id = await generateSyllabrixId('student', username, null, null);
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

  // Check email verification
  if (!user.email_verified_at) {
    throw ApiError.forbidden('Please verify your email before signing in. Check your inbox for the verification link.');
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

// ======================== VERIFY EMAIL ========================

const verifyEmail = async (token) => {
  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'verify') {
    throw ApiError.badRequest('Invalid or expired verification link. Please request a new one.');
  }

  const user = await queries.findUserById(decoded.userId);
  if (!user) throw ApiError.notFound('User not found.');

  if (user.email_verified_at) {
    // Already verified — just let them sign in
    return { alreadyVerified: true, message: 'Email already verified. Please sign in.' };
  }

  // Mark email as verified and activate account
  await queries.updateEmailVerified(decoded.userId);

  // Send welcome email
  try {
    await sendWelcomeEmail({ to: user.email, username: user.username, userType: user.user_type });
  } catch (e) {
    console.error('Failed to send welcome email:', e.message);
  }

  return { message: 'Email verified successfully! You can now sign in.' };
};

// ======================== RESEND VERIFICATION EMAIL ========================

const resendVerificationEmail = async (email) => {
  const user = await queries.findUserByEmail(email);
  if (!user) {
    return { message: 'If an account exists with this email, a verification link has been sent.' };
  }
  if (user.email_verified_at) {
    throw ApiError.badRequest('This email is already verified. Please sign in.');
  }

  const verificationToken = generateVerificationToken(user.id);
  const verificationUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
  await sendVerificationEmail({ to: email, username: user.username, verificationUrl });

  return { message: 'Verification email sent. Please check your inbox.' };
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
    case 'professional_learner':
      profile = await queries.getProfessionalLearnerProfile(userId);
      break;
    case 'organization':
      profile = await queries.getOrganizationProfile(userId);
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
        education_level: profileData.education_level,
        subject_stream: profileData.subject_stream,
        college_name: profileData.college_name,
        university: profileData.university,
        address_line1: profileData.address_line1,
        address_city: profileData.address_city || profileData.city,
        address_state: profileData.address_state || profileData.state,
        address_pincode: profileData.address_pincode,
        ambition: profileData.ambition,
        hobby: profileData.hobby,
        favorite_subject: profileData.favorite_subject,
        difficult_subject: profileData.difficult_subject,
        loved_professions: profileData.loved_professions,
        future_vision: profileData.future_vision,
        sports: profileData.sports,
        sports_level: profileData.sports_level,
        exam_type: profileData.exam_type,
        exam_target_year: profileData.exam_target_year,
        specialization_courses: profileData.specialization_courses,
        mandatory_courses: profileData.mandatory_courses,
      });
      break;
    }
    case 'teacher':
      await queries.createTeacherProfile({
        user_id: userId,
        full_name: profileData.full_name,
        subject_primary: profileData.subject_primary,
        subjects_additional: profileData.subjects_additional,
        board_experience: profileData.board_experience,
        qualifications: profileData.qualifications,
        teacher_type: profileData.teacher_type,
        institute_name: profileData.institute_name,
        experience_years: profileData.experience_years,
        past_institutes: profileData.past_institutes,
        has_own_business: profileData.has_own_business,
        business_name: profileData.business_name,
        hobby: profileData.hobby,
        learning_interests: profileData.learning_interests,
        mandatory_courses: profileData.mandatory_courses,
        self_as_learner: profileData.self_as_learner,
        platform_as_student: profileData.platform_as_student,
        platform_as_teacher: profileData.platform_as_teacher,
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
        how_use_platform: profileData.how_use_platform,
        established_year: profileData.established_year,
        registration_number: profileData.registration_number,
        udise_code: profileData.udise_code,
        address_line1: profileData.address_line1,
        pincode: profileData.pincode,
        platform_handler_name: profileData.platform_handler_name,
        platform_handler_phone: profileData.platform_handler_phone,
        platform_handler_email: profileData.platform_handler_email,
        boards_offered: profileData.boards_offered,
        chain_schools: profileData.chain_schools,
        parent_involvement_policy: profileData.parent_involvement_policy,
      });
      break;
    case 'parent':
      await queries.createParentProfile({
        user_id: userId,
        full_name: profileData.full_name,
        occupation: profileData.occupation,
        relationship: profileData.relationship,
        notification_email: profileData.notification_email,
        hobby_involvement: profileData.hobby_involvement,
        sports_involvement: profileData.sports_involvement,
      });
      break;
    case 'professional_learner':
      await queries.createProfessionalLearnerProfile({
        user_id: userId,
        full_name: profileData.full_name,
        current_company: profileData.current_company,
        previous_companies: profileData.previous_companies,
        designation: profileData.designation,
        industry: profileData.industry,
        experience_years: profileData.experience_years,
        education_level: profileData.education_level,
        skills: profileData.skills,
        learning_goals: profileData.learning_goals,
        looking_for_job: profileData.looking_for_job,
        how_use_platform: profileData.how_use_platform,
        hobby: profileData.hobby,
        mandatory_courses: profileData.mandatory_courses,
        address_city: profileData.address_city || profileData.city,
        address_state: profileData.address_state || profileData.state,
      });
      break;
    case 'organization':
      await queries.createOrganizationProfile({
        user_id: userId,
        admin_name: profileData.full_name || profileData.admin_name,
        official_company_name: profileData.official_company_name,
        brand_display_name: profileData.brand_display_name,
        industry: profileData.industry,
        company_size: profileData.company_size,
        founded_year: profileData.founded_year,
        website: profileData.website,
        linkedin_url: profileData.linkedin_url,
        about: profileData.about,
        how_use_platform: profileData.how_use_platform,
        address_city: profileData.address_city || profileData.city,
        address_state: profileData.address_state || profileData.state,
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
    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  const resetToken = generateResetToken(user.id);
  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    await sendPasswordResetEmail({ to: email, username: user.username, resetUrl });
  } catch (e) {
    console.error('Failed to send password reset email:', e.message);
  }

  return { message: 'If an account exists with this email, a reset link has been sent.' };
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

// ======================== APPLY TO BECOME MENTOR ========================

const applyMentor = async (userId, applicationData) => {
  const user = await queries.findUserById(userId);
  if (!user) throw ApiError.notFound('User not found.');
  if (user.user_type === 'mentor') throw ApiError.badRequest('You are already a mentor.');
  if (!user.is_profile_complete) throw ApiError.badRequest('Please complete your profile before applying to become a mentor.');

  const { pool } = require('../../database/connection');

  // Check if already applied
  const [existing] = await pool.query('SELECT id, status FROM become_mentor_requests WHERE user_id = ? LIMIT 1', [userId]);
  if (existing.length > 0) {
    if (existing[0].status === 'pending' || existing[0].status === 'under_review') {
      throw ApiError.conflict('You have already submitted a mentor application. It is currently under review.');
    }
    if (existing[0].status === 'approved') {
      throw ApiError.conflict('Your mentor application has already been approved.');
    }
    // Rejected — allow reapplication (update existing row)
    await pool.query(
      `UPDATE become_mentor_requests SET specialization_field=?, current_expertise=?, motivation=?,
       years_experience=?, highest_qualification=?, linkedin_url=?, status='pending', admin_note=NULL, applied_at=NOW()
       WHERE user_id=?`,
      [
        applicationData.specialization_field,
        applicationData.current_expertise ? JSON.stringify(applicationData.current_expertise) : null,
        applicationData.motivation,
        applicationData.years_experience || null,
        applicationData.highest_qualification || null,
        applicationData.linkedin_url || null,
        userId,
      ]
    );
    return { message: 'Your mentor application has been resubmitted successfully.' };
  }

  await pool.query(
    `INSERT INTO become_mentor_requests
      (user_id, specialization_field, current_expertise, motivation, years_experience, highest_qualification, linkedin_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      applicationData.specialization_field,
      applicationData.current_expertise ? JSON.stringify(applicationData.current_expertise) : null,
      applicationData.motivation,
      applicationData.years_experience || null,
      applicationData.highest_qualification || null,
      applicationData.linkedin_url || null,
    ]
  );

  return { message: 'Your mentor application has been submitted successfully. We will review and get back to you.' };
};

module.exports = {
  register, login, logout, getCurrentUser, googleLogin,
  completeProfile, forgotPassword, resetPassword,
  verifyEmail, resendVerificationEmail, applyMentor,
};
