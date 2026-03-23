const { ApiError } = require('../../utils/api-error');
const { pool } = require('../../database/connection');
const queries = require('./endorsements.queries');

const endorse = async (endorserId, studentId, skillName, note) => {
  if (endorserId === studentId) throw ApiError.badRequest('You cannot endorse yourself.');
  // Verify student exists
  const [users] = await pool.query('SELECT id, user_type FROM users WHERE id = ? AND is_active = 1', [studentId]);
  if (!users.length) throw ApiError.notFound('Student not found.');
  if (users[0].user_type !== 'student') throw ApiError.badRequest('Can only endorse students.');
  // Check not already endorsed this skill
  const existing = await queries.getEndorsement(studentId, endorserId, skillName);
  if (existing) throw ApiError.conflict('You already endorsed this skill.');
  await queries.endorse(studentId, endorserId, skillName, note);
  return { message: 'Skill endorsed!' };
};

const getUserEndorsements = async (userId) => queries.getUserEndorsements(userId);
const getBySkill = async (userId) => queries.getEndorsementsBySkill(userId);

const remove = async (id, endorserId) => {
  const success = await queries.removeEndorsement(id, endorserId);
  if (!success) throw ApiError.notFound('Endorsement not found.');
};

module.exports = { endorse, getUserEndorsements, getBySkill, remove };
