// LD Knowledge Controller — Crowdsourced Tribal Knowledge Hub
const knowledgeService = require('./ld-knowledge.service');

exports.submitItem = async (req, res) => {
  try {
    const { title, body, item_type, tags, skill_ids, media_urls } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body are required' });
    const id = await knowledgeService.createItem(req.params.orgId, req.user.id, { title, body, item_type, tags, skill_ids, media_urls });
    res.status(201).json({ data: { id } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getFeed = async (req, res) => {
  try {
    const items = await knowledgeService.getItems(req.params.orgId, req.query);
    res.json({ data: items });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.search = async (req, res) => {
  try {
    const results = await knowledgeService.search(req.params.orgId, req.query.q, req.query.limit);
    res.json({ data: results });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.reviewItem = async (req, res) => {
  try {
    const { status, comments } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required (published/revision_requested)' });
    await knowledgeService.reviewItem(req.params.orgId, req.params.itemId, req.user.id, { status, comments });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.markHelpful = async (req, res) => {
  try {
    await knowledgeService.markHelpful(req.params.orgId, req.params.itemId);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
