const { pool } = require('../../database/connection');
const toD = () => new Date().toISOString().slice(0,10);

const getDaily = async (date) => {
  const [r] = await pool.query('SELECT * FROM quizzes WHERE is_daily = 1 AND date_for = ? AND is_published = 1', [date || toD()]);
  return r[0] || null;
};
const getByExam = async (examId, limit, offset) => {
  const [rows] = await pool.query('SELECT id,title,quiz_type,total_questions,difficulty,total_attempts,avg_score_percent,date_for,created_at FROM quizzes WHERE exam_id = ? AND is_published = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?', [examId, limit, offset]);
  const [cnt] = await pool.query('SELECT COUNT(*) as total FROM quizzes WHERE exam_id = ? AND is_published = 1', [examId]);
  return { quizzes: rows, total: cnt[0].total };
};
const getByTopic = async (topic) => {
  const [r] = await pool.query("SELECT id,title,quiz_type,total_questions,difficulty,total_attempts FROM quizzes WHERE topic LIKE ? AND is_published = 1 ORDER BY created_at DESC LIMIT 20", ['%'+topic+'%']);
  return r;
};
const getById = async (id) => { const [r] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [id]); return r[0]||null; };

const create = async (d) => {
  const toDate = (dt) => dt ? new Date(dt).toISOString().slice(0,10) : null;
  const [r] = await pool.query(
    'INSERT INTO quizzes (title,exam_id,subject,topic,quiz_type,questions,total_questions,time_limit_seconds,difficulty,is_daily,date_for) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [d.title, d.exam_id||null, d.subject||null, d.topic||null, d.quiz_type||'topic_practice',
     JSON.stringify(d.questions), d.questions.length, d.time_limit_seconds||null,
     d.difficulty||'mixed', d.is_daily?1:0, toDate(d.date_for)]
  );
  return r.insertId;
};

const submitAttempt = async (d) => {
  const [r] = await pool.query(
    'INSERT INTO quiz_attempts (user_id,quiz_id,answers,score,total_questions,correct_count,wrong_count,skipped_count,time_taken_seconds,completed_at) VALUES (?,?,?,?,?,?,?,?,?,NOW())',
    [d.user_id, d.quiz_id, JSON.stringify(d.answers), d.score, d.total_questions,
     d.correct_count, d.wrong_count, d.skipped_count, d.time_taken_seconds||null]
  );
  // Update quiz stats
  await pool.query('UPDATE quizzes SET total_attempts = total_attempts + 1 WHERE id = ?', [d.quiz_id]);
  const [avg] = await pool.query('SELECT AVG(score/total_questions*100) as avg FROM quiz_attempts WHERE quiz_id = ?', [d.quiz_id]);
  await pool.query('UPDATE quizzes SET avg_score_percent = ? WHERE id = ?', [parseFloat(avg[0].avg||0).toFixed(2), d.quiz_id]);
  return r.insertId;
};

const getAttempt = async (userId, quizId) => {
  const [r] = await pool.query('SELECT * FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY created_at DESC LIMIT 1', [userId, quizId]);
  return r[0]||null;
};

const getLeaderboard = async (quizId, limit) => {
  const [r] = await pool.query(
    `SELECT qa.score, qa.correct_count, qa.total_questions, qa.time_taken_seconds, qa.completed_at,
            u.id as user_id, u.username, u.profile_photo_url
     FROM quiz_attempts qa JOIN users u ON qa.user_id = u.id
     WHERE qa.quiz_id = ? ORDER BY qa.score DESC, qa.time_taken_seconds ASC LIMIT ?`, [quizId, limit]);
  return r;
};

const getDailyLeaderboard = async (date, limit) => {
  const [r] = await pool.query(
    `SELECT qa.score, qa.correct_count, qa.total_questions, qa.time_taken_seconds,
            u.id as user_id, u.username, u.profile_photo_url, q.title as quiz_title
     FROM quiz_attempts qa
     JOIN users u ON qa.user_id = u.id
     JOIN quizzes q ON qa.quiz_id = q.id
     WHERE q.is_daily = 1 AND q.date_for = ?
     ORDER BY qa.score DESC, qa.time_taken_seconds ASC LIMIT ?`, [date || toD(), limit]);
  return r;
};

const getUserStats = async (userId) => {
  const [total] = await pool.query('SELECT COUNT(*) as c FROM quiz_attempts WHERE user_id = ?', [userId]);
  const [avgScore] = await pool.query('SELECT AVG(score/total_questions*100) as avg FROM quiz_attempts WHERE user_id = ?', [userId]);
  const [streak] = await pool.query(
    `SELECT COUNT(DISTINCT DATE(completed_at)) as days FROM quiz_attempts
     WHERE user_id = ? AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`, [userId]);
  const [best] = await pool.query('SELECT MAX(score/total_questions*100) as best FROM quiz_attempts WHERE user_id = ?', [userId]);
  const [weakTopics] = await pool.query(
    `SELECT q.topic, AVG(qa.score/qa.total_questions*100) as avg_pct, COUNT(*) as attempts
     FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id
     WHERE qa.user_id = ? AND q.topic IS NOT NULL
     GROUP BY q.topic HAVING avg_pct < 60 ORDER BY avg_pct ASC LIMIT 5`, [userId]);
  return {
    total_quizzes: total[0].c,
    avg_score_percent: parseFloat(avgScore[0].avg||0).toFixed(1),
    best_score_percent: parseFloat(best[0].best||0).toFixed(1),
    active_days_last_30: streak[0].days,
    weak_topics: weakTopics,
  };
};

module.exports = { getDaily, getByExam, getByTopic, getById, create, submitAttempt, getAttempt, getLeaderboard, getDailyLeaderboard, getUserStats };
