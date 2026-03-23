const { pool } = require('../../database/connection');
const create = async (d) => { const [r] = await pool.query('INSERT INTO celebrations (user_id,celebration_type,title,description,reference_id,reference_type) VALUES (?,?,?,?,?,?)', [d.user_id,d.celebration_type,d.title,d.description||null,d.reference_id||null,d.reference_type||null]); return r.insertId; };
const getFeed = async (limit, offset) => { const [r] = await pool.query('SELECT c.*, u.username, u.profile_photo_url FROM celebrations c JOIN users u ON c.user_id = u.id WHERE c.is_public = 1 ORDER BY c.created_at DESC LIMIT ? OFFSET ?', [limit, offset]); return r; };
const getUserCelebrations = async (userId) => { const [r] = await pool.query('SELECT * FROM celebrations WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]); return r; };
module.exports = { create, getFeed, getUserCelebrations };
