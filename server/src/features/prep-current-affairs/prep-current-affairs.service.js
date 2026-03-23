const q = require('./prep-current-affairs.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');
const getToday = async () => q.getToday();
const getByDate = async (date) => q.getByDate(date);
const getWeekly = async () => q.getWeekly();
const getMonthly = async (month) => q.getMonthly(month);
const getByCategory = async (cat, query) => {
  const { page, limit, offset } = getPagination(query);
  const { affairs, total } = await q.getByCategory(cat, limit, offset);
  return { affairs, pagination: getPaginationMeta(total, page, limit) };
};
const getById = async (id) => {
  const a = await q.getById(id);
  if (!a) throw require('../../utils/api-error').ApiError.notFound('Not found.');
  await q.incrementView(id);
  return a;
};
const create = async (data) => { const id = await q.create(data); return q.getById(id); };
module.exports = { getToday, getByDate, getWeekly, getMonthly, getByCategory, getById, create };
