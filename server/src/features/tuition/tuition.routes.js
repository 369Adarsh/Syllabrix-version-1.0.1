const express = require('express');
const router = express.Router();
const ctrl = require('./tuition.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { sanitizeBody } = require('../../middleware/sanitize.middleware');
const { createTuitionValidation } = require('./tuition.validation');

router.get('/my-ads', authenticate, ctrl.getMyAds);
router.post('/', authenticate, sanitizeBody, createTuitionValidation, validate, ctrl.create);
router.get('/', authenticate, ctrl.list);
router.get('/:adId', authenticate, ctrl.getById);
router.put('/:adId', authenticate, sanitizeBody, ctrl.update);
router.delete('/:adId', authenticate, ctrl.remove);

module.exports = router;
