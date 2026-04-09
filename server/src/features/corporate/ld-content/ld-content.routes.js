const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('./ld-content.controller');
const knowledgeCtrl = require('./ld-knowledge.controller');
const { authenticate } = require('../../../middleware/auth.middleware');
const { checkOrgAccess } = require('../../../middleware/org-access.middleware');

// AI Generation
router.post('/:orgId/generate-outline',      authenticate, checkOrgAccess, ctrl.generateOutline);
router.post('/:orgId/generate-module',        authenticate, checkOrgAccess, ctrl.generateModuleContent);
router.post('/:orgId/generate-assessment',    authenticate, checkOrgAccess, ctrl.generateAssessment);
router.post('/:orgId/generate-microlearning', authenticate, checkOrgAccess, ctrl.generateMicrolearning);
router.post('/:orgId/safety-check',          authenticate, checkOrgAccess, ctrl.runSafetyCheck);

// Programs
router.post('/:orgId/programs',               authenticate, checkOrgAccess, ctrl.createProgram);
router.get('/:orgId/programs',                authenticate, checkOrgAccess, ctrl.getPrograms);
router.get('/:orgId/programs/:programId',     authenticate, checkOrgAccess, ctrl.getProgram);

// Modules
router.post('/:orgId/programs/:programId/modules',   authenticate, checkOrgAccess, ctrl.saveModules);

// Assessments
router.post('/:orgId/programs/:programId/assessments', authenticate, checkOrgAccess, ctrl.saveAssessment);

// Review workflow
router.post('/:orgId/submit-review',         authenticate, checkOrgAccess, ctrl.submitForReview);
router.get('/:orgId/review-queue',            authenticate, checkOrgAccess, ctrl.getReviewQueue);
router.patch('/:orgId/reviews/:reviewId',     authenticate, checkOrgAccess, ctrl.submitReview);

// Knowledge Items (Tribal Knowledge Hub)
router.post('/:orgId/knowledge',               authenticate, checkOrgAccess, knowledgeCtrl.submitItem);
router.get('/:orgId/knowledge',                authenticate, checkOrgAccess, knowledgeCtrl.getFeed);
router.get('/:orgId/knowledge/search',         authenticate, checkOrgAccess, knowledgeCtrl.search);
router.post('/:orgId/knowledge/:itemId/review',  authenticate, checkOrgAccess, knowledgeCtrl.reviewItem);
router.post('/:orgId/knowledge/:itemId/helpful', authenticate, checkOrgAccess, knowledgeCtrl.markHelpful);

module.exports = router;
