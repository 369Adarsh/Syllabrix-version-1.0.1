const express = require('express');
const router = express.Router();
const ctrl = require('./prep-bookmarks.controller');
const { authenticate } = require('../../middleware/auth.middleware');
router.get('/', authenticate, ctrl.getAll);
router.get('/folders', authenticate, ctrl.getFolders);
router.post('/', authenticate, ctrl.add);
router.delete('/:id', authenticate, ctrl.remove);
module.exports = router;
