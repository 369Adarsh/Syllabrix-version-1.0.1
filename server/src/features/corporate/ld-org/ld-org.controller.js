// LD Org Controller
const orgService = require('./ld-org.service');
const bootstrapService = require('./ld-bootstrap.service');

exports.createOrg = async (req, res) => {
  try {
    const { name, slug, industry, size_band } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });
    const existing = await orgService.getOrgBySlug(slug);
    if (existing) return res.status(409).json({ error: 'Organization slug already taken' });
    const org = await orgService.createOrg({ name, slug, industry, size_band, created_by: req.user.id });
    res.status(201).json({ data: org });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getMyOrgs = async (req, res) => {
  try {
    const orgs = await orgService.getUserOrgs(req.user.id);
    res.json({ data: orgs });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getOrg = async (req, res) => {
  try {
    const org = await orgService.getOrgById(req.params.orgId);
    if (!org) return res.status(404).json({ error: 'Not found' });
    const stats = await orgService.getOrgStats(org.id);
    res.json({ data: { ...org, stats } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.addMember = async (req, res) => {
  try {
    const { user_id, org_role, department, team, job_title, manager_id } = req.body;
    await orgService.addMember({ org_id: req.params.orgId, user_id, org_role, department, team, job_title, manager_id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getMembers = async (req, res) => {
  try {
    const members = await orgService.getOrgMembers(req.params.orgId, req.query);
    res.json({ data: members });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getOrgStats = async (req, res) => {
  try {
    const stats = await orgService.getOrgStats(req.params.orgId);
    res.json({ data: stats });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.bootstrapOrg = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No Excel file uploaded' });
    const report = await bootstrapService.bootstrapEnvironment(req.params.orgId, req.file.buffer);
    res.json({ success: true, data: report });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getImpactMetrics = async (req, res) => {
  try {
    const stats = await orgService.getImpactMetrics(req.params.orgId);
    res.json({ data: stats });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getManagerStats = async (req, res) => {
  try {
    const stats = await orgService.getTeamCapabilityStats(req.params.orgId, req.user.id);
    res.json({ data: stats });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getManagerAgenda = async (req, res) => {
  try {
    const agenda = await orgService.generateManagerAgenda(req.params.orgId, req.user.id, Number(req.params.employeeId));
    res.json({ data: agenda });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
