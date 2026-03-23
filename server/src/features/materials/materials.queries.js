const { pool } = require('../../database/connection');

const create = async (d) => {
  const [r] = await pool.query(
    `INSERT INTO course_materials (uploaded_by, title, description, subject, material_type,
     file_url, file_type, file_size_bytes, target_class, target_board)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [d.uploaded_by, d.title, d.description||null, d.subject||null, d.material_type,
     d.file_url, d.file_type||null, d.file_size_bytes||null, d.target_class||null, d.target_board||null]
  );
  return r.insertId;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT cm.*, u.username, u.profile_photo_url, u.user_type
     FROM course_materials cm JOIN users u ON cm.uploaded_by = u.id
     WHERE cm.id = ? AND cm.is_active = 1`, [id]
  );
  return rows[0] || null;
};

const list = async (filters, limit, offset) => {
  let where = 'cm.is_active = 1';
  const vals = [];
  if (filters.subject) { where += ' AND cm.subject LIKE ?'; vals.push('%'+filters.subject+'%'); }
  if (filters.material_type) { where += ' AND cm.material_type = ?'; vals.push(filters.material_type); }
  if (filters.target_class) { where += ' AND cm.target_class = ?'; vals.push(filters.target_class); }
  if (filters.target_board) { where += ' AND cm.target_board = ?'; vals.push(filters.target_board); }
  if (filters.uploaded_by) { where += ' AND cm.uploaded_by = ?'; vals.push(filters.uploaded_by); }
  const [rows] = await pool.query(
    `SELECT cm.*, u.username, u.profile_photo_url FROM course_materials cm
     JOIN users u ON cm.uploaded_by = u.id WHERE ${where}
     ORDER BY cm.created_at DESC LIMIT ? OFFSET ?`, [...vals, limit, offset]
  );
  const [cnt] = await pool.query(`SELECT COUNT(*) as total FROM course_materials cm WHERE ${where}`, vals);
  return { materials: rows, total: cnt[0].total };
};

const remove = async (id) => { await pool.query('UPDATE course_materials SET is_active = 0 WHERE id = ?', [id]); };

const trackDownload = async (id) => {
  await pool.query('UPDATE course_materials SET download_count = download_count + 1 WHERE id = ?', [id]);
};

module.exports = { create, getById, list, remove, trackDownload };
