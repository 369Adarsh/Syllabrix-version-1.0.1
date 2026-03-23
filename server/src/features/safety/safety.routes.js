const express = require('express');
const router = express.Router();
const ctrl = require('./safety.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { sanitizeBody } = require('../../middleware/sanitize.middleware');
const { reportValidation } = require('./safety.validation');

router.post('/block/:userId', authenticate, ctrl.block);
router.delete('/block/:userId', authenticate, ctrl.unblock);
router.get('/blocked', authenticate, ctrl.getBlocked);
router.post('/report', authenticate, sanitizeBody, reportValidation, validate, ctrl.report);
router.get('/my-reports', authenticate, ctrl.getMyReports);

module.exports = router;
