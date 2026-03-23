const { ApiError } = require('../../utils/api-error');
const q = require('./experience.queries');
const { slugify } = require('../../../../shared/utils/slugify');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const getSectors = async () => q.getSectors();
const getProfessions = async (filters, query) => { const {page,limit,offset} = getPagination(query); const {professions,total} = await q.getProfessions(filters,limit,offset); return {professions,pagination:getPaginationMeta(total,page,limit)}; };
const getProfession = async (slug, userId) => {
  const p = await q.getProfessionBySlug(slug); if (!p) throw ApiError.notFound('Profession not found.');
  const activities = await q.getActivities(p.id);
  let completedIds = [];
  if (userId) completedIds = await q.getCompletedActivityIds(userId, p.id);
  const enriched = activities.map(a => ({ ...a, is_completed: completedIds.includes(a.id) }));
  return { ...p, activities: enriched };
};
const getActivity = async (id) => { const a = await q.getActivityById(id); if (!a) throw ApiError.notFound('Activity not found.'); return a; };
const startActivity = async (userId, activityId) => { const a = await q.startActivity(userId, activityId); if (!a) throw ApiError.notFound('Activity not found.'); return a; };
const submitActivity = async (userId, activityId, text, url) => {
  const a = await q.getActivityById(activityId); if (!a) throw ApiError.notFound('Activity not found.');
  await q.submitActivity(userId, activityId, text, url, a.xp_reward);
  return { message: 'Activity completed!', xp_earned: a.xp_reward };
};
const getMyProgress = async (userId) => q.getUserProgress(userId);
const getProgressForProfession = async (userId, professionId) => q.getUserProgressForProfession(userId, professionId);
const createSector = async (d) => { d.slug = d.slug || slugify(d.name); const id = await q.createSector(d); return { id, slug: d.slug }; };
const createProfession = async (d) => { d.slug = d.slug || slugify(d.name); const id = await q.createProfession(d); return { id, slug: d.slug }; };
const createActivity = async (d) => { const id = await q.createActivity(d); return q.getActivityById(id); };

module.exports = { getSectors, getProfessions, getProfession, getActivity, startActivity, submitActivity, getMyProgress, getProgressForProfession, createSector, createProfession, createActivity };
