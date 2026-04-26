const AdminService = require('./admin.service');
const ReportService = require('./report.service');

class AdminController {
  /**
   * List users with workbench view
   */
  async listUsers(req, res) {
    try {
      const filters = {
        user_type: req.query.user_type,
        status: req.query.status,
        search: req.query.search
      };
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await AdminService.listUsers(filters, pagination);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Admin notification alerts (pending reports, open tickets, new users)
   */
  async getAdminAlerts(req, res) {
    try {
      const result = await AdminService.getAdminAlerts();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Content moderation reports
   */
  async getReports(req, res) {
    try {
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };
      const reports = await AdminService.getPendingReports(pagination);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update report status (Dismiss/Action Taken)
   */
  async updateReportStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const result = await AdminService.updateReportStatus(id, status, note, req.user.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Ban/Unban user
   */
  async setUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      
      const result = await AdminService.setUserStatus(id, status, req.user.id, reason);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Manually verify a user's email
   */
  async verifyUserEmail(req, res) {
    try {
      const { id } = req.params;
      const result = await AdminService.verifyUserEmail(id, req.user.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Permanently delete a user (super admin only)
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteUser(id, req.user.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Financial analytics
   */
  async getRevenueStats(req, res) {
    try {
      const stats = await AdminService.getRevenueStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * User Growth analytics
   */
  async getUserGrowth(req, res) {
    try {
      const stats = await AdminService.getUserGrowth();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 2FA Setup for Admins
   */
  async setup2FA(req, res) {
    try {
      const { setup2FA } = require('../auth/auth.service');
      const result = await setup2FA(req.user.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 2FA Verification for Admins
   */
  async verify2FA(req, res) {
    try {
      const { verify2FA } = require('../auth/auth.service');
      const { token } = req.body;
      
      const result = await verify2FA(req.user.id, token);
      if (result.verified) {
        res.json(result);
      } else {
        res.status(400).json({ error: 'Invalid 2FA token' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * WORKBENCH: List all tables
   */
  async listTables(req, res) {
    try {
      const tables = await AdminService.listTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * WORKBENCH: Get table data
   */
  async getTableData(req, res) {
    try {
      const { tableName } = req.params;
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };
      const result = await AdminService.getTableData(tableName, pagination);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * WORKBENCH: Update specific record
   */
  async updateRecord(req, res) {
    try {
      const { tableName, id } = req.params;
      const data = req.body;
      const result = await AdminService.updateRecord(tableName, id, data, req.user.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * AUDIT: Get global action logs
   */
  async getAuditLogs(req, res) {
    try {
      const filters = {
        action_type: req.query.action_type || null,
        search:      req.query.search      || null,
        date_from:   req.query.date_from   || null,
        date_to:     req.query.date_to     || null,
      };
      const pagination = {
        page:  parseInt(req.query.page)  || 1,
        limit: parseInt(req.query.limit) || 30,
      };
      const result = await AdminService.getAuditLogs(filters, pagination);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Execute RAW SQL Code (Super Admin ONLY)
   */
  async runRawQuery(req, res) {
    try {
      const { sql } = req.body;
      if (!sql) throw new Error('No SQL query provided');
      
      const { result, fields } = await AdminService.runRawQuery(sql, req.user.id);
      res.json({ result, fields });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * EXTRACT SPECIALIZED REPORTS
   */
  async extractReport(req, res) {
    try {
      const { type } = req.params;
      const { days } = req.query;
      let data;

      switch (type) {
        case 'growth':
          data = await ReportService.generateGrowthReport(days);
          break;
        case 'finance':
          data = await ReportService.generateFinancialAudit(days);
          break;
        case 'moderation':
          data = await ReportService.generateModerationImpact(days);
          break;
        case 'health':
          data = await ReportService.generatePlatformHealth();
          break;
        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * ==========================================
   * ENTERPRISE & MASTER UNIFICATION
   * ==========================================
   */

  async getOrganizations(req, res) {
    try {
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };
      const result = await AdminService.listOrganizations(pagination);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSkillInsights(req, res) {
    try {
      const stats = await AdminService.getSkillInsights();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEnterpriseEnrollments(req, res) {
    try {
      const { days } = req.query;
      const stats = await AdminService.getEnterpriseEnrollments(days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMasterHealth(req, res) {
    try {
      const health = await AdminService.getMasterPlatformHealth();
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Fetch unified activity history for a specific user
   */
  async getUserActivity(req, res) {
    try {
      const { id } = req.params;
      const { limit, page, startDate, endDate, actionGroup } = req.query;
      const result = await AdminService.getUserActivity(
        id,
        parseInt(page) || 1,
        parseInt(limit) || 30,
        startDate || null,
        endDate || null,
        actionGroup || null
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AdminController();
