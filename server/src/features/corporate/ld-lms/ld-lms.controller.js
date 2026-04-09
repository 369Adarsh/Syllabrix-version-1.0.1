// LD LMS Controller — Learner Management
const lmsService = require('./ld-lms.service');

exports.enroll = async (req, res) => {
  try {
    const result = await lmsService.enrollUser(req.user.id, req.body.program_id, req.params.orgId, req.body);
    res.json({ data: result });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.bulkEnroll = async (req, res) => {
  try {
    const results = await lmsService.bulkEnroll(req.body.user_ids, req.body.program_id, req.params.orgId, req.body);
    res.json({ data: results });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getLearnerFeed = async (req, res) => {
  try {
    const feed = await lmsService.getLearnerFeed(req.user.id, req.params.orgId);
    res.json({ data: feed });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getEnrollmentDetails = async (req, res) => {
  try {
    const details = await lmsService.getEnrollmentDetails(req.user.id, req.params.enrollmentId, req.params.orgId);
    res.json({ data: details });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.chatWithCoach = async (req, res) => {
  try {
    const response = await lmsService.chatWithCoach(
      req.user.id,
      req.params.enrollmentId,
      req.params.moduleId,
      req.params.orgId,
      req.body.message,
      req.body.history
    );
    res.json({ data: response });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.startModule = async (req, res) => {
  try {
    await lmsService.startModule(req.params.enrollmentId, req.params.moduleId, req.params.orgId);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.completeModule = async (req, res) => {
  try {
    await lmsService.completeModule(req.params.enrollmentId, req.params.moduleId, req.params.orgId, req.body);
    const recommendation = await lmsService.getAdaptiveRecommendation(req.params.enrollmentId, req.params.moduleId, req.body.score || 0);
    res.json({ data: { success: true, recommendation } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.submitAssessment = async (req, res) => {
  try {
    const result = await lmsService.submitAssessment(req.user.id, req.params.assessmentId, req.body.answers);
    res.json({ data: result });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getLearnerStats = async (req, res) => {
  try {
    const stats = await lmsService.getLearnerStats(req.user.id, req.params.orgId);
    res.json({ data: stats });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getComplianceStatus = async (req, res) => {
  try {
    const report = await lmsService.getComplianceStatus(req.params.orgId);
    res.json({ data: report });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getReinforcements = async (req, res) => {
  try {
    const nuggets = await lmsService.getReinforcements(req.user.id, req.params.orgId);
    res.json({ data: nuggets });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.completeReinforcement = async (req, res) => {
  try {
    await lmsService.markReinforcementComplete(req.user.id, req.params.scheduleId);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
