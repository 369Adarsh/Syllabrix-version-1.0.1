const { pool } = require('../../database/connection');
const toMySQL = (d) => d ? new Date(d).toISOString().slice(0,19).replace('T',' ') : null;

const getMentors = async (filters, limit, offset) => {
  let where = 'mp.is_accepting = 1'; const vals = [];
  if (filters.expertise) { where += ' AND mp.expertise LIKE ?'; vals.push('%'+filters.expertise+'%'); }
  if (filters.is_verified) { where += ' AND mp.is_verified = 1'; }
  const [rows] = await pool.query(`SELECT mp.*, u.username, u.profile_photo_url, u.is_verified as user_verified FROM mentor_profiles mp JOIN users u ON mp.user_id = u.id WHERE ${where} AND u.is_active = 1 ORDER BY mp.rating DESC, mp.total_sessions DESC LIMIT ? OFFSET ?`, [...vals, limit, offset]);
  const [cnt] = await pool.query(`SELECT COUNT(*) as total FROM mentor_profiles mp JOIN users u ON mp.user_id = u.id WHERE ${where} AND u.is_active = 1`, vals);
  return { mentors: rows, total: cnt[0].total };
};

const getMentorById = async (userId) => {
  const [r] = await pool.query('SELECT mp.*, u.username, u.profile_photo_url, u.bio, u.city, u.state FROM mentor_profiles mp JOIN users u ON mp.user_id = u.id WHERE mp.user_id = ?', [userId]);
  return r[0]||null;
};

const createMentorProfile = async (userId, d) => {
  await pool.query('INSERT INTO mentor_profiles (user_id,expertise,company,designation,linkedin_url,bio,max_mentees) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE expertise=VALUES(expertise),company=VALUES(company),designation=VALUES(designation),bio=VALUES(bio)',
    [userId, d.expertise?JSON.stringify(d.expertise):null, d.company||null, d.designation||null, d.linkedin_url||null, d.bio||null, d.max_mentees||5]);
};

const apply = async (studentId, mentorId, professionId, message, goals) => {
  const [r] = await pool.query('INSERT INTO mentorship_applications (student_id,mentor_id,profession_id,message,goals) VALUES (?,?,?,?,?)',
    [studentId, mentorId, professionId||null, message, goals||null]);
  return r.insertId;
};

const getApplication = async (id) => {
  const [r] = await pool.query('SELECT ma.*, u1.username as student_name, u1.profile_photo_url as student_photo, u2.username as mentor_name FROM mentorship_applications ma JOIN users u1 ON ma.student_id = u1.id JOIN users u2 ON ma.mentor_id = u2.id WHERE ma.id = ?', [id]);
  return r[0]||null;
};

const getMyApplications = async (studentId) => {
  const [r] = await pool.query('SELECT ma.*, u.username as mentor_name, u.profile_photo_url as mentor_photo, mp.company, mp.designation FROM mentorship_applications ma JOIN users u ON ma.mentor_id = u.id LEFT JOIN mentor_profiles mp ON ma.mentor_id = mp.user_id WHERE ma.student_id = ? ORDER BY ma.created_at DESC', [studentId]);
  return r;
};

const getMenteeApplications = async (mentorId) => {
  const [r] = await pool.query('SELECT ma.*, u.username as student_name, u.profile_photo_url as student_photo FROM mentorship_applications ma JOIN users u ON ma.student_id = u.id WHERE ma.mentor_id = ? ORDER BY ma.created_at DESC', [mentorId]);
  return r;
};

const updateApplicationStatus = async (id, status, note) => {
  await pool.query('UPDATE mentorship_applications SET status = ?, mentor_note = ?, status_updated_at = NOW() WHERE id = ?', [status, note||null, id]);
  if (status === 'accepted') {
    const app = await getApplication(id);
    if (app) await pool.query('UPDATE mentor_profiles SET current_mentees = current_mentees + 1 WHERE user_id = ?', [app.mentor_id]);
  }
};

const getMyMentees = async (mentorId) => {
  const [r] = await pool.query("SELECT ma.*, u.username, u.profile_photo_url, u.age_group FROM mentorship_applications ma JOIN users u ON ma.student_id = u.id WHERE ma.mentor_id = ? AND ma.status = 'accepted' ORDER BY ma.status_updated_at DESC", [mentorId]);
  return r;
};

const getMyMentor = async (studentId) => {
  const [r] = await pool.query("SELECT ma.*, u.username as mentor_name, u.profile_photo_url as mentor_photo, mp.company, mp.designation, mp.expertise FROM mentorship_applications ma JOIN users u ON ma.mentor_id = u.id LEFT JOIN mentor_profiles mp ON ma.mentor_id = mp.user_id WHERE ma.student_id = ? AND ma.status = 'accepted' LIMIT 1", [studentId]);
  return r[0]||null;
};

const createSession = async (d) => {
  const [r] = await pool.query('INSERT INTO mentorship_sessions (mentor_id,student_id,application_id,title,scheduled_at,duration_minutes) VALUES (?,?,?,?,?,?)',
    [d.mentor_id, d.student_id, d.application_id||null, d.title, toMySQL(d.scheduled_at), d.duration_minutes||30]);
  return r.insertId;
};

const getSessions = async (userId) => {
  const [r] = await pool.query('SELECT ms.*, u1.username as mentor_name, u2.username as student_name FROM mentorship_sessions ms JOIN users u1 ON ms.mentor_id = u1.id JOIN users u2 ON ms.student_id = u2.id WHERE ms.mentor_id = ? OR ms.student_id = ? ORDER BY ms.scheduled_at DESC', [userId, userId]);
  return r;
};

const getSessionById = async (id) => { const [r] = await pool.query('SELECT * FROM mentorship_sessions WHERE id = ?', [id]); return r[0]||null; };

const updateSession = async (id, d) => {
  const allowed = ['status','mentor_notes','student_notes','student_feedback','student_rating'];
  const ups = [], vals = [];
  for (const [k,v] of Object.entries(d)) { if (allowed.includes(k) && v !== undefined) { ups.push(k+' = ?'); vals.push(v); } }
  if (!ups.length) return; vals.push(id);
  await pool.query('UPDATE mentorship_sessions SET '+ups.join(', ')+' WHERE id = ?', vals);
  if (d.status === 'completed') {
    const s = await getSessionById(id);
    if (s) await pool.query('UPDATE mentor_profiles SET total_sessions = total_sessions + 1 WHERE user_id = ?', [s.mentor_id]);
  }
};

module.exports = { getMentors, getMentorById, createMentorProfile, apply, getApplication, getMyApplications, getMenteeApplications, updateApplicationStatus, getMyMentees, getMyMentor, createSession, getSessions, getSessionById, updateSession };
