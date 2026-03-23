const { pool } = require('../../database/connection');
const list = async (filters, limit, offset) => {
  let where = 'e.is_active = 1'; const vals = [];
  if (filters.category_id) { where += ' AND e.category_id = ?'; vals.push(filters.category_id); }
  if (filters.search) { where += ' AND (e.name LIKE ? OR e.full_name LIKE ?)'; vals.push('%'+filters.search+'%','%'+filters.search+'%'); }
  const [rows] = await pool.query(`SELECT e.*, ec.name as category_name FROM exams e JOIN exam_categories ec ON e.category_id = ec.id WHERE ${where} ORDER BY e.subscriber_count DESC LIMIT ? OFFSET ?`, [...vals, limit, offset]);
  const [cnt] = await pool.query(`SELECT COUNT(*) as total FROM exams e WHERE ${where}`, vals);
  return { exams: rows, total: cnt[0].total };
};
const getBySlug = async (slug) => {
  const [rows] = await pool.query('SELECT e.*, ec.name as category_name, ec.slug as category_slug FROM exams e JOIN exam_categories ec ON e.category_id = ec.id WHERE e.slug = ? AND e.is_active = 1', [slug]);
  return rows[0] || null;
};
const getById = async (id) => { const [r] = await pool.query('SELECT * FROM exams WHERE id = ?', [id]); return r[0]||null; };
const getDates = async (examId) => { const [r] = await pool.query('SELECT * FROM exam_dates WHERE exam_id = ? ORDER BY event_date ASC', [examId]); return r; };
const getSyllabus = async (examId) => {
  const [rows] = await pool.query('SELECT * FROM exam_syllabus WHERE exam_id = ? AND is_active = 1 ORDER BY display_order', [examId]);
  const map = {}; const tree = [];
  rows.forEach(r => { map[r.id] = { ...r, children: [] }; });
  rows.forEach(r => { if (r.parent_id && map[r.parent_id]) map[r.parent_id].children.push(map[r.id]); else tree.push(map[r.id]); });
  return tree;
};
const create = async (d) => {
  const [r] = await pool.query('INSERT INTO exams (category_id,name,slug,full_name,conducting_body,description,eligibility,exam_pattern,frequency,official_website,logo_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [d.category_id,d.name,d.slug,d.full_name||null,d.conducting_body||null,d.description||null,d.eligibility||null,d.exam_pattern?JSON.stringify(d.exam_pattern):null,d.frequency||'yearly',d.official_website||null,d.logo_url||null]);
  return r.insertId;
};
const addDate = async (d) => {
  const toD = (dt) => dt ? new Date(dt).toISOString().slice(0,10) : null;
  const [r] = await pool.query('INSERT INTO exam_dates (exam_id,event_type,event_name,event_date,event_details,is_tentative,source_url) VALUES (?,?,?,?,?,?,?)',
    [d.exam_id,d.event_type,d.event_name,toD(d.event_date),d.event_details||null,d.is_tentative?1:0,d.source_url||null]);
  return r.insertId;
};
const subscribe = async (userId, examId, targetYear) => {
  await pool.query('INSERT IGNORE INTO user_exam_selections (user_id,exam_id,target_year) VALUES (?,?,?)', [userId,examId,targetYear||null]);
  await pool.query('UPDATE exams SET subscriber_count = subscriber_count + 1 WHERE id = ?', [examId]);
};
const unsubscribe = async (userId, examId) => {
  const [r] = await pool.query('DELETE FROM user_exam_selections WHERE user_id = ? AND exam_id = ?', [userId,examId]);
  if (r.affectedRows > 0) await pool.query('UPDATE exams SET subscriber_count = GREATEST(subscriber_count-1,0) WHERE id = ?', [examId]);
};
const getUserExams = async (userId) => {
  const [r] = await pool.query('SELECT ues.*,e.name,e.slug,e.conducting_body,e.logo_url,ec.name as category_name FROM user_exam_selections ues JOIN exams e ON ues.exam_id = e.id JOIN exam_categories ec ON e.category_id = ec.id WHERE ues.user_id = ? AND ues.is_active = 1', [userId]);
  return r;
};
module.exports = { list, getBySlug, getById, getDates, getSyllabus, create, addDate, subscribe, unsubscribe, getUserExams };
