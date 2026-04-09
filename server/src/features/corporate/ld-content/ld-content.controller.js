// LD Content Controller — AI Content Studio
const contentService = require('./ld-content.service');

exports.generateOutline = async (req, res) => {
  try {
    const outline = await contentService.generateCourseOutline(req.params.orgId, req.body);
    res.json({ data: outline });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.generateModuleContent = async (req, res) => {
  try {
    const content = await contentService.generateModuleContent(req.params.orgId, req.body);
    res.json({ data: { content } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.generateAssessment = async (req, res) => {
  try {
    const questions = await contentService.generateAssessment(req.params.orgId, req.body);
    res.json({ data: questions });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.generateMicrolearning = async (req, res) => {
  try {
    const card = await contentService.generateMicrolearning(req.params.orgId, req.body);
    res.json({ data: card });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createProgram = async (req, res) => {
  try {
    const id = await contentService.createProgram(req.params.orgId, req.user.id, req.body);
    res.status(201).json({ data: { id } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getPrograms = async (req, res) => {
  try {
    const programs = await contentService.getPrograms(req.params.orgId, req.query);
    res.json({ data: programs });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getProgram = async (req, res) => {
  try {
    const program = await contentService.getProgramById(req.params.programId, req.params.orgId);
    if (!program) return res.status(404).json({ error: 'Not found' });
    res.json({ data: program });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.saveModules = async (req, res) => {
  try {
    const ids = await contentService.saveModules(Number(req.params.programId), req.body.modules);
    res.json({ data: { module_ids: ids } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.saveAssessment = async (req, res) => {
  try {
    const id = await contentService.saveAssessment(Number(req.params.programId), req.body.module_id, req.body.questions, req.body.type);
    res.json({ data: { assessment_id: id } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.submitForReview = async (req, res) => {
  try {
    await contentService.submitForReview(req.params.orgId, req.body.content_type, req.body.content_id, req.body.reviewer_ids);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getReviewQueue = async (req, res) => {
  try {
    const items = await contentService.getReviewQueue(req.params.orgId, req.user.id);
    res.json({ data: items });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.submitReview = async (req, res) => {
  try {
    await contentService.submitReview(req.params.reviewId, req.body);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.runSafetyCheck = async (req, res) => {
  try {
    const result = await contentService.runSafetyChecks(req.body.content);
    res.json({ data: result });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
