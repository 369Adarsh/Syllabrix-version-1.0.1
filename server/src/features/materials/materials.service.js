const { ApiError } = require('../../utils/api-error');
const queries = require('./materials.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const create = async (userId, data) => {
  const id = await queries.create({ uploaded_by: userId, ...data });
  return queries.getById(id);
};
const list = async (filters, query) => {
  const { page, limit, offset } = getPagination(query);
  const { materials, total } = await queries.list(filters, limit, offset);
  return { materials, pagination: getPaginationMeta(total, page, limit) };
};
const getById = async (id) => {
  const m = await queries.getById(id);
  if (!m) throw ApiError.notFound('Material not found.');
  return m;
};
const remove = async (id, userId) => {
  const m = await queries.getById(id);
  if (!m) throw ApiError.notFound('Material not found.');
  if (m.uploaded_by !== userId) throw ApiError.forbidden('Only the uploader can delete.');
  await queries.remove(id);
};
const download = async (id) => {
  const m = await queries.getById(id);
  if (!m) throw ApiError.notFound('Material not found.');
  await queries.trackDownload(id);
  return { file_url: m.file_url, title: m.title };
};

module.exports = { create, list, getById, remove, download };
