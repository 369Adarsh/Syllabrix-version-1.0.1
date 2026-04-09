const express = require('express');
const router = express.Router();
const ctrl = require('./ld-org.controller');
const { authenticate } = require('../../../middleware/auth.middleware');
const { checkOrgAccess } = require('../../../middleware/org-access.middleware');
const { requireRole } = require('../../../middleware/rbac.middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/',               authenticate, ctrl.createOrg);
router.get('/my',              authenticate, ctrl.getMyOrgs);
router.get('/:orgId',          authenticate, checkOrgAccess, ctrl.getOrg);
router.post('/:orgId/members',  authenticate, checkOrgAccess, requireRole(['owner', 'super_admin', 'ld_admin']), ctrl.addMember);
router.get('/:orgId/members',   authenticate, checkOrgAccess, requireRole(['owner', 'super_admin', 'ld_admin', 'hr']), ctrl.getMembers);
router.get('/:orgId/stats',     authenticate, checkOrgAccess, requireRole(['owner', 'super_admin', 'ld_admin', 'hr']), ctrl.getOrgStats);
router.get('/:orgId/impact',    authenticate, checkOrgAccess, requireRole(['owner', 'super_admin', 'ld_admin', 'hr']), ctrl.getImpactMetrics);
router.get('/:orgId/manager-stats', authenticate, checkOrgAccess, requireRole(['owner', 'super_admin', 'ld_admin', 'manager']), ctrl.getManagerStats);
router.get('/:orgId/manager/agenda/:employeeId', authenticate, checkOrgAccess, requireRole(['owner', 'super_admin', 'ld_admin', 'manager']), ctrl.getManagerAgenda);
router.post('/:orgId/bootstrap', authenticate, checkOrgAccess, requireRole(['owner', 'super_admin', 'ld_admin']), upload.single('file'), ctrl.bootstrapOrg);

module.exports = router;

