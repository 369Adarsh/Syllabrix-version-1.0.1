const { ApiError } = require('../../utils/api-error');
const queries = require('./live-classes.queries');
const { emitToUser } = require('../../socket/index');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');
const { createNotification } = require('../notifications/notifications.service');

const crypto = require('crypto');

const create = async (hostId, data) => {
  const roomId = data.room_id || crypto.randomUUID().slice(0, 13).replace(/-/g, '');
  const classId = await queries.createClass({ host_id: hostId, room_id: roomId, ...data });
  return queries.getClassById(classId);
};

const list = async (filters, query) => {
  const { page, limit, offset } = getPagination(query);
  const { classes, total } = await queries.listClasses(filters, limit, offset);
  return { classes, pagination: getPaginationMeta(total, page, limit) };
};

const getById = async (id) => {
  const cls = await queries.getClassById(id);
  if (!cls) throw ApiError.notFound('Class not found.');
  return cls;
};

const update = async (id, hostId, data) => {
  const cls = await queries.getClassById(id);
  if (!cls) throw ApiError.notFound('Class not found.');
  if (cls.host_id !== hostId) throw ApiError.forbidden('Only the host can update.');
  await queries.updateClass(id, data);
  return queries.getClassById(id);
};

const cancel = async (id, hostId) => {
  const cls = await queries.getClassById(id);
  if (!cls) throw ApiError.notFound('Class not found.');
  if (cls.host_id !== hostId) throw ApiError.forbidden('Only the host can cancel.');
  await queries.deleteClass(id);
};

const startClass = async (id, hostId) => {
  const cls = await queries.getClassById(id);
  if (!cls) throw ApiError.notFound('Class not found.');
  if (cls.host_id !== hostId) throw ApiError.forbidden('Only the host can start.');
  if (cls.status !== 'scheduled') throw ApiError.badRequest('Class is not in scheduled state.');
  await queries.updateClass(id, { status: 'live', started_at: new Date().toISOString().slice(0,19).replace('T',' ') });
  // Notify all attendees that class is live
  const attendees = await queries.getAttendees(id);
  for (const a of attendees) {
    createNotification({
      user_id: a.user_id, type: 'live_class', actor_id: hostId,
      reference_id: id, reference_type: 'live_class',
      message: `"${cls.title}" is now LIVE! Join now →`,
    }).catch(() => {});
  }
  return queries.getClassById(id);
};

const endClass = async (id, hostId) => {
  const cls = await queries.getClassById(id);
  if (!cls) throw ApiError.notFound('Class not found.');
  if (cls.host_id !== hostId) throw ApiError.forbidden('Only the host can end.');
  if (cls.status !== 'live') throw ApiError.badRequest('Class is not live.');
  await queries.updateClass(id, { status: 'ended', ended_at: new Date().toISOString().slice(0,19).replace('T',' ') });
  return queries.getClassById(id);
};

const join = async (classId, userId) => {
  const cls = await queries.getClassById(classId);
  if (!cls) throw ApiError.notFound('Class not found.');
  if (cls.status === 'ended' || cls.status === 'cancelled') throw ApiError.badRequest('Class is no longer available.');
  const already = await queries.isAttending(classId, userId);
  if (already) throw ApiError.conflict('Already joined.');
  if (cls.attendee_count >= cls.max_students) throw ApiError.badRequest('Class is full.');
  await queries.joinClass(classId, userId);
  return { message: 'Joined class!' };
};

const leave = async (classId, userId) => {
  await queries.leaveClass(classId, userId);
  return { message: 'Left class.' };
};

const getAttendees = async (classId) => queries.getAttendees(classId);
const getMyClasses = async (hostId) => queries.getMyClasses(hostId);
const getMyAttended = async (userId) => queries.getMyAttendedClasses(userId);

module.exports = { create, list, getById, update, cancel, startClass, endClass, join, leave, getAttendees, getMyClasses, getMyAttended };
