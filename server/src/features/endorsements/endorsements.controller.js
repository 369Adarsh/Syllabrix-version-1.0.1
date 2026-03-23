const svc = require('./endorsements.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const endorse = asyncHandler(async (req, res) => {
  sendCreated(res, await svc.endorse(req.user.id, parseInt(req.params.userId), req.body.skill_name, req.body.note));
});
const getUserEndorsements = asyncHandler(async (req, res) => {
  sendSuccess(res, await svc.getUserEndorsements(parseInt(req.params.userId)));
});
const getBySkill = asyncHandler(async (req, res) => {
  sendSuccess(res, await svc.getBySkill(parseInt(req.params.userId)));
});
const remove = asyncHandler(async (req, res) => {
  await svc.remove(parseInt(req.params.endorsementId), req.user.id);
  sendSuccess(res, null, 'Endorsement removed.');
});

module.exports = { endorse, getUserEndorsements, getBySkill, remove };
