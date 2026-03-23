const svc = require('./ai-experience.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const getAISectors = asyncHandler(async (req, res) => {
  sendSuccess(res, await svc.getAISectors());
});

const exploreProfession = asyncHandler(async (req, res) => {
  const { profession } = req.query;
  if (!profession) return res.status(400).json({ success: false, message: 'Profession required' });
  sendSuccess(res, await svc.exploreProfession(profession));
});

const generateChallenge = asyncHandler(async (req, res) => {
  const { profession, level } = req.body;
  if (!profession) return res.status(400).json({ success: false, message: 'Profession required' });
  sendSuccess(res, await svc.generateChallenge(profession, level));
});

const getProfessionalComms = asyncHandler(async (req, res) => {
  const { profession } = req.query;
  if (!profession) return res.status(400).json({ success: false, message: 'Profession required' });
  sendSuccess(res, await svc.getProfessionalComms(profession));
});

module.exports = { getAISectors, exploreProfession, generateChallenge, getProfessionalComms };
