const queries = require('./prep-categories.queries');
const { ApiError } = require('../../utils/api-error');
const { slugify } = require('../../../../shared/utils/slugify');
const getTree = async () => queries.getTree();
const getBySlug = async (slug) => { const c = await queries.getBySlug(slug); if (!c) throw ApiError.notFound('Category not found.'); return c; };
const create = async (data) => { const slug = data.slug || slugify(data.name); const id = await queries.create({ ...data, slug }); return { id, slug }; };
module.exports = { getTree, getBySlug, create };
