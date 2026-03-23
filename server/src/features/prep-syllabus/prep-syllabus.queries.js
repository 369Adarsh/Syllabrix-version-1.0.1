const { pool } = require('../../database/connection');
const getById = async (id) => { const [r] = await pool.query('SELECT * FROM exam_syllabus WHERE id = ? AND is_active = 1', [id]); return r[0]||null; };
const getWithChildren = async (id) => {
  const t = await getById(id); if (!t) return null;
  const [ch] = await pool.query('SELECT * FROM exam_syllabus WHERE parent_id = ? AND is_active = 1 ORDER BY display_order', [id]);
  return { ...t, children: ch };
};
const create = async (d) => {
  const [r] = await pool.query('INSERT INTO exam_syllabus (exam_id,parent_id,level,title,slug,description,explanation_text,weightage_percent,difficulty,recommended_books,mind_map_data,key_points,display_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [d.exam_id,d.parent_id||null,d.level||'topic',d.title,d.slug||null,d.description||null,d.explanation_text||null,d.weightage_percent||null,d.difficulty||null,d.recommended_books?JSON.stringify(d.recommended_books):null,d.mind_map_data?JSON.stringify(d.mind_map_data):null,d.key_points?JSON.stringify(d.key_points):null,d.display_order||0]);
  return r.insertId;
};
const update = async (id, d) => {
  const allowed = ['title','description','explanation_text','weightage_percent','difficulty','recommended_books','mind_map_url','mind_map_data','key_points'];
  const ups = [], vals = [];
  for (const [k,v] of Object.entries(d)) { if (allowed.includes(k) && v !== undefined) { ups.push(k+' = ?'); vals.push(['recommended_books','mind_map_data','key_points'].includes(k)?JSON.stringify(v):v); } }
  if (!ups.length) return; vals.push(id);
  await pool.query('UPDATE exam_syllabus SET '+ups.join(', ')+' WHERE id = ?', vals);
};
const getUserProgress = async (userId, examId) => {
  const [r] = await pool.query('SELECT es.id,es.title,es.level,es.parent_id,es.display_order,COALESCE(usp.status,"not_started") as status,usp.completed_at FROM exam_syllabus es LEFT JOIN user_syllabus_progress usp ON es.id = usp.syllabus_id AND usp.user_id = ? WHERE es.exam_id = ? AND es.is_active = 1 ORDER BY es.display_order', [userId, examId]);
  return r;
};
const updateProgress = async (userId, syllabusId, status) => {
  const ca = status === 'completed' ? new Date().toISOString().slice(0,19).replace('T',' ') : null;
  await pool.query('INSERT INTO user_syllabus_progress (user_id,syllabus_id,status,completed_at) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE status = VALUES(status), completed_at = VALUES(completed_at)', [userId, syllabusId, status, ca]);
};
module.exports = { getById, getWithChildren, create, update, getUserProgress, updateProgress };
