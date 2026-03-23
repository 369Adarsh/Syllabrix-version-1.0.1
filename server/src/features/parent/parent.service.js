const { ApiError } = require('../../utils/api-error');
const { pool } = require('../../database/connection');
const queries = require('./parent.queries');

const linkChild = async (parentId, childEmail) => {
  // Find child by email
  const [children] = await pool.query('SELECT id, user_type, age_group FROM users WHERE email = ?', [childEmail]);
  if (children.length === 0) throw ApiError.notFound('No account found with that email.');
  const child = children[0];
  if (child.user_type !== 'student') throw ApiError.badRequest('You can only link to student accounts.');

  const existing = await queries.getLink(parentId, child.id);
  if (existing) throw ApiError.conflict('Link already exists.');

  await queries.linkChild(parentId, child.id);
  // Auto-approve for now (in production, child receives approval request)
  const link = await queries.getLink(parentId, child.id);
  await queries.approveLink(link.id);

  return { message: 'Child linked successfully.', child_id: child.id };
};

const getChildren = async (parentId) => queries.getChildren(parentId);

const getChildActivity = async (parentId, childId) => {
  const link = await queries.getLink(parentId, childId);
  if (!link || link.status !== 'active') throw ApiError.forbidden('No active link with this child.');
  return queries.getChildActivity(childId, 20);
};

const removeLink = async (parentId, childId) => {
  const link = await queries.getLink(parentId, childId);
  if (!link) throw ApiError.notFound('Link not found.');
  await queries.removeLink(parentId, childId);
};

module.exports = { linkChild, getChildren, getChildActivity, removeLink };
