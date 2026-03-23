const { pool } = require('../../database/connection');

const getSectors = async () => { const [r] = await pool.query('SELECT * FROM profession_sectors WHERE is_active = 1 ORDER BY display_order'); return r; };

const getSectorBySlug = async (slug) => { const [r] = await pool.query('SELECT * FROM profession_sectors WHERE slug = ? AND is_active = 1', [slug]); return r[0]||null; };

const getProfessions = async (filters, limit, offset) => {
  let where = 'p.is_active = 1'; const vals = [];
  if (filters.sector_id) { where += ' AND p.sector_id = ?'; vals.push(filters.sector_id); }
  if (filters.difficulty) { where += ' AND p.difficulty = ?'; vals.push(filters.difficulty); }
  if (filters.age_group) { where += ' AND p.age_group_min = ?'; vals.push(filters.age_group); }
  if (filters.search) { where += ' AND (p.name LIKE ? OR p.description LIKE ?)'; vals.push('%'+filters.search+'%','%'+filters.search+'%'); }
  const [rows] = await pool.query(`SELECT p.*, ps.name as sector_name FROM professions p JOIN profession_sectors ps ON p.sector_id = ps.id WHERE ${where} ORDER BY p.participant_count DESC LIMIT ? OFFSET ?`, [...vals, limit, offset]);
  const [cnt] = await pool.query(`SELECT COUNT(*) as total FROM professions p WHERE ${where}`, vals);
  return { professions: rows, total: cnt[0].total };
};

const getProfessionBySlug = async (slug) => { const [r] = await pool.query('SELECT p.*, ps.name as sector_name, ps.slug as sector_slug FROM professions p JOIN profession_sectors ps ON p.sector_id = ps.id WHERE p.slug = ? AND p.is_active = 1', [slug]); return r[0]||null; };
const getProfessionById = async (id) => { const [r] = await pool.query('SELECT * FROM professions WHERE id = ?', [id]); return r[0]||null; };

const getActivities = async (professionId) => { const [r] = await pool.query('SELECT * FROM experience_activities WHERE profession_id = ? AND is_active = 1 ORDER BY sequence_order', [professionId]); return r; };
const getActivityById = async (id) => { const [r] = await pool.query('SELECT ea.*, p.name as profession_name, p.slug as profession_slug FROM experience_activities ea JOIN professions p ON ea.profession_id = p.id WHERE ea.id = ?', [id]); return r[0]||null; };

const startActivity = async (userId, activityId) => {
  const act = await getActivityById(activityId);
  if (!act) return null;
  // Ensure progress record exists
  await pool.query('INSERT IGNORE INTO user_experience_progress (user_id, profession_id) VALUES (?,?)', [userId, act.profession_id]);
  return act;
};

const submitActivity = async (userId, activityId, text, url, xp) => {
  const [r] = await pool.query('INSERT INTO activity_completions (user_id, activity_id, submission_text, submission_url, xp_earned) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE submission_text=VALUES(submission_text), submission_url=VALUES(submission_url)', [userId, activityId, text||null, url||null, xp]);
  // Update counters
  const act = await getActivityById(activityId);
  if (act) {
    await pool.query('UPDATE experience_activities SET completion_count = completion_count + 1 WHERE id = ?', [activityId]);
    await pool.query('UPDATE user_experience_progress SET activities_completed = activities_completed + 1, total_xp = total_xp + ?, last_activity_at = NOW() WHERE user_id = ? AND profession_id = ?', [xp, userId, act.profession_id]);
    // Check stage upgrade
    const [prog] = await pool.query('SELECT activities_completed FROM user_experience_progress WHERE user_id = ? AND profession_id = ?', [userId, act.profession_id]);
    if (prog[0]) {
      const c = prog[0].activities_completed;
      let stage = 'explorer';
      if (c >= 30) stage = 'dedicated';
      else if (c >= 15) stage = 'enthusiast';
      else if (c >= 5) stage = 'explorer';
      await pool.query('UPDATE user_experience_progress SET stage = ? WHERE user_id = ? AND profession_id = ?', [stage, userId, act.profession_id]);
    }
  }
  return r.insertId;
};

const getUserProgress = async (userId) => { const [r] = await pool.query('SELECT uep.*, p.name, p.slug, p.icon_emoji, ps.name as sector_name FROM user_experience_progress uep JOIN professions p ON uep.profession_id = p.id JOIN profession_sectors ps ON p.sector_id = ps.id WHERE uep.user_id = ? ORDER BY uep.last_activity_at DESC', [userId]); return r; };
const getUserProgressForProfession = async (userId, professionId) => {
  const [prog] = await pool.query('SELECT * FROM user_experience_progress WHERE user_id = ? AND profession_id = ?', [userId, professionId]);
  const [completions] = await pool.query('SELECT ac.*, ea.title as activity_title FROM activity_completions ac JOIN experience_activities ea ON ac.activity_id = ea.id WHERE ac.user_id = ? AND ea.profession_id = ?', [userId, professionId]);
  return { progress: prog[0]||null, completions };
};

const getCompletedActivityIds = async (userId, professionId) => {
  const [r] = await pool.query('SELECT ac.activity_id FROM activity_completions ac JOIN experience_activities ea ON ac.activity_id = ea.id WHERE ac.user_id = ? AND ea.profession_id = ?', [userId, professionId]);
  return r.map(x => x.activity_id);
};

const createSector = async (d) => { const [r] = await pool.query('INSERT INTO profession_sectors (name,slug,icon_emoji,description,display_order) VALUES (?,?,?,?,?)', [d.name,d.slug,d.icon_emoji||null,d.description||null,d.display_order||0]); return r.insertId; };
const createProfession = async (d) => {
  const [r] = await pool.query('INSERT INTO professions (sector_id,name,slug,description,day_in_life,tools_used,skills_required,age_group_min,difficulty,icon_emoji) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [d.sector_id,d.name,d.slug,d.description||null,d.day_in_life||null,d.tools_used?JSON.stringify(d.tools_used):null,d.skills_required?JSON.stringify(d.skills_required):null,d.age_group_min||'8-10',d.difficulty||'beginner',d.icon_emoji||null]);
  await pool.query('UPDATE profession_sectors SET profession_count = profession_count + 1 WHERE id = ?', [d.sector_id]);
  return r.insertId;
};
const createActivity = async (d) => {
  const [r] = await pool.query('INSERT INTO experience_activities (profession_id,title,description,instructions,activity_type,difficulty_level,age_group_min,estimated_minutes,xp_reward,tool_type,sequence_order,is_team_activity) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    [d.profession_id,d.title,d.description,d.instructions,d.activity_type,d.difficulty_level||'easy',d.age_group_min||'8-10',d.estimated_minutes||30,d.xp_reward||10,d.tool_type||null,d.sequence_order||0,d.is_team_activity?1:0]);
  await pool.query('UPDATE professions SET activity_count = activity_count + 1 WHERE id = ?', [d.profession_id]);
  return r.insertId;
};

module.exports = { getSectors, getSectorBySlug, getProfessions, getProfessionBySlug, getProfessionById, getActivities, getActivityById, startActivity, submitActivity, getUserProgress, getUserProgressForProfession, getCompletedActivityIds, createSector, createProfession, createActivity };
