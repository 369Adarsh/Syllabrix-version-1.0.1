const { ApiError } = require('../../utils/api-error');
const { pool } = require('../../database/connection');
const queries = require('./safety.queries');

const block = async (userId, targetId) => {
  if (userId === targetId) throw ApiError.badRequest('You cannot block yourself.');
  const [users] = await pool.query('SELECT id FROM users WHERE id = ? AND is_active = 1', [targetId]);
  if (!users.length) throw ApiError.notFound('User not found.');
  const alreadyBlocked = await queries.isBlocked(userId, targetId);
  if (alreadyBlocked) throw ApiError.conflict('User is already blocked.');
  await queries.blockUser(userId, targetId);
  return { message: 'User blocked.' };
};

const unblock = async (userId, targetId) => {
  await queries.unblockUser(userId, targetId);
  return { message: 'User unblocked.' };
};

const getBlocked = async (userId) => queries.getBlockedUsers(userId);

const report = async (userId, data) => {
  await queries.createReport({ reporter_id: userId, ...data });
  return { message: 'Report submitted. Our team will review it.' };
};

const getMyReports = async (userId) => queries.getUserReports(userId);

module.exports = { block, unblock, getBlocked, report, getMyReports };
