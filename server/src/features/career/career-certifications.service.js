// Career Certifications Service
// CRUD for professional certifications a user holds (AWS, Google, PMP, etc.)

const { pool } = require('../../database/connection');

// ── List ──────────────────────────────────────────────────────────────────────
exports.list = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, title, issuer, issue_date, expiry_date,
            credential_id, verification_url, badge_url, is_featured, created_at
     FROM career_certifications
     WHERE user_id = ?
     ORDER BY is_featured DESC, issue_date DESC`,
    [req.user.id]
  );
  return res.json({ success: true, data: rows });
};

// ── Add ───────────────────────────────────────────────────────────────────────
exports.add = async (req, res) => {
  const { title, issuer, issue_date, expiry_date, credential_id, verification_url, badge_url, is_featured } = req.body;

  if (!title || !issuer) {
    return res.status(400).json({ success: false, message: 'title and issuer are required.' });
  }

  const [result] = await pool.query(
    `INSERT INTO career_certifications
       (user_id, title, issuer, issue_date, expiry_date, credential_id, verification_url, badge_url, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id, title, issuer,
      issue_date || null, expiry_date || null,
      credential_id || null, verification_url || null,
      badge_url || null, is_featured ? 1 : 0
    ]
  );

  const [[row]] = await pool.query('SELECT * FROM career_certifications WHERE id = ?', [result.insertId]);
  return res.status(201).json({ success: true, data: row });
};

// ── Update ────────────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  const { id } = req.params;
  const [[existing]] = await pool.query(
    'SELECT id FROM career_certifications WHERE id = ? AND user_id = ?', [id, req.user.id]
  );
  if (!existing) return res.status(404).json({ success: false, message: 'Certification not found.' });

  const { title, issuer, issue_date, expiry_date, credential_id, verification_url, badge_url, is_featured } = req.body;
  await pool.query(
    `UPDATE career_certifications
     SET title = ?, issuer = ?, issue_date = ?, expiry_date = ?,
         credential_id = ?, verification_url = ?, badge_url = ?, is_featured = ?
     WHERE id = ?`,
    [
      title, issuer,
      issue_date || null, expiry_date || null,
      credential_id || null, verification_url || null,
      badge_url || null, is_featured ? 1 : 0,
      id
    ]
  );

  const [[row]] = await pool.query('SELECT * FROM career_certifications WHERE id = ?', [id]);
  return res.json({ success: true, data: row });
};

// ── Delete ────────────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query(
    'DELETE FROM career_certifications WHERE id = ? AND user_id = ?', [id, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Certification not found.' });
  return res.json({ success: true, message: 'Certification removed.' });
};
