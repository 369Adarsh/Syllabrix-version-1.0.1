const { pool } = require('../../database/connection');

const createGroup = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO user_groups (name, description, group_type, photo_url, creator_id)
     VALUES (?, ?, ?, ?, ?)`,
    [data.name, data.description || null, data.group_type || 'general',
     data.photo_url || null, data.creator_id]
  );
  return result.insertId;
};

const addMember = async (groupId, userId, role) => {
  await pool.query(
    'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
    [groupId, userId, role || 'member']
  );
  await pool.query('UPDATE user_groups SET member_count = member_count + 1 WHERE id = ?', [groupId]);
};

const removeMember = async (groupId, userId) => {
  const [result] = await pool.query(
    'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
    [groupId, userId]
  );
  if (result.affectedRows > 0) {
    await pool.query('UPDATE user_groups SET member_count = GREATEST(member_count - 1, 0) WHERE id = ?', [groupId]);
  }
  return result.affectedRows > 0;
};

const getGroupById = async (groupId) => {
  const [rows] = await pool.query(
    `SELECT g.*, u.username as creator_username, u.profile_photo_url as creator_photo
     FROM user_groups g JOIN users u ON g.creator_id = u.id
     WHERE g.id = ? AND g.is_active = 1`,
    [groupId]
  );
  return rows[0] || null;
};

const getUserGroups = async (userId) => {
  const [rows] = await pool.query(
    `SELECT g.*, gm.role as my_role, u.username as creator_username
     FROM group_members gm
     JOIN user_groups g ON gm.group_id = g.id
     JOIN users u ON g.creator_id = u.id
     WHERE gm.user_id = ? AND g.is_active = 1
     ORDER BY g.updated_at DESC`,
    [userId]
  );
  return rows;
};

const getGroupMembers = async (groupId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.profile_photo_url, u.user_type, u.is_verified,
            gm.role, gm.joined_at
     FROM group_members gm JOIN users u ON gm.user_id = u.id
     WHERE gm.group_id = ? AND u.is_active = 1
     ORDER BY FIELD(gm.role, 'admin', 'moderator', 'member'), gm.joined_at ASC
     LIMIT ? OFFSET ?`,
    [groupId, limit, offset]
  );
  return rows;
};

const getMemberRole = async (groupId, userId) => {
  const [rows] = await pool.query(
    'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
    [groupId, userId]
  );
  return rows[0]?.role || null;
};

const updateMemberRole = async (groupId, userId, newRole) => {
  await pool.query(
    'UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?',
    [newRole, groupId, userId]
  );
};

const updateGroup = async (groupId, data) => {
  const allowed = ['name', 'description', 'group_type', 'photo_url'];
  const updates = [];
  const values = [];
  for (const [key, value] of Object.entries(data)) {
    if (allowed.includes(key) && value !== undefined) {
      updates.push(key + ' = ?');
      values.push(value);
    }
  }
  if (updates.length === 0) return;
  values.push(groupId);
  await pool.query('UPDATE user_groups SET ' + updates.join(', ') + ' WHERE id = ?', values);
};

const deleteGroup = async (groupId) => {
  await pool.query('UPDATE user_groups SET is_active = 0 WHERE id = ?', [groupId]);
};

const sendGroupMessage = async (groupId, userId, content, mediaUrl, mediaType) => {
  const [result] = await pool.query(
    'INSERT INTO group_messages (group_id, user_id, content, media_url, media_type) VALUES (?, ?, ?, ?, ?)',
    [groupId, userId, content, mediaUrl || null, mediaType || 'none']
  );
  return result.insertId;
};

const getGroupMessageById = async (messageId) => {
  const [rows] = await pool.query(
    `SELECT gm.*, u.username, u.profile_photo_url, u.user_type
     FROM group_messages gm JOIN users u ON gm.user_id = u.id
     WHERE gm.id = ?`,
    [messageId]
  );
  return rows[0] || null;
};

const getGroupMessages = async (groupId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT gm.*, u.username, u.profile_photo_url, u.user_type
     FROM group_messages gm JOIN users u ON gm.user_id = u.id
     WHERE gm.group_id = ?
     ORDER BY gm.created_at DESC
     LIMIT ? OFFSET ?`,
    [groupId, limit, offset]
  );
  return rows.reverse();
};

const getGroupMessagesCount = async (groupId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM group_messages WHERE group_id = ?', [groupId]
  );
  return rows[0].total;
};

module.exports = {
  createGroup, addMember, removeMember, getGroupById, getUserGroups,
  getGroupMembers, getMemberRole, updateMemberRole, updateGroup, deleteGroup,
  sendGroupMessage, getGroupMessageById, getGroupMessages, getGroupMessagesCount,
};
