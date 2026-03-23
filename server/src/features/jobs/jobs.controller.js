const svc = require('./jobs.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const create = asyncHandler(async (req, res) => { sendCreated(res, await svc.create(req.user.id, req.body), 'Job posted!'); });
const list = asyncHandler(async (req, res) => {
  const { job_type, subject, location, is_remote } = req.query;
  const result = await svc.list({ job_type, subject, location, is_remote }, req.query);
  res.json({ success: true, data: result.jobs, pagination: result.pagination });
});
const getById = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getById(parseInt(req.params.jobId))); });
const update = asyncHandler(async (req, res) => { sendSuccess(res, await svc.update(parseInt(req.params.jobId), req.user.id, req.body), 'Job updated!'); });
const remove = asyncHandler(async (req, res) => { await svc.remove(parseInt(req.params.jobId), req.user.id); sendSuccess(res, null, 'Job deleted.'); });
const apply = asyncHandler(async (req, res) => { sendCreated(res, await svc.apply(parseInt(req.params.jobId), req.user.id, req.body.cover_message, req.body.resume_url)); });
const getApplications = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getApplications(parseInt(req.params.jobId), req.user.id, req.query)); });
const updateAppStatus = asyncHandler(async (req, res) => {
  await svc.updateApplicationStatus(parseInt(req.params.jobId), parseInt(req.params.applicationId), req.user.id, req.body.status);
  sendSuccess(res, null, 'Status updated.');
});
const getMyPosts = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getMyPosts(req.user.id)); });
const getMyApps = asyncHandler(async (req, res) => { sendSuccess(res, await svc.getMyApps(req.user.id)); });

module.exports = { create, list, getById, update, remove, apply, getApplications, updateAppStatus, getMyPosts, getMyApps };
