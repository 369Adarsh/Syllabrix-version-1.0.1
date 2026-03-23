const { pool } = require('../../database/connection');

const getStudentScore = async (userId) => {
  const [rows] = await pool.query(
    'SELECT syllabrix_score, experience_xp FROM student_profiles WHERE user_id = ?', [userId]
  );
  return rows[0] || null;
};

const getScoreBreakdown = async (userId) => {
  const [posts] = await pool.query('SELECT COUNT(*) as c FROM posts WHERE user_id = ? AND is_active = 1', [userId]);
  const [likes] = await pool.query('SELECT SUM(likes_count) as c FROM posts WHERE user_id = ? AND is_active = 1', [userId]);
  const [comments] = await pool.query('SELECT COUNT(*) as c FROM post_comments WHERE user_id = ? AND is_active = 1', [userId]);
  const [followers] = await pool.query('SELECT COUNT(*) as c FROM follows WHERE following_id = ?', [userId]);
  const [endorsements] = await pool.query('SELECT COUNT(*) as c FROM skill_endorsements WHERE student_user_id = ?', [userId]);
  const [classesAttended] = await pool.query('SELECT COUNT(*) as c FROM live_class_attendees WHERE user_id = ?', [userId]);

  return {
    posts_count: posts[0].c || 0,
    total_likes_received: parseInt(likes[0].c) || 0,
    comments_count: comments[0].c || 0,
    followers_count: followers[0].c || 0,
    endorsements_count: endorsements[0].c || 0,
    classes_attended: classesAttended[0].c || 0,
  };
};

const getScoreHistory = async (userId, limit) => {
  const [rows] = await pool.query(
    'SELECT * FROM syllabrix_score_history WHERE user_id = ? ORDER BY recorded_at DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
};

const recordScoreChange = async (userId, newScore, changeAmount, reason) => {
  await pool.query(
    'INSERT INTO syllabrix_score_history (user_id, score, change_amount, change_reason) VALUES (?,?,?,?)',
    [userId, newScore, changeAmount, reason]
  );
  await pool.query('UPDATE student_profiles SET syllabrix_score = ? WHERE user_id = ?', [newScore, userId]);
};

const getLeaderboard = async (limit, offset) => {
  const [rows] = await pool.query(
    `SELECT sp.syllabrix_score, sp.full_name, sp.experience_xp,
            u.id, u.username, u.profile_photo_url, u.city, u.state, u.is_verified
     FROM student_profiles sp JOIN users u ON sp.user_id = u.id
     WHERE u.is_active = 1 AND u.is_profile_complete = 1
     ORDER BY sp.syllabrix_score DESC LIMIT ? OFFSET ?`, [limit, offset]
  );
  return rows;
};

const getLeaderboardCount = async () => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE u.is_active = 1 AND u.is_profile_complete = 1'
  );
  return rows[0].total;
};

module.exports = { getStudentScore, getScoreBreakdown, getScoreHistory, recordScoreChange, getLeaderboard, getLeaderboardCount };
