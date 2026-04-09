// LD Skills Controller — Skill Intelligence Engine
const skillsService = require('./ld-skills.service');

exports.createSkill = async (req, res) => {
  try {
    const orgId = req.params.orgId;
    const id = await skillsService.createSkill(orgId, req.body);
    res.status(201).json({ data: { id } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getSkills = async (req, res) => {
  try {
    const skills = await skillsService.getSkills(req.params.orgId, req.query);
    res.json({ data: skills });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.createRole = async (req, res) => {
  try {
    const id = await skillsService.createRole(req.params.orgId, req.body);
    res.status(201).json({ data: { id } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await skillsService.getRoles(req.params.orgId, req.query);
    res.json({ data: roles });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.mapRoleSkill = async (req, res) => {
  try {
    const { skill_id, required_proficiency, criticality_weight } = req.body;
    await skillsService.mapRoleSkill(req.params.orgId, req.params.roleId, skill_id, required_proficiency, criticality_weight);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getRoleSkills = async (req, res) => {
  try {
    const skills = await skillsService.getRoleSkills(req.params.roleId, req.params.orgId);
    res.json({ data: skills });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.extractSkillsFromJD = async (req, res) => {
  try {
    const skills = await skillsService.extractSkillsFromJD(req.params.orgId, req.body.jd_text);
    res.json({ data: skills });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.importCSV = async (req, res) => {
  try {
    const results = await skillsService.importSkillsFromCSV(req.params.orgId, req.body.rows);
    res.json({ data: results });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.selfAssess = async (req, res) => {
  try {
    await skillsService.submitSelfAssessment(req.user.id, req.params.orgId, req.body.ratings);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.managerRate = async (req, res) => {
  try {
    await skillsService.submitManagerRating(req.user.id, req.body.employee_id, req.params.orgId, req.body.ratings);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getGaps = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const gaps = await skillsService.getEmployeeGaps(userId, req.params.orgId);
    res.json({ data: gaps });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getHeatmap = async (req, res) => {
  try {
    const heatmap = await skillsService.getTeamGapHeatmap(req.params.orgId, req.query);
    res.json({ data: heatmap });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getOrgGapSummary = async (req, res) => {
  try {
    const summary = await skillsService.getOrgGapSummary(req.params.orgId);
    res.json({ data: summary });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const profile = await skillsService.getEmployeeProfile(userId, req.params.orgId);
    res.json({ data: profile });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getCareerRoadmap = async (req, res) => {
  try {
    const roadmap = await skillsService.generateCareerRoadmap(req.params.orgId, req.user.id, Number(req.params.targetRoleId));
    res.json({ data: roadmap });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
