const { pool } = require('../../database/connection');

const logModeration = async (d) => {
  await pool.query('INSERT INTO content_moderation_log (content_type,content_id,user_id,original_text,action_taken,reason,flagged_words,moderator_id) VALUES (?,?,?,?,?,?,?,?)',
    [d.content_type,d.content_id,d.user_id,d.original_text||null,d.action_taken,d.reason||null,d.flagged_words?JSON.stringify(d.flagged_words):null,d.moderator_id||null]);
};

const getLogs = async (filters, limit, offset) => {
  let where = '1=1'; const vals = [];
  if (filters.user_id) { where += ' AND cml.user_id = ?'; vals.push(filters.user_id); }
  if (filters.action) { where += ' AND cml.action_taken = ?'; vals.push(filters.action); }
  if (filters.content_type) { where += ' AND cml.content_type = ?'; vals.push(filters.content_type); }
  const [rows] = await pool.query(`SELECT cml.*, u.username FROM content_moderation_log cml JOIN users u ON cml.user_id = u.id WHERE ${where} ORDER BY cml.created_at DESC LIMIT ? OFFSET ?`, [...vals, limit, offset]);
  return rows;
};

const getUserStrikes = async (userId) => {
  const [r] = await pool.query("SELECT COUNT(*) as strikes FROM content_moderation_log WHERE user_id = ? AND action_taken IN ('warning_sent','removed')", [userId]);
  return r[0].strikes;
};

const logActivity = async (userId, actionType, entityType, entityId, metadata, ip) => {
  await pool.query('INSERT INTO activity_log (user_id,action_type,entity_type,entity_id,metadata,ip_address) VALUES (?,?,?,?,?,?)',
    [userId, actionType, entityType||null, entityId||null, metadata?JSON.stringify(metadata):null, ip||null]);
};

const getActivityLog = async (userId, limit) => {
  const [r] = await pool.query('SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit]);
  return r;
};

const updateStreak = async (userId) => {
  const today = new Date().toISOString().slice(0,10);
  const [existing] = await pool.query('SELECT * FROM user_streaks WHERE user_id = ?', [userId]);
  if (!existing.length) {
    await pool.query('INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date) VALUES (?,1,1,?)', [userId, today]);
    return;
  }
  const s = existing[0];
  const lastDate = s.last_active_date ? new Date(s.last_active_date).toISOString().slice(0,10) : null;
  if (lastDate === today) return; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  const newStreak = lastDate === yesterday ? s.current_streak + 1 : 1;
  const longest = Math.max(newStreak, s.longest_streak);
  await pool.query('UPDATE user_streaks SET current_streak = ?, longest_streak = ?, last_active_date = ? WHERE user_id = ?', [newStreak, longest, today, userId]);
};

const getStreak = async (userId) => {
  const [r] = await pool.query('SELECT * FROM user_streaks WHERE user_id = ?', [userId]);
  return r[0] || { current_streak: 0, longest_streak: 0 };
};

module.exports = { logModeration, getLogs, getUserStrikes, logActivity, getActivityLog, updateStreak, getStreak };
