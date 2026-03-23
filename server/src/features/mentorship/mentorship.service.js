const { ApiError } = require('../../utils/api-error');
const q = require('./mentorship.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const getMentors = async (filters, query) => { const {page,limit,offset}=getPagination(query); const {mentors,total}=await q.getMentors(filters,limit,offset); return {mentors,pagination:getPaginationMeta(total,page,limit)}; };
const getMentor = async (userId) => { const m = await q.getMentorById(userId); if (!m) throw ApiError.notFound('Mentor not found.'); return m; };
const setupProfile = async (userId, data) => { await q.createMentorProfile(userId, data); return { message: 'Mentor profile updated.' }; };

const apply = async (studentId, mentorId, professionId, message, goals) => {
  if (studentId === mentorId) throw ApiError.badRequest('Cannot mentor yourself.');
  const mentor = await q.getMentorById(mentorId);
  if (!mentor) throw ApiError.notFound('Mentor not found.');
  if (!mentor.is_accepting) throw ApiError.badRequest('Mentor is not accepting new mentees.');
  if (mentor.current_mentees >= mentor.max_mentees) throw ApiError.badRequest('Mentor has reached max mentees.');
  const id = await q.apply(studentId, mentorId, professionId, message, goals);
  return { id, message: 'Application submitted!' };
};

const getMyApplications = async (studentId) => q.getMyApplications(studentId);
const getMenteeApplications = async (mentorId) => q.getMenteeApplications(mentorId);

const updateApplication = async (applicationId, mentorId, status, note) => {
  const app = await q.getApplication(applicationId);
  if (!app) throw ApiError.notFound('Application not found.');
  if (app.mentor_id !== mentorId) throw ApiError.forbidden('Not your application.');
  await q.updateApplicationStatus(applicationId, status, note);
  return { message: 'Application ' + status };
};

const getMyMentees = async (mentorId) => q.getMyMentees(mentorId);
const getMyMentor = async (studentId) => q.getMyMentor(studentId);

const createSession = async (mentorId, data) => {
  const id = await q.createSession({ mentor_id: mentorId, ...data });
  return q.getSessionById(id);
};

const getSessions = async (userId) => q.getSessions(userId);
const updateSession = async (sessionId, userId, data) => {
  const s = await q.getSessionById(sessionId);
  if (!s) throw ApiError.notFound('Session not found.');
  if (s.mentor_id !== userId && s.student_id !== userId) throw ApiError.forbidden('Not your session.');
  await q.updateSession(sessionId, data);
  return q.getSessionById(sessionId);
};

module.exports = { getMentors, getMentor, setupProfile, apply, getMyApplications, getMenteeApplications, updateApplication, getMyMentees, getMyMentor, createSession, getSessions, updateSession };
