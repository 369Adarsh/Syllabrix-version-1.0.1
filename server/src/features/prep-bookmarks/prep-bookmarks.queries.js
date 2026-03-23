const { pool } = require('../../database/connection');
const add = async (userId, contentType, contentId, folder, notes) => {
  await pool.query('INSERT IGNORE INTO user_prep_bookmarks (user_id,content_type,content_id,folder_name,notes) VALUES (?,?,?,?,?)',
    [userId, contentType, contentId, folder||'General', notes||null]);
};
const remove = async (id, userId) => {
  await pool.query('DELETE FROM user_prep_bookmarks WHERE id = ? AND user_id = ?', [id, userId]);
};
const getAll = async (userId, folder) => {
  let where = 'user_id = ?'; const vals = [userId];
  if (folder) { where += ' AND folder_name = ?'; vals.push(folder); }
  const [r] = await pool.query('SELECT * FROM user_prep_bookmarks WHERE '+where+' ORDER BY created_at DESC', vals);
  return r;
};
const getFolders = async (userId) => {
  const [r] = await pool.query('SELECT folder_name, COUNT(*) as count FROM user_prep_bookmarks WHERE user_id = ? GROUP BY folder_name', [userId]);
  return r;
};
module.exports = { add, remove, getAll, getFolders };
