// ============================================================
// Auth SQL Queries — Raw SQL only, parameterized
// ============================================================

const { pool } = require('../../database/connection');

// ======================== USER QUERIES ========================

const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

const findUserByUsername = async (username) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] || null;
};

const findUserById = async (id) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, syllabrix_id, username, email, user_type, age_group, date_of_birth, phone,
              profile_photo_url, cover_photo_url, bio, gender, city, state, country,
              is_verified, is_active, is_profile_complete, is_banned, strike_count,
              last_login_at, email_verified_at, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  } catch (e) {
    // Fallback if syllabrix_id column doesn't exist yet (migration not run)
    if (e.message.includes('syllabrix_id')) {
      const [rows] = await pool.query(
        `SELECT id, username, email, user_type, age_group, date_of_birth, phone,
                profile_photo_url, cover_photo_url, bio, gender, city, state, country,
                is_verified, is_active, is_profile_complete, is_banned, strike_count,
                last_login_at, email_verified_at, created_at, updated_at
         FROM users WHERE id = ? LIMIT 1`,
        [id]
      );
      return rows[0] || null;
    }
    throw e;
  }
};

const findUserByGoogleId = async (googleId) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ? LIMIT 1', [googleId]);
    return rows[0] || null;
  } catch (e) {
    if (e.message.includes('google_id')) return null; // Column doesn't exist yet
    throw e;
  }
};

const findUserBySyllabrixId = async (syllabrixId) => {
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE syllabrix_id = ? LIMIT 1',
    [syllabrixId]
  );
  return rows[0] || null;
};

const createUser = async (userData) => {
  const {
    username, email, password_hash, user_type, age_group,
    date_of_birth, gender, city, state, country, syllabrix_id, google_id
  } = userData;

  const { phone } = userData;
  try {
    const [result] = await pool.query(
      `INSERT INTO users (syllabrix_id, username, email, password_hash, user_type, age_group,
                          date_of_birth, gender, city, state, country, google_id, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [syllabrix_id || null, username, email, password_hash, user_type, age_group,
       date_of_birth || null, gender || null, city || null, state || null, country || 'India', google_id || null, phone || null]
    );
    return result.insertId;
  } catch (e) {
    // Fallback if new columns don't exist yet
    if (e.message.includes('syllabrix_id') || e.message.includes('google_id') || e.message.includes('phone')) {
      const [result] = await pool.query(
        `INSERT INTO users (username, email, password_hash, user_type, age_group,
                            date_of_birth, gender, city, state, country, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [username, email, password_hash, user_type, age_group,
         date_of_birth || null, gender || null, city || null, state || null, country || 'India']
      );
      return result.insertId;
    }
    throw e;
  }
};

const updateLastLogin = async (userId) => {
  await pool.query(
    'UPDATE users SET last_login_at = NOW() WHERE id = ?',
    [userId]
  );
};

const updateEmailVerified = async (userId) => {
  await pool.query(
    'UPDATE users SET email_verified_at = NOW(), is_active = 1 WHERE id = ?',
    [userId]
  );
};

const updatePassword = async (userId, passwordHash) => {
  await pool.query(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [passwordHash, userId]
  );
};

const markProfileComplete = async (userId) => {
  await pool.query(
    'UPDATE users SET is_profile_complete = 1 WHERE id = ?',
    [userId]
  );
};

const updateUserProfile = async (userId, fields) => {
  const updates = [];
  const values = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) return;

  values.push(userId);
  await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
};

// ======================== SESSION QUERIES ========================

const createSession = async (userId, tokenHash, deviceInfo, ipAddress, expiresAt) => {
  const [result] = await pool.query(
    `INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, tokenHash, deviceInfo || null, ipAddress || null, expiresAt]
  );
  return result.insertId;
};

const deactivateSession = async (tokenHash) => {
  await pool.query(
    'UPDATE user_sessions SET is_active = 0 WHERE token_hash = ?',
    [tokenHash]
  );
};

const deactivateAllSessions = async (userId) => {
  await pool.query(
    'UPDATE user_sessions SET is_active = 0 WHERE user_id = ?',
    [userId]
  );
};

// ======================== PROFILE QUERIES ========================

const createStudentProfile = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO student_profiles
      (user_id, full_name, age, school_name, class_name, board, medium,
       skills, interests, guardian_user_id, requires_guardian,
       education_level, subject_stream, college_name, university,
       address_line1, address_city, address_state, address_pincode,
       ambition, hobby, favorite_subject, difficult_subject,
       loved_professions, future_vision, sports, sports_level,
       exam_type, exam_target_year, specialization_courses, mandatory_courses)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id, data.full_name, data.age || null, data.school_name || null,
      data.class_name || null, data.board || null, data.medium || 'English',
      JSON.stringify(data.skills || []), JSON.stringify(data.interests || []),
      data.guardian_user_id || null, data.requires_guardian ? 1 : 0,
      data.education_level || 'school',
      data.subject_stream || null,
      data.college_name || null,
      data.university || null,
      data.address_line1 || null,
      data.address_city || null,
      data.address_state || null,
      data.address_pincode || null,
      data.ambition || null,
      data.hobby ? JSON.stringify(data.hobby) : null,
      data.favorite_subject || null,
      data.difficult_subject || null,
      data.loved_professions ? JSON.stringify(data.loved_professions) : null,
      data.future_vision || null,
      data.sports ? JSON.stringify(data.sports) : null,
      data.sports_level || null,
      data.exam_type || null,
      data.exam_target_year || null,
      data.specialization_courses ? JSON.stringify(data.specialization_courses) : null,
      data.mandatory_courses ? JSON.stringify(data.mandatory_courses) : null,
    ]
  );
  return result.insertId;
};

const createTeacherProfile = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO teacher_profiles
      (user_id, full_name, subject_primary, subjects_additional, board_experience,
       qualifications, teacher_type, institute_name, experience_years,
       past_institutes, has_own_business, business_name,
       hobby, learning_interests, mandatory_courses,
       self_as_learner, platform_as_student, platform_as_teacher)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id, data.full_name, data.subject_primary,
      JSON.stringify(data.subjects_additional || []),
      data.board_experience ? JSON.stringify(data.board_experience) : null,
      JSON.stringify(data.qualifications || []),
      data.teacher_type || 'freelancer',
      data.institute_name || null,
      data.experience_years || null,
      data.past_institutes ? JSON.stringify(data.past_institutes) : null,
      data.has_own_business ? 1 : 0,
      data.business_name || null,
      data.hobby ? JSON.stringify(data.hobby) : null,
      data.learning_interests ? JSON.stringify(data.learning_interests) : null,
      data.mandatory_courses ? JSON.stringify(data.mandatory_courses) : null,
      data.self_as_learner || null,
      data.platform_as_student || null,
      data.platform_as_teacher || null,
    ]
  );
  return result.insertId;
};

const createInstituteProfile = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO institute_profiles
      (user_id, name, institute_type, city, state, website, about,
       established_year, registration_number, udise_code,
       address_line1, pincode, authorized_person,
       platform_handler_name, platform_handler_phone, platform_handler_email,
       boards_offered, chain_schools, parent_involvement_policy, how_use_platform)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id, data.name, data.institute_type,
      data.city || null, data.state || null, data.website || null,
      data.about || null, data.established_year || null,
      data.registration_number || null, data.udise_code || null,
      data.address_line1 || null, data.pincode || null,
      data.authorized_person || null,
      data.platform_handler_name || null,
      data.platform_handler_phone || null,
      data.platform_handler_email || null,
      data.boards_offered ? JSON.stringify(data.boards_offered) : null,
      data.chain_schools ? JSON.stringify(data.chain_schools) : null,
      data.parent_involvement_policy || null,
      data.how_use_platform || null,
    ]
  );
  return result.insertId;
};

const createParentProfile = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO parent_profiles
      (user_id, full_name, occupation, relationship, notification_email,
       hobby_involvement, sports_involvement)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id, data.full_name, data.occupation || null,
      data.relationship, data.notification_email || null,
      data.hobby_involvement || null, data.sports_involvement || null,
    ]
  );
  return result.insertId;
};

const createProfessionalLearnerProfile = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO professional_learner_profiles
      (user_id, full_name, current_company, previous_companies, designation, industry,
       experience_years, education_level, skills, learning_goals,
       looking_for_job, how_use_platform,
       hobby, mandatory_courses, address_city, address_state)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id, data.full_name,
      data.current_company || null,
      data.previous_companies ? JSON.stringify(data.previous_companies) : null,
      data.designation || null,
      data.industry || null, data.experience_years || null,
      data.education_level || null,
      data.skills ? JSON.stringify(data.skills) : null,
      data.learning_goals ? JSON.stringify(data.learning_goals) : null,
      data.looking_for_job ? 1 : 0,
      data.how_use_platform || null,
      data.hobby ? JSON.stringify(data.hobby) : null,
      data.mandatory_courses ? JSON.stringify(data.mandatory_courses) : null,
      data.address_city || null, data.address_state || null,
    ]
  );
  return result.insertId;
};

const getStudentProfile = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]
  );
  return rows[0] || null;
};

const getTeacherProfile = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM teacher_profiles WHERE user_id = ? LIMIT 1', [userId]
  );
  return rows[0] || null;
};

const getInstituteProfile = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM institute_profiles WHERE user_id = ? LIMIT 1', [userId]
  );
  return rows[0] || null;
};

const getParentProfile = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM parent_profiles WHERE user_id = ? LIMIT 1', [userId]
  );
  return rows[0] || null;
};

const getProfessionalLearnerProfile = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM professional_learner_profiles WHERE user_id = ? LIMIT 1', [userId]
  );
  return rows[0] || null;
};

const createOrganizationProfile = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO organization_profiles
      (user_id, admin_name, official_company_name, brand_display_name,
       industry, company_size, founded_year, website, linkedin_url,
       about, how_use_platform, address_city, address_state)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id, data.admin_name, data.official_company_name,
      data.brand_display_name || null, data.industry || null,
      data.company_size || null, data.founded_year || null,
      data.website || null, data.linkedin_url || null,
      data.about || null, data.how_use_platform || null,
      data.address_city || null, data.address_state || null,
    ]
  );
  return result.insertId;
};

const getOrganizationProfile = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM organization_profiles WHERE user_id = ? LIMIT 1', [userId]
  );
  return rows[0] || null;
};

module.exports = {
  findUserByEmail, findUserByUsername, findUserById, findUserByGoogleId, findUserBySyllabrixId,
  createUser, updateLastLogin, updateEmailVerified,
  updatePassword, markProfileComplete, updateUserProfile,
  createSession, deactivateSession, deactivateAllSessions,
  createStudentProfile, createTeacherProfile, createInstituteProfile,
  createParentProfile, createProfessionalLearnerProfile, createOrganizationProfile,
  getStudentProfile, getTeacherProfile, getInstituteProfile,
  getParentProfile, getProfessionalLearnerProfile, getOrganizationProfile,
};
