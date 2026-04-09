const studyTableService = require('./study-table.service');

exports.getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await studyTableService.getWorkspaces(req.user.id);
    res.json({ success: true, data: workspaces });
  } catch (err) {
    next(err);
  }
};

exports.createWorkspace = async (req, res, next) => {
  try {
    const workspace = await studyTableService.createWorkspace(req.user.id, req.body);
    res.status(201).json({ success: true, data: workspace });
  } catch (err) {
    next(err);
  }
};

exports.getWorkspaceDetails = async (req, res, next) => {
  try {
    const details = await studyTableService.getWorkspaceDetails(req.params.id, req.user.id);
    res.json({ success: true, data: details });
  } catch (err) {
    next(err);
  }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    const docId = await studyTableService.uploadDocument(req.params.id, req.user.id, req.file);
    res.status(201).json({ success: true, data: { docId } });
  } catch (err) {
    next(err);
  }
};

exports.generateArtifact = async (req, res, next) => {
  try {
    const { type, topic } = req.body;
    if (!type) throw new Error('Artifact type is required');
    const artifact = await studyTableService.generateArtifact(req.params.id, req.user.id, type, topic);
    res.status(201).json({ success: true, data: artifact });
  } catch (err) {
    next(err);
  }
};

exports.getArtifact = async (req, res, next) => {
  try {
    const artifact = await studyTableService.getArtifact(req.params.artifactId, req.user.id);
    res.json({ success: true, data: artifact });
  } catch (err) {
    next(err);
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { history, message } = req.body;
    const response = await studyTableService.chat(req.params.id, history, message);
    res.json({ success: true, data: { reply: response } });
  } catch (err) {
    next(err);
  }
};
