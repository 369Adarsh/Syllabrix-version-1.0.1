const express = require('express');
const router = express.Router();
const ctrl = require('./endorsements.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorizeRoles } = require('../../middleware/role.middleware');

router.post('/:userId', authenticate, authorizeRoles('teacher','mentor','institute'), ctrl.endorse);
router.get('/:userId', authenticate, ctrl.getUserEndorsements);
router.get('/:userId/by-skill', authenticate, ctrl.getBySkill);
router.delete('/:endorsementId', authenticate, ctrl.remove);

module.exports = router;
