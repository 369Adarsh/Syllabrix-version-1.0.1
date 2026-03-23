const { ApiError } = require('../../utils/api-error');
const queries = require('./jobs.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const create = async (userId, data) => {
  const jobId = await queries.createJob({ posted_by: userId, ...data });
  return queries.getJobById(jobId);
};

const list = async (filters, query) => {
  const { page, limit, offset } = getPagination(query);
  const { jobs, total } = await queries.listJobs(filters, limit, offset);
  return { jobs, pagination: getPaginationMeta(total, page, limit) };
};

const getById = async (id) => {
  const job = await queries.getJobById(id);
  if (!job) throw ApiError.notFound('Job not found.');
  return job;
};

const update = async (id, userId, data) => {
  const job = await queries.getJobById(id);
  if (!job) throw ApiError.notFound('Job not found.');
  if (job.posted_by !== userId) throw ApiError.forbidden('You can only edit your own jobs.');
  await queries.updateJob(id, data);
  return queries.getJobById(id);
};

const remove = async (id, userId) => {
  const job = await queries.getJobById(id);
  if (!job) throw ApiError.notFound('Job not found.');
  if (job.posted_by !== userId) throw ApiError.forbidden('You can only delete your own jobs.');
  await queries.deleteJob(id);
};

const apply = async (jobId, userId, coverMessage, resumeUrl) => {
  const job = await queries.getJobById(jobId);
  if (!job) throw ApiError.notFound('Job not found.');
  const existing = await queries.getApplication(jobId, userId);
  if (existing) throw ApiError.conflict('You have already applied.');
  if (job.posted_by === userId) throw ApiError.badRequest('You cannot apply to your own job.');
  await queries.applyToJob(jobId, userId, coverMessage, resumeUrl);
  return { message: 'Application submitted!' };
};

const getApplications = async (jobId, userId, query) => {
  const job = await queries.getJobById(jobId);
  if (!job) throw ApiError.notFound('Job not found.');
  if (job.posted_by !== userId) throw ApiError.forbidden('Only the job poster can view applications.');
  const { limit, offset } = getPagination(query);
  return queries.getJobApplications(jobId, limit, offset);
};

const updateApplicationStatus = async (jobId, applicationId, userId, status) => {
  const job = await queries.getJobById(jobId);
  if (!job) throw ApiError.notFound('Job not found.');
  if (job.posted_by !== userId) throw ApiError.forbidden('Only the job poster can update status.');
  await queries.updateApplicationStatus(applicationId, status);
};

const getMyPosts = async (userId) => queries.getMyPostedJobs(userId);
const getMyApps = async (userId) => queries.getMyApplications(userId);

module.exports = { create, list, getById, update, remove, apply, getApplications, updateApplicationStatus, getMyPosts, getMyApps };
