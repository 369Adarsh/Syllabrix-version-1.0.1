const { pool } = require('../../database/connection');
const toD = (d) => d ? new Date(d).toISOString().slice(0,10) : new Date().toISOString().slice(0,10);

const getToday = async () => {
  const [r] = await pool.query('SELECT * FROM current_affairs WHERE date = CURDATE() AND is_published = 1 ORDER BY importance_level DESC, id ASC');
  return r;
};
const getByDate = async (date) => {
  const [r] = await pool.query('SELECT * FROM current_affairs WHERE date = ? AND is_published = 1 ORDER BY importance_level DESC', [date]);
  return r;
};
const getWeekly = async () => {
  const [r] = await pool.query("SELECT * FROM current_affairs WHERE affair_type = 'weekly' AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND is_published = 1 ORDER BY date DESC");
  return r;
};
const getMonthly = async (month) => {
  const [r] = await pool.query("SELECT * FROM current_affairs WHERE affair_type IN ('daily','monthly') AND DATE_FORMAT(date, '%Y-%m') = ? AND is_published = 1 ORDER BY date DESC, importance_level DESC", [month]);
  return r;
};
const getByCategory = async (category, limit, offset) => {
  const [rows] = await pool.query('SELECT * FROM current_affairs WHERE category = ? AND is_published = 1 ORDER BY date DESC LIMIT ? OFFSET ?', [category, limit, offset]);
  const [cnt] = await pool.query('SELECT COUNT(*) as total FROM current_affairs WHERE category = ? AND is_published = 1', [category]);
  return { affairs: rows, total: cnt[0].total };
};
const create = async (d) => {
  const [r] = await pool.query(
    'INSERT INTO current_affairs (date,affair_type,category,title,content_points,source_urls,mind_map_data,quiz_questions,importance_level,relevant_exams) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [toD(d.date), d.affair_type||'daily', d.category, d.title, JSON.stringify(d.content_points),
     d.source_urls?JSON.stringify(d.source_urls):null, d.mind_map_data?JSON.stringify(d.mind_map_data):null,
     d.quiz_questions?JSON.stringify(d.quiz_questions):null, d.importance_level||'medium',
     d.relevant_exams?JSON.stringify(d.relevant_exams):null]
  );
  return r.insertId;
};
const incrementView = async (id) => { await pool.query('UPDATE current_affairs SET view_count = view_count + 1 WHERE id = ?', [id]); };
const getById = async (id) => { const [r] = await pool.query('SELECT * FROM current_affairs WHERE id = ?', [id]); return r[0]||null; };
module.exports = { getToday, getByDate, getWeekly, getMonthly, getByCategory, create, incrementView, getById };
