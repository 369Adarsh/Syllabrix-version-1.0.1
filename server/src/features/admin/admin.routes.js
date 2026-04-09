const express = require('express');
const router = express.Router();
const AdminController = require('./admin.controller');
const { authenticateAdmin, authenticateAdminFor2FA, requireAdminRole } = require('../../middleware/admin-auth.middleware');

/**
 * 2FA ROUTES — Must be registered BEFORE router.use(authenticateAdmin)
 * These accept both pre-2FA tokens (login challenge) and regular admin tokens (first-time setup)
 * Frontend sends pre_2fa_token received from login when is_2fa_enabled=true
 */
router.post('/2fa/setup', authenticateAdminFor2FA, AdminController.setup2FA);
router.post('/2fa/verify', authenticateAdminFor2FA, AdminController.verify2FA);

// All remaining /api/admin routes require full Admin auth + 2FA verification
router.use(authenticateAdmin);

/**
 * 1. USER MANAGEMENT (The "Workbench")
 */
router.get('/users', requireAdminRole(['moderator', 'analyst']), AdminController.listUsers);
router.get('/users/:id/activity', requireAdminRole(['moderator', 'analyst']), AdminController.getUserActivity);
router.post('/users/:id/status', requireAdminRole(['moderator']), AdminController.setUserStatus);

/**
 * 2. CONTENT & FINANCE MODERATION
 */
router.get('/reports', requireAdminRole(['moderator', 'analyst']), AdminController.getReports);
router.patch('/reports/:id', requireAdminRole(['moderator']), AdminController.updateReportStatus);
router.get('/revenue/stats', requireAdminRole(['finance_manager', 'analyst']), AdminController.getRevenueStats);
router.get('/overview/growth', requireAdminRole(['analyst']), AdminController.getUserGrowth);

/**
 * 3. GLOBAL AUDIT & REPORT EXTRACTION
 */
router.get('/audit', requireAdminRole(['analyst']), AdminController.getAuditLogs);
router.get('/reports/extract/:type', requireAdminRole(['finance_manager', 'moderator', 'analyst']), AdminController.extractReport);

/**
 * 4. SUPER ADMIN WORKBENCH (DATABASE EXPLORER)
 */
router.get('/workbench/tables', requireAdminRole([]), AdminController.listTables); // Empty array = Super Admin only
router.get('/workbench/tables/:tableName', requireAdminRole([]), AdminController.getTableData);
router.patch('/workbench/tables/:tableName/:id', requireAdminRole([]), AdminController.updateRecord);
router.post('/workbench/query', requireAdminRole([]), AdminController.runRawQuery);

/**
 * 6. ENTERPRISE & MASTER UNIFICATION
 */
router.get('/enterprise/organizations', requireAdminRole(['analyst', 'moderator']), AdminController.getOrganizations);
router.get('/enterprise/skills', requireAdminRole(['analyst']), AdminController.getSkillInsights);
router.get('/enterprise/enrollments', requireAdminRole(['analyst']), AdminController.getEnterpriseEnrollments);
router.get('/master/health', requireAdminRole(['analyst', 'finance_manager']), AdminController.getMasterHealth);

/**
 * 7. SYLLADESK TICKETING SYSTEM
 */
const TicketController = require('./ticket.controller');
router.get('/tickets', requireAdminRole(['moderator', 'analyst']), TicketController.listTickets);
router.get('/tickets/:id', requireAdminRole(['moderator', 'analyst']), TicketController.getTicketDetails);
router.post('/tickets/:id/reply', requireAdminRole(['moderator']), TicketController.addReply);
router.patch('/tickets/:id/status', requireAdminRole(['moderator']), TicketController.updateStatus);

module.exports = router;
