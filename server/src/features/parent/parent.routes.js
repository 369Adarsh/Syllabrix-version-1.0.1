const express = require('express');
const router = express.Router();
const ctrl = require('./parent.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorizeRoles } = require('../../middleware/role.middleware');

router.post('/link-child', authenticate, authorizeRoles('parent'), ctrl.linkChild);
router.get('/children', authenticate, authorizeRoles('parent'), ctrl.getChildren);
router.get('/child/:childId/activity', authenticate, authorizeRoles('parent'), ctrl.getChildActivity);
router.delete('/child/:childId/link', authenticate, authorizeRoles('parent'), ctrl.removeLink);

module.exports = router;
