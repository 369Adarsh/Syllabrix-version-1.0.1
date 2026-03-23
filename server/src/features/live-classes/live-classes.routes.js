const express = require('express');
const router = express.Router();
const ctrl = require('./live-classes.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorizeRoles } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { sanitizeBody } = require('../../middleware/sanitize.middleware');
const { createClassValidation } = require('./live-classes.validation');

router.get('/my-classes', authenticate, ctrl.getMyClasses);
router.get('/my-attended', authenticate, ctrl.getMyAttended);
router.post('/', authenticate, authorizeRoles('teacher','mentor','institute'), sanitizeBody, createClassValidation, validate, ctrl.create);
router.get('/', authenticate, ctrl.list);
router.get('/:classId', authenticate, ctrl.getById);
router.put('/:classId', authenticate, sanitizeBody, ctrl.update);
router.delete('/:classId', authenticate, ctrl.cancel);
router.post('/:classId/start', authenticate, ctrl.start);
router.post('/:classId/end', authenticate, ctrl.end);
router.post('/:classId/join', authenticate, ctrl.join);
router.post('/:classId/leave', authenticate, ctrl.leave);
router.get('/:classId/attendees', authenticate, ctrl.getAttendees);

module.exports = router;
