const { ApiError } = require('../../utils/api-error');
const { pool } = require('../../database/connection');
const queries = require('./ratings.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const rate = async (studentId, teacherId, rating, review, classId) => {
  if (studentId === teacherId) throw ApiError.badRequest('You cannot rate yourself.');
  const [users] = await pool.query('SELECT user_type FROM users WHERE id = ? AND is_active = 1', [teacherId]);
  if (!users.length) throw ApiError.notFound('Teacher not found.');
  if (users[0].user_type !== 'teacher' && users[0].user_type !== 'mentor') throw ApiError.badRequest('Can only rate teachers/mentors.');
  const existing = await queries.getExistingRating(teacherId, studentId);
  if (existing) throw ApiError.conflict('You already rated this teacher.');
  await queries.rateTeacher(teacherId, studentId, rating, review, classId);
  return { message: 'Rating submitted!' };
};

const getTeacherRatings = async (teacherId, query) => {
  const { page, limit, offset } = getPagination(query);
  const result = await queries.getTeacherRatings(teacherId, limit, offset);
  return { ...result, pagination: getPaginationMeta(result.total, page, limit) };
};

module.exports = { rate, getTeacherRatings };
