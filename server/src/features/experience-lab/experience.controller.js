const svc = require('./experience.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const getSectors = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getSectors()); });
const getProfessions = asyncHandler(async (req,res) => { const r = await svc.getProfessions({sector_id:req.query.sector_id,difficulty:req.query.difficulty,age_group:req.query.age_group,search:req.query.search},req.query); res.json({success:true,data:r.professions,pagination:r.pagination}); });
const getProfession = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getProfession(req.params.slug, req.user.id)); });
const getActivity = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getActivity(parseInt(req.params.activityId))); });
const startActivity = asyncHandler(async (req,res) => { sendSuccess(res, await svc.startActivity(req.user.id, parseInt(req.params.activityId))); });
const submitActivity = asyncHandler(async (req,res) => { sendSuccess(res, await svc.submitActivity(req.user.id, parseInt(req.params.activityId), req.body.submission_text, req.body.submission_url)); });
const getMyProgress = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getMyProgress(req.user.id)); });
const getProgressForProfession = asyncHandler(async (req,res) => { sendSuccess(res, await svc.getProgressForProfession(req.user.id, parseInt(req.params.professionId))); });
const createSector = asyncHandler(async (req,res) => { sendCreated(res, await svc.createSector(req.body)); });
const createProfession = asyncHandler(async (req,res) => { sendCreated(res, await svc.createProfession(req.body)); });
const createActivity = asyncHandler(async (req,res) => { sendCreated(res, await svc.createActivity(req.body)); });

module.exports = { getSectors, getProfessions, getProfession, getActivity, startActivity, submitActivity, getMyProgress, getProgressForProfession, createSector, createProfession, createActivity };
