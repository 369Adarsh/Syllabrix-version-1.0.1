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

const createUser = async (userData) => {
  const {
    username, email, password_hash, user_type, age_group,
    date_of_birth, gender, city, state, country, syllabrix_id, google_id
  } = userData;

  try {
    const [result] = await pool.query(
      `INSERT INTO users (syllabrix_id, username, email, password_hash, user_type, age_group,
                          date_of_birth, gender, city, state, country, google_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [syllabrix_id || null, username, email, password_hash, user_type, age_group,
       date_of_birth || null, gender || null, city || null, state || null, country || 'India', google_id || null]
    );
    return result.insertId;
  } catch (e) {
    // Fallback if new columns don't exist yet
    if (e.message.includes('syllabrix_id') || e.message.includes('google_id')) {
      const [result] = await pool.query(
        `INSERT INTO users (username, email, password_hash, user_type, age_group,
                            date_of_birth, gender, city, state, country)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
       skills, interests, guardian_user_id, requires_guardian)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.user_id, data.full_name, data.age || null, data.school_name || null,
     data.class_name || null, data.board || null, data.medium || 'English',
     JSON.stringify(data.skills || []), JSON.stringify(data.interests || []),
     data.guardian_user_id || null, data.requires_guardian ? 1 : 0]
  );
  return result.insertId;
};

const createTeacherProfile = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO teacher_profiles
      (user_id, full_name, subject_primary, subjects_additional, qualifications,
       teacher_type, institute_name, experience_years)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.user_id, data.full_name, data.subject_primary,
     JSON.stringify(data.subjects_additional || []),
     JSON.stringify(data.qualifications || []),
     data.teacher_type || 'freelancer', data.institute_name || null,
     data.experience_years || null]
  );
  return result.insertId;
};

const createInstituteProfile = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO institute_profiles
      (user_id, name, institute_type, city, state, website, about,
       established_year, registration_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.user_id, data.name, data.institute_type,
     data.city || null, data.state || null, data.website || null,
     data.about || null, data.established_year || null,
     data.registration_number || null]
  );
  return result.insertId;
};

const createParentProfile = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO parent_profiles
      (user_id, full_name, relationship, notification_email)
     VALUES (?, ?, ?, ?)`,
    [data.user_id, data.full_name, data.relationship,
     data.notification_email || null]
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

module.exports = {
  findUserByEmail, findUserByUsername, findUserById, findUserByGoogleId,
  createUser, updateLastLogin, updateEmailVerified,
  updatePassword, markProfileComplete, updateUserProfile,
  createSession, deactivateSession, deactivateAllSessions,
  createStudentProfile, createTeacherProfile, createInstituteProfile, createParentProfile,
  getStudentProfile, getTeacherProfile, getInstituteProfile, getParentProfile,
};
