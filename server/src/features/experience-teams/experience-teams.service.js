const { ApiError } = require('../../utils/api-error');
const q = require('./experience-teams.queries');
const create = async (userId, data) => { const id = await q.create({...data, creator_id: userId}); await q.addMember(id, userId, 'Leader'); return q.getById(id); };
const getById = async (id) => { const t = await q.getById(id); if (!t) throw ApiError.notFound('Team not found.'); t.members = await q.getMembers(id); return t; };
const join = async (teamId, userId) => { const t = await q.getById(teamId); if (!t) throw ApiError.notFound('Team not found.'); if (t.member_count >= t.max_members) throw ApiError.badRequest('Team is full.'); await q.addMember(teamId, userId, 'Member'); return {message:'Joined team!'}; };
const leave = async (teamId, userId) => { await q.removeMember(teamId, userId); return {message:'Left team.'}; };
const assignRole = async (teamId, userId, role) => { await q.updateRole(teamId, userId, role); return {message:'Role updated.'}; };
module.exports = { create, getById, join, leave, assignRole };
