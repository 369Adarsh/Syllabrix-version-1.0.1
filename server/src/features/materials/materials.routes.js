const express = require('express');
const router = express.Router();
const ctrl = require('./materials.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { sanitizeBody } = require('../../middleware/sanitize.middleware');
const { createMaterialValidation } = require('./materials.validation');

router.post('/', authenticate, sanitizeBody, createMaterialValidation, validate, ctrl.create);
router.get('/', authenticate, ctrl.list);
router.get('/:materialId', authenticate, ctrl.getById);
router.delete('/:materialId', authenticate, ctrl.remove);
router.post('/:materialId/download', authenticate, ctrl.download);

module.exports = router;
