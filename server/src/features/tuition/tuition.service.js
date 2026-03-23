const { ApiError } = require('../../utils/api-error');
const queries = require('./tuition.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const create = async (userId, data) => {
  const id = await queries.createAd({ user_id: userId, ...data });
  return queries.getAdById(id);
};
const list = async (filters, query) => {
  const { page, limit, offset } = getPagination(query);
  const { ads, total } = await queries.listAds(filters, limit, offset);
  return { ads, pagination: getPaginationMeta(total, page, limit) };
};
const getById = async (id) => {
  const ad = await queries.getAdById(id);
  if (!ad) throw ApiError.notFound('Tuition ad not found.');
  return ad;
};
const update = async (id, userId, data) => {
  const ad = await queries.getAdById(id);
  if (!ad) throw ApiError.notFound('Ad not found.');
  if (ad.user_id !== userId) throw ApiError.forbidden('You can only edit your own ads.');
  await queries.updateAd(id, data);
  return queries.getAdById(id);
};
const remove = async (id, userId) => {
  const ad = await queries.getAdById(id);
  if (!ad) throw ApiError.notFound('Ad not found.');
  if (ad.user_id !== userId) throw ApiError.forbidden('You can only delete your own ads.');
  await queries.deleteAd(id);
};
const getMyAds = async (userId) => queries.getMyAds(userId);

module.exports = { create, list, getById, update, remove, getMyAds };
