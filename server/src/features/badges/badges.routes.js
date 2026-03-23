const express = require('express');
const router = express.Router();
const ctrl = require('./badges.controller');
const { authenticate } = require('../../middleware/auth.middleware');
router.get('/', authenticate, ctrl.getAll);
router.get('/my-badges', authenticate, ctrl.getMyBadges);
router.get('/:userId', authenticate, ctrl.getUserBadges);
router.post('/', authenticate, ctrl.create);
module.exports = router;
