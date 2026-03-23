const { pool } = require('../../database/connection');

const endorse = async (studentId, endorserId, skillName, note) => {
  const [r] = await pool.query(
    'INSERT INTO skill_endorsements (student_user_id, endorser_user_id, skill_name, endorsement_note) VALUES (?,?,?,?)',
    [studentId, endorserId, skillName, note||null]
  );
  return r.insertId;
};

const getEndorsement = async (studentId, endorserId, skillName) => {
  const [rows] = await pool.query(
    'SELECT * FROM skill_endorsements WHERE student_user_id = ? AND endorser_user_id = ? AND skill_name = ?',
    [studentId, endorserId, skillName]
  );
  return rows[0] || null;
};

const getUserEndorsements = async (userId) => {
  const [rows] = await pool.query(
    `SELECT se.*, u.username as endorser_username, u.profile_photo_url as endorser_photo, u.user_type as endorser_type
     FROM skill_endorsements se JOIN users u ON se.endorser_user_id = u.id
     WHERE se.student_user_id = ? ORDER BY se.created_at DESC`, [userId]
  );
  return rows;
};

const getEndorsementsBySkill = async (userId) => {
  const [rows] = await pool.query(
    `SELECT skill_name, COUNT(*) as endorsement_count,
            GROUP_CONCAT(DISTINCT u.username) as endorsed_by
     FROM skill_endorsements se JOIN users u ON se.endorser_user_id = u.id
     WHERE se.student_user_id = ? GROUP BY skill_name ORDER BY endorsement_count DESC`, [userId]
  );
  return rows;
};

const removeEndorsement = async (id, endorserId) => {
  const [r] = await pool.query(
    'DELETE FROM skill_endorsements WHERE id = ? AND endorser_user_id = ?', [id, endorserId]
  );
  return r.affectedRows > 0;
};

module.exports = { endorse, getEndorsement, getUserEndorsements, getEndorsementsBySkill, removeEndorsement };
