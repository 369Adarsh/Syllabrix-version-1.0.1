const { pool } = require('../../database/connection');

const createAd = async (d) => {
  const [r] = await pool.query(
    `INSERT INTO tuition_ads (user_id, ad_type, title, description, subject,
     class_range, location, is_online, budget_min, budget_max, budget_period)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [d.user_id, d.ad_type, d.title, d.description||null, d.subject,
     d.class_range||null, d.location||null, d.is_online?1:0,
     d.budget_min||null, d.budget_max||null, d.budget_period||'monthly']
  );
  return r.insertId;
};

const getAdById = async (id) => {
  const [rows] = await pool.query(
    `SELECT t.*, u.username, u.profile_photo_url, u.user_type, u.city, u.state
     FROM tuition_ads t JOIN users u ON t.user_id = u.id WHERE t.id = ? AND t.is_active = 1`, [id]
  );
  return rows[0] || null;
};

const listAds = async (filters, limit, offset) => {
  let where = 't.is_active = 1';
  const vals = [];
  if (filters.ad_type) { where += ' AND t.ad_type = ?'; vals.push(filters.ad_type); }
  if (filters.subject) { where += ' AND t.subject LIKE ?'; vals.push('%'+filters.subject+'%'); }
  if (filters.location) { where += ' AND t.location LIKE ?'; vals.push('%'+filters.location+'%'); }
  if (filters.is_online !== undefined) { where += ' AND t.is_online = ?'; vals.push(filters.is_online?1:0); }
  const [rows] = await pool.query(
    `SELECT t.*, u.username, u.profile_photo_url, u.user_type FROM tuition_ads t
     JOIN users u ON t.user_id = u.id WHERE ${where}
     ORDER BY t.created_at DESC LIMIT ? OFFSET ?`, [...vals, limit, offset]
  );
  const [cnt] = await pool.query(`SELECT COUNT(*) as total FROM tuition_ads t WHERE ${where}`, vals);
  return { ads: rows, total: cnt[0].total };
};

const updateAd = async (id, d) => {
  const allowed = ['title','description','subject','class_range','location','is_online','budget_min','budget_max','budget_period','is_active'];
  const updates = [], values = [];
  for (const [k,v] of Object.entries(d)) {
    if (allowed.includes(k) && v !== undefined) { updates.push(k+' = ?'); values.push(v); }
  }
  if (!updates.length) return;
  values.push(id);
  await pool.query('UPDATE tuition_ads SET '+updates.join(', ')+' WHERE id = ?', values);
};

const deleteAd = async (id) => { await pool.query('UPDATE tuition_ads SET is_active = 0 WHERE id = ?', [id]); };

const getMyAds = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM tuition_ads WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows;
};

module.exports = { createAd, getAdById, listAds, updateAd, deleteAd, getMyAds };
