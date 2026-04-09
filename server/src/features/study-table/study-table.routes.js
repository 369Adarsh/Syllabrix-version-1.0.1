const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const studyTableController = require('./study-table.controller');


// ensure public directory also exists for long-term storage
const publicDir = path.join(__dirname, '../../../public/uploads/study');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB
  }
});

const { authenticate } = require('../../middleware/auth.middleware');
router.use(authenticate);

router.get('/', studyTableController.getWorkspaces);
router.post('/', studyTableController.createWorkspace);
router.get('/:id', studyTableController.getWorkspaceDetails);

// Document specific
router.post('/:id/documents', upload.single('document'), studyTableController.uploadDocument);

// Artifact specific
router.post('/:id/artifacts', studyTableController.generateArtifact);
router.get('/:id/artifacts/:artifactId', studyTableController.getArtifact);

// Chat
router.post('/:id/chat', studyTableController.chat);

module.exports = router;
