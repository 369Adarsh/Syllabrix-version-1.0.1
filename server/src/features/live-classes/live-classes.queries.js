const { pool } = require('../../database/connection');

const toMySQLDate = (isoDate) => {
  if (!isoDate) return null;
  return new Date(isoDate).toISOString().slice(0, 19).replace('T', ' ');
};

const createClass = async (d) => {
  const [r] = await pool.query(
    `INSERT INTO live_classes (host_id, title, description, subject, class_type, price,
     currency, max_students, scheduled_at, duration_minutes, room_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [d.host_id, d.title, d.description||null, d.subject||null, d.class_type||'free',
     d.price||null, d.currency||'INR', d.max_students||100, toMySQLDate(d.scheduled_at),
     d.duration_minutes||60, d.room_id||null]
  );
  return r.insertId;
};

const getClassById = async (id) => {
  const [rows] = await pool.query(
    `SELECT lc.*, u.username as host_username, u.profile_photo_url as host_photo,
            u.user_type as host_type, u.is_verified as host_verified,
            (SELECT COUNT(*) FROM live_class_attendees WHERE class_id = lc.id) as attendee_count
     FROM live_classes lc JOIN users u ON lc.host_id = u.id WHERE lc.id = ?`, [id]
  );
  return rows[0] || null;
};

const listClasses = async (filters, limit, offset) => {
  let where = '1=1';
  const vals = [];
  if (filters.status) { where += ' AND lc.status = ?'; vals.push(filters.status); }
  if (filters.subject) { where += ' AND lc.subject LIKE ?'; vals.push('%'+filters.subject+'%'); }
  if (filters.host_id) { where += ' AND lc.host_id = ?'; vals.push(filters.host_id); }
  if (filters.class_type) { where += ' AND lc.class_type = ?'; vals.push(filters.class_type); }
  if (filters.upcoming) { where += ' AND lc.scheduled_at > NOW() AND lc.status = "scheduled"'; }
  const [rows] = await pool.query(
    `SELECT lc.*, u.username as host_username, u.profile_photo_url as host_photo, u.is_verified as host_verified,
            (SELECT COUNT(*) FROM live_class_attendees WHERE class_id = lc.id) as attendee_count
     FROM live_classes lc JOIN users u ON lc.host_id = u.id
     WHERE ${where} ORDER BY lc.scheduled_at ASC LIMIT ? OFFSET ?`,
    [...vals, limit, offset]
  );
  const [cnt] = await pool.query(`SELECT COUNT(*) as total FROM live_classes lc WHERE ${where}`, vals);
  return { classes: rows, total: cnt[0].total };
};

const updateClass = async (id, d) => {
  const allowed = ['title','description','subject','class_type','price','max_students',
    'scheduled_at','duration_minutes','status','started_at','ended_at','recording_url','room_id'];
  const updates = [], values = [];
  for (const [k,v] of Object.entries(d)) {
    if (allowed.includes(k) && v !== undefined) {
      updates.push(k+' = ?');
      values.push(['scheduled_at','started_at','ended_at'].includes(k) ? toMySQLDate(v) : v);
    }
  }
  if (!updates.length) return;
  values.push(id);
  await pool.query('UPDATE live_classes SET '+updates.join(', ')+' WHERE id = ?', values);
};

const deleteClass = async (id) => {
  await pool.query("UPDATE live_classes SET status = 'cancelled' WHERE id = ?", [id]);
};

const joinClass = async (classId, userId) => {
  await pool.query('INSERT INTO live_class_attendees (class_id, user_id) VALUES (?, ?)', [classId, userId]);
  await pool.query('UPDATE live_classes SET viewer_count = viewer_count + 1 WHERE id = ?', [classId]);
};

const leaveClass = async (classId, userId) => {
  await pool.query(
    'UPDATE live_class_attendees SET left_at = NOW(), duration_seconds = TIMESTAMPDIFF(SECOND, joined_at, NOW()) WHERE class_id = ? AND user_id = ? AND left_at IS NULL',
    [classId, userId]
  );
};

const getAttendees = async (classId) => {
  const [rows] = await pool.query(
    `SELECT lca.*, u.username, u.profile_photo_url, u.user_type
     FROM live_class_attendees lca JOIN users u ON lca.user_id = u.id
     WHERE lca.class_id = ? ORDER BY lca.joined_at ASC`, [classId]
  );
  return rows;
};

const isAttending = async (classId, userId) => {
  const [rows] = await pool.query(
    'SELECT id FROM live_class_attendees WHERE class_id = ? AND user_id = ? AND left_at IS NULL', [classId, userId]
  );
  return rows.length > 0;
};

const getMyClasses = async (hostId) => {
  const [rows] = await pool.query(
    `SELECT lc.*, (SELECT COUNT(*) FROM live_class_attendees WHERE class_id = lc.id) as attendee_count
     FROM live_classes lc WHERE lc.host_id = ? ORDER BY lc.scheduled_at DESC`, [hostId]
  );
  return rows;
};

const getMyAttendedClasses = async (userId) => {
  const [rows] = await pool.query(
    `SELECT lc.*, u.username as host_username, u.profile_photo_url as host_photo,
            lca.joined_at, lca.duration_seconds
     FROM live_class_attendees lca JOIN live_classes lc ON lca.class_id = lc.id
     JOIN users u ON lc.host_id = u.id
     WHERE lca.user_id = ? ORDER BY lca.joined_at DESC`, [userId]
  );
  return rows;
};

module.exports = {
  createClass, getClassById, listClasses, updateClass, deleteClass,
  joinClass, leaveClass, getAttendees, isAttending,
  getMyClasses, getMyAttendedClasses,
};
