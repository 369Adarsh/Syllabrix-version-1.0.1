const express = require('express');
const router = express.Router();
const ctrl = require('./prep-categories.controller');
const { authenticate } = require('../../middleware/auth.middleware');
router.get('/', authenticate, ctrl.getTree);
router.get('/:slug', authenticate, ctrl.getBySlug);
router.post('/', authenticate, ctrl.create);
module.exports = router;
