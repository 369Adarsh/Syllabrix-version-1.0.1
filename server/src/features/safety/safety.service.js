const { ApiError } = require('../../utils/api-error');
const { pool } = require('../../database/connection');
const queries = require('./safety.queries');
const { emitToAdmins } = require('../../socket');

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
  const reportId = await queries.createReport({ reporter_id: userId, ...data });

  // Emit real-time alert to all connected admins
  try {
    const [users] = await pool.query(
      'SELECT username FROM users WHERE id = ? LIMIT 1', [userId]
    );
    let reportedUsername = null;
    if (data.reported_user_id) {
      const [reported] = await pool.query(
        'SELECT username FROM users WHERE id = ? LIMIT 1', [data.reported_user_id]
      );
      reportedUsername = reported[0]?.username || null;
    }
    emitToAdmins('admin:urgent_report', {
      id: reportId,
      reason: data.reason,
      reporter_id: userId,
      reporter_name: users[0]?.username || 'Unknown',
      reported_user_id: data.reported_user_id || null,
      reported_username: reportedUsername,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    // Non-blocking — alert failure must not break the report submission
  }

  return { message: 'Report submitted. Our team will review it.' };
};

const getMyReports = async (userId) => queries.getUserReports(userId);

module.exports = { block, unblock, getBlocked, report, getMyReports };
