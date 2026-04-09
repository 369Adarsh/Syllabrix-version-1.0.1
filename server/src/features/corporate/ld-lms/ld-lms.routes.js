const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('./ld-lms.controller');
const { authenticate } = require('../../../middleware/auth.middleware');
const { checkOrgAccess } = require('../../../middleware/org-access.middleware');

// Enrollment
router.post('/:orgId/enroll',                  authenticate, checkOrgAccess, ctrl.enroll);
router.post('/:orgId/bulk-enroll',             authenticate, checkOrgAccess, ctrl.bulkEnroll);

// Learner feed
router.get('/:orgId/feed',                     authenticate, checkOrgAccess, ctrl.getLearnerFeed);
router.get('/:orgId/stats',                    authenticate, checkOrgAccess, ctrl.getLearnerStats);

// Enrollment details
router.get('/:orgId/enrollments/:enrollmentId', authenticate, checkOrgAccess, ctrl.getEnrollmentDetails);

// Course Player / RAG Chat
router.post('/:orgId/enrollments/:enrollmentId/modules/:moduleId/chat', authenticate, checkOrgAccess, ctrl.chatWithCoach);

// Module progress
router.post('/:orgId/enroll/:enrollmentId/module/:moduleId/start',    authenticate, checkOrgAccess, ctrl.startModule);
router.post('/:orgId/enroll/:enrollmentId/module/:moduleId/complete', authenticate, checkOrgAccess, ctrl.completeModule);

// Assessments
router.post('/:orgId/assessments/:assessmentId/submit', authenticate, checkOrgAccess, ctrl.submitAssessment);

// Compliance
router.get('/:orgId/compliance',               authenticate, checkOrgAccess, ctrl.getComplianceStatus);

// Reinforcements (Spaced Repetition)
router.get('/:orgId/reinforcements',           authenticate, checkOrgAccess, ctrl.getReinforcements);
router.post('/:orgId/reinforcements/:scheduleId/complete', authenticate, checkOrgAccess, ctrl.completeReinforcement);

module.exports = router;
