const express = require('express');
const router = express.Router();
const ctrl = require('./ratings.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/teacher/:teacherId', authenticate, ctrl.rate);
router.get('/teacher/:teacherId', authenticate, ctrl.getTeacherRatings);

module.exports = router;
