const { ApiError } = require('../../utils/api-error');
const q = require('./prep-syllabus.queries');
const getTopic = async (id) => { const t = await q.getWithChildren(id); if (!t) throw ApiError.notFound('Topic not found.'); return t; };
const create = async (d) => { const id = await q.create(d); return q.getById(id); };
const update = async (id, d) => { if (!(await q.getById(id))) throw ApiError.notFound('Topic not found.'); await q.update(id, d); return q.getById(id); };
const getProgress = async (userId, examId) => {
  const p = await q.getUserProgress(userId, examId);
  const total = p.length, done = p.filter(x => x.status==='completed').length;
  return { progress: p, stats: { total, completed: done, percent: total ? Math.round((done/total)*100) : 0 } };
};
const updateProgress = async (userId, syllabusId, status) => { await q.updateProgress(userId, syllabusId, status); return { message: 'Progress updated.' }; };
module.exports = { getTopic, create, update, getProgress, updateProgress };
