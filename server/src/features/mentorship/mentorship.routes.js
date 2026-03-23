const express = require('express');
const router = express.Router();
const ctrl = require('./mentorship.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/mentors', authenticate, ctrl.getMentors);
router.get('/mentors/:mentorId', authenticate, ctrl.getMentor);
router.post('/setup-profile', authenticate, ctrl.setupProfile);
router.post('/apply', authenticate, ctrl.apply);
router.get('/my-applications', authenticate, ctrl.getMyApplications);
router.get('/my-mentees', authenticate, ctrl.getMenteeApplications);
router.put('/applications/:applicationId', authenticate, ctrl.updateApplication);
router.get('/mentees', authenticate, ctrl.getMyMentees);
router.get('/my-mentor', authenticate, ctrl.getMyMentor);
router.post('/sessions', authenticate, ctrl.createSession);
router.get('/sessions', authenticate, ctrl.getSessions);
router.put('/sessions/:sessionId', authenticate, ctrl.updateSession);

module.exports = router;
