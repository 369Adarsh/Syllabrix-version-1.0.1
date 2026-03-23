const express = require('express');
const router = express.Router();
const ctrl = require('./jobs.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorizeRoles } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { sanitizeBody } = require('../../middleware/sanitize.middleware');
const { createJobValidation, applyJobValidation } = require('./jobs.validation');

router.get('/my-posts', authenticate, ctrl.getMyPosts);
router.get('/my-applications', authenticate, ctrl.getMyApps);
router.post('/', authenticate, authorizeRoles('teacher','institute'), sanitizeBody, createJobValidation, validate, ctrl.create);
router.get('/', authenticate, ctrl.list);
router.get('/:jobId', authenticate, ctrl.getById);
router.put('/:jobId', authenticate, sanitizeBody, ctrl.update);
router.delete('/:jobId', authenticate, ctrl.remove);
router.post('/:jobId/apply', authenticate, sanitizeBody, applyJobValidation, validate, ctrl.apply);
router.get('/:jobId/applications', authenticate, ctrl.getApplications);
router.put('/:jobId/applications/:applicationId', authenticate, ctrl.updateAppStatus);

module.exports = router;
