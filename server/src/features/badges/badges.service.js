const q = require('./badges.queries');
const getAll = async () => q.getAll();
const getUserBadges = async (userId) => q.getUserBadges(userId);
const award = async (userId, badgeId) => { await q.awardBadge(userId, badgeId); return { message: 'Badge awarded!' }; };
const create = async (d) => { const id = await q.createBadge(d); return q.getById(id); };
module.exports = { getAll, getUserBadges, award, create };
