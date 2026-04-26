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
router.post('/users/:id/verify-email', requireAdminRole(['moderator']), AdminController.verifyUserEmail);
router.delete('/users/:id', requireAdminRole([]), AdminController.deleteUser); // Super admin only

/**
 * 1.5. ADMIN NOTIFICATION ALERTS
 */
router.get('/alerts', requireAdminRole(['moderator', 'analyst']), AdminController.getAdminAlerts);

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
 * 7. ACADEMIC LIBRARY MANAGEMENT
 */
const LibraryCtrl = require('./admin-library.controller');
const { uploadSingle } = require('../../middleware/upload.middleware');
router.get('/library/stats',           requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getStats);
router.get('/library/tree',            requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getTree);
router.get('/library/search',          requireAdminRole(['moderator', 'analyst']), LibraryCtrl.search);
router.get('/library/boards',          requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getBoards);
router.post('/library/boards',         requireAdminRole(['moderator']),            LibraryCtrl.createBoard);
router.get('/library/classes',         requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getClasses);
router.post('/library/classes',        requireAdminRole(['moderator']),            LibraryCtrl.createClass);
router.get('/library/subjects',        requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getSubjects);
router.post('/library/subjects',       requireAdminRole(['moderator']),            LibraryCtrl.createSubject);
router.delete('/library/subjects/:id', requireAdminRole(['moderator']),            LibraryCtrl.deleteSubject);
router.get('/library/books',           requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getBooks);
router.post('/library/books',          requireAdminRole(['moderator']),            uploadSingle, LibraryCtrl.createBook);
router.delete('/library/books/:id',    requireAdminRole(['moderator']),            LibraryCtrl.deleteBook);
router.get('/library/chapters',             requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getChapters);
router.post('/library/chapters/bulk',       requireAdminRole(['moderator']),            LibraryCtrl.bulkCreateChapters);
router.post('/library/chapters',            requireAdminRole(['moderator']),            LibraryCtrl.createChapter);
router.patch('/library/chapters/:id',       requireAdminRole(['moderator']),            LibraryCtrl.updateChapter);
router.delete('/library/chapters/:id',      requireAdminRole(['moderator']),            LibraryCtrl.deleteChapter);
router.get('/library/topics',          requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getTopics);
router.post('/library/topics',         requireAdminRole(['moderator']),            LibraryCtrl.createTopic);
router.delete('/library/topics/:id',   requireAdminRole(['moderator']),            LibraryCtrl.deleteTopic);
router.get('/library/uploads',         requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getUploads);
router.post('/library/uploads',        requireAdminRole(['moderator']),            uploadSingle, LibraryCtrl.uploadFile);
router.patch('/library/uploads/:id/ai-index', requireAdminRole(['moderator']),    LibraryCtrl.toggleAiIndex);
router.delete('/library/uploads/:id',  requireAdminRole(['moderator']),            LibraryCtrl.deleteUpload);
router.get('/library/exams/tree',      requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getExamTree);
router.get('/library/exams/subjects',  requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getExamSubjects);
router.get('/library/exams/books',     requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getCompetitiveBooks);
router.get('/library/university/tree', requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getUniversityTree);
router.get('/library/university/subjects', requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getUniversitySubjects);
router.get('/library/university/books',    requireAdminRole(['moderator', 'analyst']), LibraryCtrl.getUniversitySubjectBooks);

/**
 * 9. SYLLATRACE — IT DIAGNOSTIC CONSOLE (super admin only)
 */
const DiagCtrl = require('./diagnostics.controller');
router.get('/debug/health',        requireAdminRole([]), DiagCtrl.getHealth);
router.get('/debug/trace',         requireAdminRole([]), DiagCtrl.getTraceLog);
router.get('/debug/errors',        requireAdminRole([]), DiagCtrl.getErrorLog);
router.get('/debug/slow-queries',  requireAdminRole([]), DiagCtrl.getSlowQueryLog);
router.get('/debug/route-stats',   requireAdminRole([]), DiagCtrl.getRouteStatsHandler);
router.delete('/debug/clear',      requireAdminRole([]), DiagCtrl.clearBuffers);

/**
 * 8. SYLLADESK TICKETING SYSTEM
 */
const TicketController = require('./ticket.controller');
router.get('/tickets', requireAdminRole(['moderator', 'analyst']), TicketController.listTickets);
router.get('/tickets/:id', requireAdminRole(['moderator', 'analyst']), TicketController.getTicketDetails);
router.post('/tickets/:id/reply', requireAdminRole(['moderator']), TicketController.addReply);
router.patch('/tickets/:id/status', requireAdminRole(['moderator']), TicketController.updateStatus);

module.exports = router;
