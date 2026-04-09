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
        u.id, u.username, u.full_name, u.email, u.user_type, u.admin_role,
        u.is_active, u.is_profile_complete, u.created_at,
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
      query += ' AND (u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
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

  async getAuditLogs(pagination = { page: 1, limit: 20 }) {
    const offset = (pagination.page - 1) * pagination.limit;
    const [logs] = await pool.query(`
      SELECT l.*, u.username as admin_name 
      FROM admin_audit_logs l
      LEFT JOIN users u ON l.admin_id = u.id
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [pagination.limit, offset]);
    
    return logs;
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
  async getUserActivity(userId, limit = 50, startDate = null, endDate = null) {
    const dateFilter = (startDate && endDate) ? ' AND created_at BETWEEN ? AND ?' : '';
    const dateParams = (startDate && endDate) ? [startDate, endDate] : [];
    
    const subQuery = (table, userField, extraCols = '') => `
      (SELECT _utf8mb4 '${table}_action' COLLATE utf8mb4_unicode_ci as action_type, 
              _utf8mb4 '${table.replace('post_', '')}' COLLATE utf8mb4_unicode_ci as entity_type, 
              id as entity_id, ${extraCols || 'NULL'} as summary, created_at 
       FROM ${table} WHERE ${userField} = ? ${dateFilter})
    `;

    // Specialized sub-queries for non-standard columns
    const query = `
      (SELECT _utf8mb4 'post_created' COLLATE utf8mb4_unicode_ci as action_type, _utf8mb4 'post' COLLATE utf8mb4_unicode_ci as entity_type, id as entity_id, LEFT(content, 100) as summary, created_at FROM posts WHERE user_id = ? ${dateFilter})
      UNION ALL
      (SELECT _utf8mb4 'comment_created' COLLATE utf8mb4_unicode_ci, _utf8mb4 'comment' COLLATE utf8mb4_unicode_ci, id, LEFT(content, 100), created_at FROM post_comments WHERE user_id = ? ${dateFilter})
      UNION ALL
      (SELECT CONVERT(CONCAT('reaction_', reaction_type) USING utf8mb4) COLLATE utf8mb4_unicode_ci, _utf8mb4 'post' COLLATE utf8mb4_unicode_ci, post_id, NULL, created_at FROM post_likes WHERE user_id = ? ${dateFilter})
      UNION ALL
      (SELECT _utf8mb4 'followed_user' COLLATE utf8mb4_unicode_ci, _utf8mb4 'user' COLLATE utf8mb4_unicode_ci, following_id, NULL, created_at FROM follows WHERE follower_id = ? ${dateFilter})
      UNION ALL
      (SELECT _utf8mb4 'session_started' COLLATE utf8mb4_unicode_ci, _utf8mb4 'session' COLLATE utf8mb4_unicode_ci, id, LEFT(device_info, 100), created_at FROM user_sessions WHERE user_id = ? ${dateFilter})
      UNION ALL
      (SELECT _utf8mb4 'report_filed' COLLATE utf8mb4_unicode_ci, _utf8mb4 'report' COLLATE utf8mb4_unicode_ci, id, reason, created_at FROM reports WHERE reporter_id = ? ${dateFilter})
      UNION ALL
      (SELECT CONVERT(action_type USING utf8mb4) COLLATE utf8mb4_unicode_ci, CONVERT(entity_type USING utf8mb4) COLLATE utf8mb4_unicode_ci, entity_id, CAST(metadata AS CHAR) COLLATE utf8mb4_unicode_ci, created_at FROM activity_log WHERE user_id = ? ${dateFilter})
      ORDER BY created_at DESC
      LIMIT ?
    `;

    // Flatten parameters
    const params = [];
    for (let i = 0; i < 7; i++) {
      params.push(userId, ...dateParams);
    }
    params.push(limit);

    const [rows] = await pool.query(query, params);
    return rows;
  }
}

module.exports = new AdminService();
