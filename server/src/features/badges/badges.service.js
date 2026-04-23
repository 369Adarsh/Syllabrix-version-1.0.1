const q = require('./badges.queries');
const { createNotification } = require('../notifications/notifications.service');

const getAll = async () => q.getAll();
const getUserBadges = async (userId) => q.getUserBadges(userId);

const award = async (userId, badgeId) => {
  await q.awardBadge(userId, badgeId);
  const badge = await q.getById(badgeId);
  createNotification({
    user_id: userId, type: 'achievement', actor_id: null,
    reference_id: badgeId, reference_type: 'achievement',
    message: `You earned the "${badge?.name || 'new'}" badge ${badge?.icon_emoji || '🏆'} Keep it up!`,
  }).catch(() => {});
  return { message: 'Badge awarded!' };
};

const create = async (d) => { const id = await q.createBadge(d); return q.getById(id); };
module.exports = { getAll, getUserBadges, award, create };
