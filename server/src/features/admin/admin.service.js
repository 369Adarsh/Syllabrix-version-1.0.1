const { socialPool: pool } = require('../../database/connection');

class AdminService {
  /**
   * 1. THE "WORKBENCH" USER LIST
   * Fetch all users with profile previews, status, and activity summaries.
   */
  async listUsers(filters = {}, pagination = { page: 1, limit: 20 }) {
    const { user_type, status, search } = filters;
    const offset = (pagination.page - 1) * pagination.limit;

    let query = `
      SELECT
        u.id, u.syllabrix_id, u.username, u.full_name, u.email, u.user_type, u.admin_role,
        u.is_active, u.is_profile_complete, u.created_at, u.email_verified_at,
        (SELECT COUNT(*) FROM reports r WHERE r.reported_user_id = u.id) as report_count,
        (SELECT MAX(created_at) FROM user_sessions s WHERE s.user_id = u.id) as last_seen
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (user_type) {
      query += ' AND u.user_type = ?';
      params.push(user_type);
    }

    if (status !== undefined) {
      query += ' AND u.is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }

    if (search) {
      query += ' AND (u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ? OR u.syllabrix_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(pagination.limit, offset);

    const [rows] = await pool.query(query, params);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM users');

    return { users: rows, total, page: pagination.page, totalPages: Math.ceil(total / pagination.limit) };
  }

  /**
   * 2. CONTENT MODERATION QUEUE
   * List all pending reports with reporter and target details.
   */
  async getPendingReports(pagination = { page: 1, limit: 10 }) {
    const offset = (pagination.page - 1) * pagination.limit;
    const [reports] = await pool.query(`
      SELECT 
        r.*, 
        u.username as reporter_name,
        tu.username as reported_username
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      LEFT JOIN users tu ON r.reported_user_id = tu.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [pagination.limit, offset]);

    return reports;
  }

  /**
   * 2.5. UPDATE REPORT STATUS
   */
  async updateReportStatus(reportId, status, reviewerNote, adminId) {
    const validStatuses = ['pending', 'resolved', 'dismissed', 'action_taken'];
    if (!validStatuses.includes(status)) throw new Error('Invalid status');

    await pool.query(
      'UPDATE reports SET status = ?, reviewer_note = ?, reviewed_at = NOW() WHERE id = ?',
      [status, reviewerNote, reportId]
    );

    await this.logAdminAction(adminId, `report_${status}`, 'reports', reportId, { reviewerNote });

    return { message: 'Report updated successfully.' };
  }

  /**
   * 3. ACCOUNT STATUS CONTROL (BAN/UNBAN)
   */
  async setUserStatus(userId, status, adminId, reason) {
    const isActive = status === 'active' ? 1 : 0;
    
    // Check if target user is also an admin (cannot ban another admin easily)
    const [target] = await pool.query('SELECT id, user_type FROM users WHERE id = ?', [userId]);
    if (!target[0]) throw new Error('User not found');
    if (target[0].user_type === 'syllabrix_admin' && adminId !== userId) {
      throw new Error('Action denied: Cannot modify another admin account status.');
    }

    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);

    // LOG THE AUDIT ACTION
    await this.logAdminAction(adminId, isActive ? 'user_unban' : 'user_ban', 'users', userId, { reason });

    return { message: `User account ${isActive ? 'activated' : 'deactivated'} successfully.` };
  }

  /**
   * 3.5. MANUAL EMAIL VERIFICATION
   * Admin manually verifies a user who skipped email confirmation.
   */
  async verifyUserEmail(userId, adminId) {
    const [target] = await pool.query('SELECT id, email_verified_at FROM users WHERE id = ?', [userId]);
    if (!target[0]) throw new Error('User not found');
    if (target[0].email_verified_at) throw new Error('User email is already verified');

    await pool.query(
      'UPDATE users SET email_verified_at = NOW(), is_active = 1 WHERE id = ?',
      [userId]
    );

    await this.logAdminAction(adminId, 'manual_email_verify', 'users', userId, {});

    return { message: 'User email verified and account activated successfully.' };
  }

  /**
   * 4. FINANCIAL MONITORING
   * Aggregated revenue stats from the payments table.
   */
  async getRevenueStats() {
    const [[monthly]] = await pool.query(`
      SELECT SUM(amount_inr) as total 
      FROM payments 
      WHERE status = 'captured' 
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const [[total]] = await pool.query(`
      SELECT SUM(amount_inr) as total 
      FROM payments 
      WHERE status = 'captured'
    `);

    const [byType] = await pool.query(`
      SELECT payment_type, SUM(amount_inr) as amount, COUNT(*) as count
      FROM payments
      WHERE status = 'captured'
      GROUP BY payment_type
    `);

    return {
      last_30_days: monthly.total || 0,
      total_lifetime: total.total || 0,
      breakdown: byType
    };
  }

  /**
   * 4.5. USER GROWTH OVERVIEW
   * Get registration counts for the past 7 days
   */
  async getUserGrowth() {
    // Generate dates for the last 7 days and join against user creation dates
    // For universal compatibility, we do a simple query grouping by date.
    const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Ensure all 7 days are represented even if 0 users joined
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const found = rows.find(r => r.date && r.date.toISOString().split('T')[0] === dateStr);
      last7Days.push({
        day: dayName,
        users: found ? Number(found.new_users) : 0
      });
    }

    return last7Days;
  }

  /**
   * 4.8. ADMIN NOTIFICATION ALERTS
   * Returns live counts for pending items that need admin attention.
   */
  async getAdminAlerts() {
    const [[{ pending_reports }]] = await pool.query(
      `SELECT COUNT(*) as pending_reports FROM reports WHERE status = 'pending'`
    );
    const [[{ open_tickets }]] = await pool.query(
      `SELECT COUNT(*) as open_tickets FROM tickets WHERE status IN ('open', 'in_progress')`
    );
    const [[{ new_users_today }]] = await pool.query(
      `SELECT COUNT(*) as new_users_today FROM users WHERE created_at >= CURDATE()`
    );
    const [[{ unverified_users }]] = await pool.query(
      `SELECT COUNT(*) as unverified_users FROM users WHERE email_verified_at IS NULL AND is_active = 1`
    );

    const alerts = [];

    if (pending_reports > 0) {
      alerts.push({
        type: 'pending_reports',
        count: Number(pending_reports),
        label: `${pending_reports} Pending Report${pending_reports > 1 ? 's' : ''}`,
        description: 'Flagged content awaiting moderation review',
        href: '/admin/moderation',
        severity: Number(pending_reports) >= 5 ? 'critical' : 'warning',
      });
    }

    if (open_tickets > 0) {
      alerts.push({
        type: 'open_tickets',
        count: Number(open_tickets),
        label: `${open_tickets} Open Ticket${open_tickets > 1 ? 's' : ''}`,
        description: 'Support tickets waiting for admin response',
        href: '/admin/tickets',
        severity: 'info',
      });
    }

    if (new_users_today > 0) {
      alerts.push({
        type: 'new_users_today',
        count: Number(new_users_today),
        label: `${new_users_today} New User${new_users_today > 1 ? 's' : ''} Today`,
        description: 'Registered since midnight',
        href: '/admin/users',
        severity: 'success',
      });
    }

    if (unverified_users > 0) {
      alerts.push({
        type: 'unverified_users',
        count: Number(unverified_users),
        label: `${unverified_users} Unverified Account${unverified_users > 1 ? 's' : ''}`,
        description: 'Active accounts with unverified email',
        href: '/admin/users',
        severity: 'info',
      });
    }

    const total_urgent = Number(pending_reports) + Number(open_tickets);

    return { alerts, total_urgent, total_count: alerts.length };
  }

  /**
   * 5. INTERNAL AUDIT LOGGING
   */
  async logAdminAction(adminId, actionType, targetType, targetId, meta = {}) {
    await pool.query(
      'INSERT INTO admin_audit_logs (admin_id, action_type, target_type, target_id, new_value) VALUES (?, ?, ?, ?, ?)',
      [adminId, actionType, targetType, targetId, JSON.stringify(meta)]
    );
  }

  /**
   * 6. SUPER ADMIN WORKBENCH (DATABASE EXPLORER)
   */
  async listTables() {
    const [rows] = await pool.query('SHOW TABLES');
    return rows.map(r => Object.values(r)[0]);
  }

  async getTableSchema(tableName) {
    // Whitelist check could be here
    const [cols] = await pool.query(`DESCRIBE ??`, [tableName]);
    return cols;
  }

  async getTableData(tableName, pagination = { page: 1, limit: 50 }) {
    const offset = (pagination.page - 1) * pagination.limit;
    const [rows] = await pool.query(`SELECT * FROM ?? LIMIT ? OFFSET ?`, [tableName, pagination.limit, offset]);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM ??`, [tableName]);
    
    return { data: rows, total, page: pagination.page, totalPages: Math.ceil(total / pagination.limit) };
  }

  async updateRecord(tableName, id, data, adminId) {
    // Caution: Extreme power
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    let setClause = keys.map(k => `${k} = ?`).join(', ');
    const query = `UPDATE ?? SET ${setClause} WHERE id = ?`;
    
    const [result] = await pool.query(query, [tableName, ...values, id]);
    
    await this.logAdminAction(adminId, 'database_edit', tableName, id, { updated_fields: keys });
    
    return { success: true, message: `Record ${id} in ${tableName} updated.` };
  }

  async getAuditLogs(filters = {}, pagination = { page: 1, limit: 30 }) {
    const offset = (pagination.page - 1) * pagination.limit;
    const { action_type, search, date_from, date_to } = filters;

    let where = 'WHERE 1=1';
    const params = [];

    if (action_type) {
      where += ' AND l.action_type = ?';
      params.push(action_type);
    }
    if (search) {
      where += ' AND (u.username LIKE ? OR u.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (date_from) {
      where += ' AND l.created_at >= ?';
      params.push(date_from);
    }
    if (date_to) {
      where += ' AND l.created_at <= ?';
      params.push(date_to + ' 23:59:59');
    }

    const [logs] = await pool.query(`
      SELECT l.*, u.username as admin_name, u.full_name as admin_full_name
      FROM admin_audit_logs l
      LEFT JOIN users u ON l.admin_id = u.id
      ${where}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, pagination.limit, offset]);

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM admin_audit_logs l LEFT JOIN users u ON l.admin_id = u.id ${where}`,
      params
    );

    // Safely parse new_value — it may be a string, object, or null
    const safeLogs = logs.map(log => {
      let parsed = null;
      if (log.new_value !== null && log.new_value !== undefined) {
        try {
          parsed = typeof log.new_value === 'string' ? JSON.parse(log.new_value) : log.new_value;
        } catch {
          parsed = { raw: String(log.new_value) };
        }
      }
      return { ...log, new_value: parsed };
    });

    return {
      logs: safeLogs,
      total: Number(total),
      page: pagination.page,
      totalPages: Math.ceil(Number(total) / pagination.limit),
    };
  }

  async runRawQuery(sql, adminId) {
    // Guard: block destructive operations even for super admins
    const FORBIDDEN = ['DROP', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE', 'RENAME', 'CREATE DATABASE', 'DROP DATABASE'];
    const sqlUpper = sql.trim().toUpperCase();
    const hit = FORBIDDEN.find(kw => sqlUpper.includes(kw));
    if (hit) {
      throw new Error(`Query blocked: "${hit}" is a forbidden operation in the Query Console. Use the migration system for schema changes.`);
    }

    // Log before execution for forensics
    await this.logAdminAction(adminId, 'raw_sql_execution', 'system', 0, { sql });

    const [result, fields] = await pool.query(sql);
    return { result, fields: fields?.map(f => f.name) || [] };
  }

  /**
   * ==========================================
   * ENTERPRISE COMMAND (CORPORATE L&D)
   * ==========================================
   */

  /**
   * 7. ORGANIZATION COMMAND
   * Fetch all Corporate L&D tenants with employee counts.
   */
  async listOrganizations(pagination = { page: 1, limit: 10 }) {
    const offset = (pagination.page - 1) * pagination.limit;
    
    // Fetch organizations with total member count
    const [orgs] = await pool.query(`
      SELECT 
        o.*,
        (SELECT COUNT(*) FROM ld_org_members m WHERE m.org_id = o.id) as employee_count,
        (SELECT COUNT(*) FROM ld_programs p WHERE p.org_id = o.id) as program_count
      FROM ld_organizations o
      WHERE o.deleted_at IS NULL
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [pagination.limit, offset]);

    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM ld_organizations WHERE deleted_at IS NULL');

    return { 
      organizations: orgs, 
      total, 
      page: pagination.page, 
      totalPages: Math.ceil(total / pagination.limit) 
    };
  }

  /**
   * 8. SKILL INTELLIGENCE
   * Aggregate platform-wide skill gap data and distribution.
   */
  async getSkillInsights() {
    const [topSkills] = await pool.query(`
      SELECT s.name, COUNT(sh.id) as proficiency_updates
      FROM ld_skills s
      JOIN ld_skill_history sh ON s.id = sh.skill_id
      GROUP BY s.id
      ORDER BY proficiency_updates DESC
      LIMIT 10
    `);

    const [[{ total_skills }]] = await pool.query('SELECT COUNT(*) as total_skills FROM ld_skills');
    const [[{ total_observations }]] = await pool.query('SELECT COUNT(*) as total_observations FROM ld_observations');

    return {
      topSkills,
      total_skills,
      total_observations
    };
  }

  /**
   * 9. ENTERPRISE ENROLLMENTS
   * Track program adoption and completion across all organizations.
   */
  async getEnterpriseEnrollments(days = 30) {
    const [enrollments] = await pool.query(`
      SELECT 
        DATE(e.enrolled_at) as date,
        COUNT(*) as total_enrollments,
        COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completions
      FROM ld_enrollments e
      WHERE e.enrolled_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(e.enrolled_at)
      ORDER BY date DESC
    `, [days]);

    return enrollments;
  }

  /**
   * 10. UNIFIED MASTER HEALTH
   * Union of Social + Corporate L&D Vital Signs
   */
  async getMasterPlatformHealth() {
    const [[socialStats]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as social_users,
        (SELECT COUNT(*) FROM payments WHERE status = 'captured') as social_transactions
    `);

    const [[corporateStats]] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM ld_organizations) as corporate_tenants,
        (SELECT COUNT(*) FROM ld_org_members) as enterprise_learners,
        (SELECT COUNT(*) FROM ld_programs) as active_programs
    `);

    return {
      social: socialStats,
      corporate: corporateStats,
      unification_status: 'operational',
      last_sync: new Date()
    };
  }

  /**
   * 11. UNIFIED USER ACTIVITY INTELLIGENCE
   * Aggregate all actions (posts, comments, likes, follows, sessions, reports) for a user.
   */
  /**
   * 11. UNIFIED USER ACTIVITY INTELLIGENCE (Enhanced with Date Filtering)
   */
  async getUserActivity(userId, page = 1, limit = 30, startDate = null, endDate = null, actionGroup = null) {
    const offset = (page - 1) * limit;
    const dateFilter = (startDate && endDate) ? ' AND created_at BETWEEN ? AND ?' : '';
    const dateParams = (startDate && endDate) ? [startDate, endDate] : [];

    const GROUP_TYPES = {
      posts:    ['post_created', 'comment_created'],
      social:   ['reaction_like', 'followed_user'],
      sessions: ['session_started'],
      reports:  ['report_filed'],
    };
    const typeList = actionGroup && GROUP_TYPES[actionGroup] ? GROUP_TYPES[actionGroup] : null;
    const typeFilter = typeList
      ? `AND action_type IN (${typeList.map(() => '?').join(',')})`
      : '';

    const innerQuery = `
      (SELECT _utf8mb4 'post_created' COLLATE utf8mb4_unicode_ci as action_type, _utf8mb4 'post' COLLATE utf8mb4_unicode_ci as entity_type, id as entity_id, LEFT(content, 150) as summary, created_at FROM posts WHERE user_id = ? ${dateFilter})
      UNION ALL
      (SELECT _utf8mb4 'comment_created' COLLATE utf8mb4_unicode_ci, _utf8mb4 'comment' COLLATE utf8mb4_unicode_ci, id, LEFT(content, 150), created_at FROM post_comments WHERE user_id = ? ${dateFilter})
      UNION ALL
      (SELECT CONVERT(CONCAT('reaction_', reaction_type) USING utf8mb4) COLLATE utf8mb4_unicode_ci, _utf8mb4 'post' COLLATE utf8mb4_unicode_ci, post_id, NULL, created_at FROM post_likes WHERE user_id = ? ${dateFilter})
      UNION ALL
      (SELECT _utf8mb4 'followed_user' COLLATE utf8mb4_unicode_ci, _utf8mb4 'user' COLLATE utf8mb4_unicode_ci, following_id, NULL, created_at FROM follows WHERE follower_id = ? ${dateFilter})
      UNION ALL
      (SELECT _utf8mb4 'session_started' COLLATE utf8mb4_unicode_ci, _utf8mb4 'session' COLLATE utf8mb4_unicode_ci, id, LEFT(device_info, 150), created_at FROM user_sessions WHERE user_id = ? ${dateFilter})
      UNION ALL
      (SELECT _utf8mb4 'report_filed' COLLATE utf8mb4_unicode_ci, _utf8mb4 'report' COLLATE utf8mb4_unicode_ci, id, reason, created_at FROM reports WHERE reporter_id = ? ${dateFilter})
      UNION ALL
      (SELECT CONVERT(action_type USING utf8mb4) COLLATE utf8mb4_unicode_ci, CONVERT(entity_type USING utf8mb4) COLLATE utf8mb4_unicode_ci, entity_id, CAST(metadata AS CHAR) COLLATE utf8mb4_unicode_ci, created_at FROM activity_log WHERE user_id = ? ${dateFilter})
    `;

    const innerParams = [];
    for (let i = 0; i < 7; i++) {
      innerParams.push(userId, ...dateParams);
    }
    const typeParams = typeList || [];

    const dataQuery  = `SELECT * FROM (${innerQuery}) AS ua WHERE 1=1 ${typeFilter} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as total FROM (${innerQuery}) AS ua WHERE 1=1 ${typeFilter}`;

    const [rows] = await pool.query(dataQuery,  [...innerParams, ...typeParams, limit, offset]);
    const [[{ total }]] = await pool.query(countQuery, [...innerParams, ...typeParams]);

    return { activities: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new AdminService();
