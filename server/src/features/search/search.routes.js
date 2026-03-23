const express = require('express');
const router = express.Router();
const ctrl = require('./search.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/', authenticate, ctrl.search);
router.get('/trending', authenticate, ctrl.getTrending);
router.get('/history', authenticate, ctrl.getHistory);
router.delete('/history', authenticate, ctrl.clearHistory);

module.exports = router;
