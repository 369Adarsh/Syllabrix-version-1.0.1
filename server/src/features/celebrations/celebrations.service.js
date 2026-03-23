const q = require('./celebrations.queries');
const { getPagination } = require('../../utils/pagination');
const triggerCelebration = async (data) => { await q.create(data); };
const getFeed = async (query) => { const {limit,offset} = getPagination(query); return q.getFeed(limit, offset); };
const getUserCelebrations = async (userId) => q.getUserCelebrations(userId);
module.exports = { triggerCelebration, getFeed, getUserCelebrations };
