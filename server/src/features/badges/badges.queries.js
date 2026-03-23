const { pool } = require('../../database/connection');
const getAll = async () => { const [r] = await pool.query('SELECT * FROM badges WHERE is_active = 1 ORDER BY badge_type, name'); return r; };
const getById = async (id) => { const [r] = await pool.query('SELECT * FROM badges WHERE id = ?', [id]); return r[0]||null; };
const getUserBadges = async (userId) => { const [r] = await pool.query('SELECT ub.*, b.name, b.slug, b.description, b.icon_emoji, b.badge_type, b.category FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = ? ORDER BY ub.earned_at DESC', [userId]); return r; };
const awardBadge = async (userId, badgeId) => { await pool.query('INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?,?)', [userId, badgeId]); };
const createBadge = async (d) => { const [r] = await pool.query('INSERT INTO badges (name,slug,description,icon_emoji,badge_type,category,xp_required) VALUES (?,?,?,?,?,?,?)', [d.name,d.slug,d.description,d.icon_emoji||null,d.badge_type||'experience',d.category||null,d.xp_required||null]); return r.insertId; };
module.exports = { getAll, getById, getUserBadges, awardBadge, createBadge };
