const { pool } = require('../../database/connection');

const linkChild = async (parentId, childId) => {
  const [r] = await pool.query(
    'INSERT INTO parent_child_links (parent_user_id, child_user_id, status) VALUES (?, ?, ?)',
    [parentId, childId, 'pending']
  );
  return r.insertId;
};

const getLink = async (parentId, childId) => {
  const [rows] = await pool.query(
    'SELECT * FROM parent_child_links WHERE parent_user_id = ? AND child_user_id = ?',
    [parentId, childId]
  );
  return rows[0] || null;
};

const approveLink = async (linkId) => {
  await pool.query(
    "UPDATE parent_child_links SET status = 'active', approved_at = NOW() WHERE id = ?", [linkId]
  );
};

const getChildren = async (parentId) => {
  const [rows] = await pool.query(
    `SELECT pcl.*, u.username, u.profile_photo_url, u.age_group, u.is_active,
            u.last_login_at, u.created_at as child_joined
     FROM parent_child_links pcl JOIN users u ON pcl.child_user_id = u.id
     WHERE pcl.parent_user_id = ? AND pcl.status = 'active'`, [parentId]
  );
  return rows;
};

const getChildActivity = async (childId, limit) => {
  const [posts] = await pool.query(
    'SELECT id, content, post_type, created_at FROM posts WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT ?',
    [childId, limit]
  );
  const [logins] = await pool.query(
    'SELECT created_at, device_info FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [childId, limit]
  );
  const [follows] = await pool.query(
    `SELECT f.created_at, u.username FROM follows f JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = ? ORDER BY f.created_at DESC LIMIT ?`, [childId, limit]
  );
  return { recent_posts: posts, recent_logins: logins, recent_follows: follows };
};

const removeLink = async (parentId, childId) => {
  await pool.query(
    'DELETE FROM parent_child_links WHERE parent_user_id = ? AND child_user_id = ?',
    [parentId, childId]
  );
};

const updateChildSettings = async (childId, settings) => {
  // Update the student profile's guardian settings
  const allowed = ['screen_time_limit_minutes', 'content_filter_level', 'weekly_report_enabled'];
  const updates = [], values = [];
  for (const [k,v] of Object.entries(settings)) {
    if (allowed.includes(k) && v !== undefined) { updates.push(k+' = ?'); values.push(v); }
  }
  if (!updates.length) return;
  // These are on parent_profiles but controlled per child — store on parent's profile for now
  // In production, create a per-child settings table
};

module.exports = { linkChild, getLink, approveLink, getChildren, getChildActivity, removeLink, updateChildSettings };
