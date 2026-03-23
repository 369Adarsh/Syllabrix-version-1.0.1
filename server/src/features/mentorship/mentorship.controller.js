const svc = require('./mentorship.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const getMentors = asyncHandler(async (req,res) => { const r = await svc.getMentors({expertise:req.query.expertise,is_verified:req.query.verified},req.query); res.json({success:true,data:r.mentors,pagination:r.pagination}); });
const getMentor = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getMentor(parseInt(req.params.mentorId))); });
const setupProfile = asyncHandler(async (req,res) => { sendSuccess(res, await svc.setupProfile(req.user.id, req.body)); });
const apply = asyncHandler(async (req,res) => { sendCreated(res, await svc.apply(req.user.id, parseInt(req.body.mentor_id), req.body.profession_id, req.body.message, req.body.goals)); });
const getMyApplications = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getMyApplications(req.user.id)); });
const getMenteeApplications = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getMenteeApplications(req.user.id)); });
const updateApplication = asyncHandler(async (req,res) => { sendSuccess(res, await svc.updateApplication(parseInt(req.params.applicationId), req.user.id, req.body.status, req.body.note)); });
const getMyMentees = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getMyMentees(req.user.id)); });
const getMyMentor = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getMyMentor(req.user.id)); });
const createSession = asyncHandler(async (req,res) => { sendCreated(res, await svc.createSession(req.user.id, req.body)); });
const getSessions = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getSessions(req.user.id)); });
const updateSession = asyncHandler(async (req,res) => { sendSuccess(res, await svc.updateSession(parseInt(req.params.sessionId), req.user.id, req.body)); });

module.exports = { getMentors, getMentor, setupProfile, apply, getMyApplications, getMenteeApplications, updateApplication, getMyMentees, getMyMentor, createSession, getSessions, updateSession };
