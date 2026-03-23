const { pool } = require('../../database/connection');
const getAll = async () => { const [r] = await pool.query('SELECT * FROM exam_categories WHERE is_active = 1 ORDER BY display_order, name'); return r; };
const getTree = async () => {
  const [rows] = await pool.query('SELECT * FROM exam_categories WHERE is_active = 1 ORDER BY display_order, name');
  const map = {}; const tree = [];
  rows.forEach(r => { map[r.id] = { ...r, children: [] }; });
  rows.forEach(r => { if (r.parent_id && map[r.parent_id]) map[r.parent_id].children.push(map[r.id]); else tree.push(map[r.id]); });
  return tree;
};
const getBySlug = async (slug) => {
  const [rows] = await pool.query('SELECT * FROM exam_categories WHERE slug = ? AND is_active = 1', [slug]);
  if (!rows[0]) return null;
  const [children] = await pool.query('SELECT * FROM exam_categories WHERE parent_id = ? AND is_active = 1 ORDER BY display_order', [rows[0].id]);
  const [exams] = await pool.query('SELECT id,name,slug,conducting_body,logo_url,subscriber_count FROM exams WHERE category_id = ? AND is_active = 1', [rows[0].id]);
  return { ...rows[0], children, exams };
};
const create = async (d) => {
  const [r] = await pool.query('INSERT INTO exam_categories (name,slug,parent_id,level,icon_emoji,description,display_order) VALUES (?,?,?,?,?,?,?)',
    [d.name, d.slug, d.parent_id||null, d.level||0, d.icon_emoji||null, d.description||null, d.display_order||0]);
  return r.insertId;
};
module.exports = { getAll, getTree, getBySlug, create };
