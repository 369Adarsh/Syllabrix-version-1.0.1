const { pool } = require('../../database/connection');

// ======================== PUBLIC PROFILE ========================

const getPublicProfile = async (userId, viewerId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.email, u.user_type, u.age_group,
            u.profile_photo_url, u.cover_photo_url, u.bio, u.gender,
            u.city, u.state, u.country, u.is_verified, u.is_active,
            u.is_profile_complete, u.created_at,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
            (SELECT COUNT(*) FROM posts WHERE user_id = u.id AND is_active = 1) as posts_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
     FROM users u
     WHERE u.id = ? AND u.is_active = 1`,
    [viewerId || 0, userId]
  );
  return rows[0] || null;
};

const getProfileByUsername = async (username, viewerId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.email, u.user_type, u.age_group,
            u.profile_photo_url, u.cover_photo_url, u.bio, u.gender,
            u.city, u.state, u.country, u.is_verified, u.is_active,
            u.is_profile_complete, u.created_at,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
            (SELECT COUNT(*) FROM posts WHERE user_id = u.id AND is_active = 1) as posts_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
     FROM users u
     WHERE u.username = ? AND u.is_active = 1`,
    [viewerId || 0, username]
  );
  return rows[0] || null;
};

// ======================== TYPE-SPECIFIC PROFILES ========================

const getStudentProfile = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM student_profiles WHERE user_id = ?', [userId]
  );
  return rows[0] || null;
};

const getTeacherProfile = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM teacher_profiles WHERE user_id = ?', [userId]
  );
  return rows[0] || null;
};

const getInstituteProfile = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM institute_profiles WHERE user_id = ?', [userId]
  );
  return rows[0] || null;
};

const getParentProfile = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM parent_profiles WHERE user_id = ?', [userId]
  );
  return rows[0] || null;
};

// ======================== UPDATE PROFILES ========================

const updateUserFields = async (userId, fields) => {
  const allowed = ['bio', 'phone', 'city', 'state', 'gender', 'profile_photo_url', 'cover_photo_url'];
  const updates = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    if (allowed.includes(key) && value !== undefined) {
      updates.push(key + ' = ?');
      values.push(value);
    }
  }
  if (updates.length === 0) return;
  values.push(userId);
  await pool.query('UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?', values);
};

const updateStudentProfile = async (userId, fields) => {
  const allowed = ['full_name', 'school_name', 'class_name', 'board', 'medium', 'skills', 'interests', 'achievements_summary'];
  const updates = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    if (allowed.includes(key) && value !== undefined) {
      updates.push(key + ' = ?');
      values.push((key === 'skills' || key === 'interests') ? JSON.stringify(value) : value);
    }
  }
  if (updates.length === 0) return;
  values.push(userId);
  await pool.query('UPDATE student_profiles SET ' + updates.join(', ') + ' WHERE user_id = ?', values);
};

const updateTeacherProfile = async (userId, fields) => {
  const allowed = ['full_name', 'subject_primary', 'subjects_additional', 'qualifications',
                    'teacher_type', 'institute_name', 'hourly_rate', 'experience_years'];
  const updates = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    if (allowed.includes(key) && value !== undefined) {
      updates.push(key + ' = ?');
      values.push((key === 'subjects_additional' || key === 'qualifications') ? JSON.stringify(value) : value);
    }
  }
  if (updates.length === 0) return;
  values.push(userId);
  await pool.query('UPDATE teacher_profiles SET ' + updates.join(', ') + ' WHERE user_id = ?', values);
};

const updateInstituteProfile = async (userId, fields) => {
  const allowed = ['name', 'institute_type', 'website', 'about', 'city', 'state',
                    'address_line1', 'address_line2', 'pincode', 'facilities', 'boards_offered'];
  const updates = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    if (allowed.includes(key) && value !== undefined) {
      updates.push(key + ' = ?');
      values.push((key === 'facilities' || key === 'boards_offered') ? JSON.stringify(value) : value);
    }
  }
  if (updates.length === 0) return;
  values.push(userId);
  await pool.query('UPDATE institute_profiles SET ' + updates.join(', ') + ' WHERE user_id = ?', values);
};

const updateParentProfile = async (userId, fields) => {
  const allowed = ['full_name', 'relationship', 'notification_email',
                    'weekly_report_enabled', 'screen_time_limit_minutes', 'content_filter_level'];
  const updates = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    if (allowed.includes(key) && value !== undefined) {
      updates.push(key + ' = ?');
      values.push(value);
    }
  }
  if (updates.length === 0) return;
  values.push(userId);
  await pool.query('UPDATE parent_profiles SET ' + updates.join(', ') + ' WHERE user_id = ?', values);
};

// ======================== SUGGESTED USERS ========================

const getSuggestedUsers = async (userId, limit) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.user_type, u.profile_photo_url, u.bio, u.is_verified,
            u.city, u.state,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count
     FROM users u
     WHERE u.id != ?
       AND u.is_active = 1
       AND u.is_profile_complete = 1
       AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?)
     ORDER BY RAND()
     LIMIT ?`,
    [userId, userId, limit]
  );
  return rows;
};

module.exports = {
  getPublicProfile, getProfileByUsername,
  getStudentProfile, getTeacherProfile, getInstituteProfile, getParentProfile,
  updateUserFields, updateStudentProfile, updateTeacherProfile, updateInstituteProfile, updateParentProfile,
  getSuggestedUsers,
};
