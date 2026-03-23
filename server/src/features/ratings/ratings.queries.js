const { pool } = require('../../database/connection');

const rateTeacher = async (teacherId, studentId, rating, review, classId) => {
  const [r] = await pool.query(
    'INSERT INTO teacher_ratings (teacher_user_id, student_user_id, rating, review, class_id) VALUES (?,?,?,?,?)',
    [teacherId, studentId, rating, review||null, classId||null]
  );
  // Update teacher's average rating
  const [avg] = await pool.query(
    'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM teacher_ratings WHERE teacher_user_id = ?', [teacherId]
  );
  await pool.query(
    'UPDATE teacher_profiles SET rating = ?, total_ratings = ? WHERE user_id = ?',
    [parseFloat(avg[0].avg_rating).toFixed(2), avg[0].total, teacherId]
  );
  return r.insertId;
};

const getExistingRating = async (teacherId, studentId) => {
  const [rows] = await pool.query(
    'SELECT * FROM teacher_ratings WHERE teacher_user_id = ? AND student_user_id = ?', [teacherId, studentId]
  );
  return rows[0] || null;
};

const getTeacherRatings = async (teacherId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT tr.*, u.username, u.profile_photo_url
     FROM teacher_ratings tr JOIN users u ON tr.student_user_id = u.id
     WHERE tr.teacher_user_id = ? ORDER BY tr.created_at DESC LIMIT ? OFFSET ?`,
    [teacherId, limit, offset]
  );
  const [cnt] = await pool.query(
    'SELECT COUNT(*) as total FROM teacher_ratings WHERE teacher_user_id = ?', [teacherId]
  );
  const [avg] = await pool.query(
    'SELECT AVG(rating) as avg_rating FROM teacher_ratings WHERE teacher_user_id = ?', [teacherId]
  );
  return { ratings: rows, total: cnt[0].total, average: parseFloat(avg[0].avg_rating || 0).toFixed(2) };
};

module.exports = { rateTeacher, getExistingRating, getTeacherRatings };
