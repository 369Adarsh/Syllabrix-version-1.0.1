const { pool } = require('../../database/connection');

/**
 * ReportService: Generates structured, business-ready reports for Syllabrix Admin Intelligence.
 */
class ReportService {
  /**
   * USER GROWTH REPORT
   * Daily signups, demographic slices.
   */
  async generateGrowthReport(days = 30) {
    const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_signups,
        COUNT(CASE WHEN user_type = 'student' THEN 1 END) as students,
        COUNT(CASE WHEN user_type = 'teacher' THEN 1 END) as teachers,
        COUNT(CASE WHEN user_type = 'institute' THEN 1 END) as institutes
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [days]);

    return rows;
  }

  /**
   * FINANCIAL AUDIT REPORT
   * Detailed payment history with user context.
   */
  async generateFinancialAudit(days = 30) {
    const [rows] = await pool.query(`
      SELECT 
        p.id as transaction_id,
        u.full_name as user_name,
        u.email as user_email,
        p.payment_type,
        p.amount_inr,
        p.status,
        p.razorpay_payment_id,
        p.created_at as transaction_date
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY p.created_at DESC
    `, [days]);

    return rows;
  }

  /**
   * MODERATION IMPACT REPORT
   * Banned users, resolution times, strike counts.
   */
  async generateModerationImpact(days = 30) {
    const [rows] = await pool.query(`
      SELECT 
        r.id as report_id,
        reporter.username as reporter,
        reported.username as reported_user,
        r.reason,
        r.status,
        admin.username as reviewer,
        r.reviewed_at,
        TIMESTAMPDIFF(MINUTE, r.created_at, r.reviewed_at) as resolution_time_mins
      FROM reports r
      JOIN users reporter ON r.reporter_id = reporter.id
      JOIN users reported ON r.reported_user_id = reported.id
      LEFT JOIN users admin ON r.reviewer_note IS NOT NULL AND admin.user_type = 'syllabrix_admin'
      WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY r.created_at DESC
    `, [days]);

    return rows;
  }

  /**
   * PLATFORM HEALTH OVERVIEW
   * General vital signs.
   */
  async generatePlatformHealth() {
    const [stats] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users,
        (SELECT COUNT(*) FROM posts) as total_posts,
        (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports,
        (SELECT SUM(amount_inr) FROM payments WHERE status = 'captured') as total_revenue
    `);
    
    return stats[0];
  }
}

module.exports = new ReportService();
