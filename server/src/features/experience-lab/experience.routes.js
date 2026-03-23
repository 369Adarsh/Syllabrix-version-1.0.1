const express = require('express');
const router = express.Router();
const ctrl = require('./experience.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/sectors', authenticate, ctrl.getSectors);
router.get('/professions', authenticate, ctrl.getProfessions);
router.get('/professions/:slug', authenticate, ctrl.getProfession);
router.get('/activities/:activityId', authenticate, ctrl.getActivity);
router.post('/activities/:activityId/start', authenticate, ctrl.startActivity);
router.post('/activities/:activityId/submit', authenticate, ctrl.submitActivity);
router.get('/my-progress', authenticate, ctrl.getMyProgress);
router.get('/my-progress/:professionId', authenticate, ctrl.getProgressForProfession);
router.post('/sectors', authenticate, ctrl.createSector);
router.post('/professions', authenticate, ctrl.createProfession);
router.post('/activities', authenticate, ctrl.createActivity);

module.exports = router;
