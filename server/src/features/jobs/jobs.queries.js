const { pool } = require('../../database/connection');

const createJob = async (d) => {
  const [r] = await pool.query(
    `INSERT INTO jobs (posted_by, title, description, institute_name, job_type, subject,
     experience_required, salary_min, salary_max, salary_currency, salary_period,
     location, is_remote, is_urgent, expires_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [d.posted_by, d.title, d.description, d.institute_name||null, d.job_type,
     d.subject||null, d.experience_required||null, d.salary_min||null, d.salary_max||null,
     d.salary_currency||'INR', d.salary_period||'monthly', d.location||null,
     d.is_remote?1:0, d.is_urgent?1:0, d.expires_at||null]
  );
  return r.insertId;
};

const getJobById = async (id) => {
  const [rows] = await pool.query(
    `SELECT j.*, u.username, u.profile_photo_url, u.user_type, u.is_verified
     FROM jobs j JOIN users u ON j.posted_by = u.id WHERE j.id = ? AND j.is_active = 1`, [id]
  );
  return rows[0] || null;
};

const listJobs = async (filters, limit, offset) => {
  let where = 'j.is_active = 1';
  const vals = [];
  if (filters.job_type) { where += ' AND j.job_type = ?'; vals.push(filters.job_type); }
  if (filters.subject) { where += ' AND j.subject LIKE ?'; vals.push('%'+filters.subject+'%'); }
  if (filters.location) { where += ' AND j.location LIKE ?'; vals.push('%'+filters.location+'%'); }
  if (filters.is_remote !== undefined) { where += ' AND j.is_remote = ?'; vals.push(filters.is_remote?1:0); }
  const [rows] = await pool.query(
    `SELECT j.*, u.username, u.profile_photo_url, u.user_type FROM jobs j
     JOIN users u ON j.posted_by = u.id WHERE ${where}
     ORDER BY j.is_urgent DESC, j.created_at DESC LIMIT ? OFFSET ?`,
    [...vals, limit, offset]
  );
  const [cnt] = await pool.query(`SELECT COUNT(*) as total FROM jobs j WHERE ${where}`, vals);
  return { jobs: rows, total: cnt[0].total };
};

const updateJob = async (id, d) => {
  const allowed = ['title','description','job_type','subject','experience_required',
    'salary_min','salary_max','salary_period','location','is_remote','is_urgent','is_active','expires_at'];
  const updates = [], values = [];
  for (const [k,v] of Object.entries(d)) {
    if (allowed.includes(k) && v !== undefined) { updates.push(k+' = ?'); values.push(v); }
  }
  if (!updates.length) return;
  values.push(id);
  await pool.query('UPDATE jobs SET '+updates.join(', ')+' WHERE id = ?', values);
};

const deleteJob = async (id) => {
  await pool.query('UPDATE jobs SET is_active = 0 WHERE id = ?', [id]);
};

const applyToJob = async (jobId, applicantId, coverMessage, resumeUrl) => {
  const [r] = await pool.query(
    'INSERT INTO job_applications (job_id, applicant_id, cover_message, resume_url) VALUES (?,?,?,?)',
    [jobId, applicantId, coverMessage||null, resumeUrl||null]
  );
  await pool.query('UPDATE jobs SET application_count = application_count + 1 WHERE id = ?', [jobId]);
  return r.insertId;
};

const getApplication = async (jobId, applicantId) => {
  const [rows] = await pool.query(
    'SELECT * FROM job_applications WHERE job_id = ? AND applicant_id = ?', [jobId, applicantId]
  );
  return rows[0] || null;
};

const getJobApplications = async (jobId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT ja.*, u.username, u.profile_photo_url, u.user_type, u.city, u.state
     FROM job_applications ja JOIN users u ON ja.applicant_id = u.id
     WHERE ja.job_id = ? ORDER BY ja.created_at DESC LIMIT ? OFFSET ?`,
    [jobId, limit, offset]
  );
  return rows;
};

const getMyPostedJobs = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM jobs WHERE posted_by = ? ORDER BY created_at DESC', [userId]
  );
  return rows;
};

const getMyApplications = async (userId) => {
  const [rows] = await pool.query(
    `SELECT ja.*, j.title, j.institute_name, j.job_type, j.location, j.is_active as job_active
     FROM job_applications ja JOIN jobs j ON ja.job_id = j.id
     WHERE ja.applicant_id = ? ORDER BY ja.created_at DESC`, [userId]
  );
  return rows;
};

const updateApplicationStatus = async (applicationId, status) => {
  await pool.query(
    'UPDATE job_applications SET status = ?, status_updated_at = NOW() WHERE id = ?',
    [status, applicationId]
  );
};

module.exports = {
  createJob, getJobById, listJobs, updateJob, deleteJob,
  applyToJob, getApplication, getJobApplications, getMyPostedJobs, getMyApplications,
  updateApplicationStatus,
};
