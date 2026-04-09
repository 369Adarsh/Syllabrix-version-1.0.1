const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('./ld-skills.controller');
const { authenticate } = require('../../../middleware/auth.middleware');
const { checkOrgAccess } = require('../../../middleware/org-access.middleware');

// Skills taxonomy
router.post('/:orgId/skills',              authenticate, checkOrgAccess, ctrl.createSkill);
router.get('/:orgId/skills',               authenticate, checkOrgAccess, ctrl.getSkills);

// Roles
router.post('/:orgId/roles',               authenticate, checkOrgAccess, ctrl.createRole);
router.get('/:orgId/roles',                authenticate, checkOrgAccess, ctrl.getRoles);

// Role-Skill mapping
router.post('/:orgId/roles/:roleId/skills',  authenticate, checkOrgAccess, ctrl.mapRoleSkill);
router.get('/:orgId/roles/:roleId/skills',   authenticate, checkOrgAccess, ctrl.getRoleSkills);

// AI skill extraction
router.post('/:orgId/extract-jd',          authenticate, checkOrgAccess, ctrl.extractSkillsFromJD);
router.post('/:orgId/import-csv',          authenticate, checkOrgAccess, ctrl.importCSV);

// Employee assessments
router.post('/:orgId/self-assess',         authenticate, checkOrgAccess, ctrl.selfAssess);
router.post('/:orgId/manager-rate',        authenticate, checkOrgAccess, ctrl.managerRate);

// Gap analysis
router.get('/:orgId/gaps',                 authenticate, checkOrgAccess, ctrl.getGaps);
router.get('/:orgId/gaps/:userId',         authenticate, checkOrgAccess, ctrl.getGaps);
router.get('/:orgId/heatmap',             authenticate, checkOrgAccess, ctrl.getHeatmap);
router.get('/:orgId/gap-summary',          authenticate, checkOrgAccess, ctrl.getOrgGapSummary);

// Employee skill profile
router.get('/:orgId/profile',             authenticate, checkOrgAccess, ctrl.getProfile);
router.get('/:orgId/profile/:userId',     authenticate, checkOrgAccess, ctrl.getProfile);

// Career Integration
router.get('/:orgId/career/roadmap/:targetRoleId', authenticate, checkOrgAccess, ctrl.getCareerRoadmap);

module.exports = router;
