// LD LMS Service — Learning Management System (Epic 3)
const { ldPool: pool } = require('../../../database/connection');

class LDLmsService {

  // ─── ENROLLMENT ─────────────────────────────────────────

  async enrollUser(userId, programId, orgId, { due_date } = {}) {
    // Check if program has a pre-test
    const [preTests] = await pool.query(
      `SELECT id FROM ld_assessments WHERE program_id = ? AND assessment_type = 'pre_test' LIMIT 1`,
      [programId]
    );

    await pool.query(
      `INSERT INTO ld_enrollments (user_id, program_id, org_id, due_date)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = 'enrolled', due_date = COALESCE(VALUES(due_date), due_date)`,
      [userId, programId, orgId, due_date]
    );

    // Create module progress records
    const [modules] = await pool.query(
      `SELECT id FROM ld_modules WHERE program_id = ? ORDER BY order_index`, [programId]
    );
    const [enrollment] = await pool.query(
      `SELECT id FROM ld_enrollments WHERE user_id = ? AND program_id = ?`, [userId, programId]
    );

    if (enrollment[0]) {
      for (let i = 0; i < modules.length; i++) {
        await pool.query(
          `INSERT IGNORE INTO ld_module_progress (enrollment_id, module_id, status)
           VALUES (?, ?, ?)`,
          [enrollment[0].id, modules[i].id, i === 0 ? 'available' : 'locked']
        );
      }
    }

    return { enrollment_id: enrollment[0]?.id, has_pre_test: preTests.length > 0 };
  }

  async bulkEnroll(userIds, programId, orgId, { due_date } = {}) {
    const results = [];
    for (const userId of userIds) {
      const r = await this.enrollUser(userId, programId, orgId, { due_date });
      results.push({ user_id: userId, ...r });
    }
    return results;
  }

  // ─── LEARNER FEED ───────────────────────────────────────

  async getLearnerFeed(userId, orgId) {
    // Active enrollments
    const [enrolled] = await pool.query(
      `SELECT e.*, p.title, p.description, p.program_type, p.cover_image_url, p.difficulty, p.duration_hours,
         s.name as skill_name
       FROM ld_enrollments e
       JOIN ld_programs p ON e.program_id = p.id
       LEFT JOIN ld_skills s ON p.target_skill_id = s.id
       WHERE e.user_id = ? AND e.org_id = ? AND e.status IN ('enrolled', 'in_progress')
       ORDER BY 
         CASE WHEN e.status = 'in_progress' THEN 0 ELSE 1 END,
         e.due_date ASC`,
      [userId, orgId]
    );

    // Completed courses
    const [completed] = await pool.query(
      `SELECT e.*, p.title, p.program_type, p.difficulty
       FROM ld_enrollments e
       JOIN ld_programs p ON e.program_id = p.id
       WHERE e.user_id = ? AND e.org_id = ? AND e.status = 'completed'
       ORDER BY e.completed_at DESC LIMIT 10`,
      [userId, orgId]
    );

    // Recommended (published programs not yet enrolled)
    const [recommended] = await pool.query(
      `SELECT p.*, s.name as skill_name
       FROM ld_programs p
       LEFT JOIN ld_skills s ON p.target_skill_id = s.id
       WHERE p.org_id = ? AND p.status = 'published' AND p.deleted_at IS NULL
         AND p.id NOT IN (SELECT program_id FROM ld_enrollments WHERE user_id = ?)
       ORDER BY p.published_at DESC LIMIT 10`,
      [orgId, userId]
    );

    return { enrolled, completed, recommended };
  }

  // ─── MODULE PROGRESS ───────────────────────────────────

  async startModule(enrollmentId, moduleId, orgId) {
    // Verify org_id
    const [[access]] = await pool.query(`SELECT id FROM ld_enrollments WHERE id = ? AND org_id = ?`, [enrollmentId, orgId]);
    if (!access) throw new Error("Unauthorized enrollment access");

    await pool.query(
      `UPDATE ld_module_progress SET status = 'in_progress', started_at = NOW()
       WHERE enrollment_id = ? AND module_id = ? AND status = 'available'`,
      [enrollmentId, moduleId]
    );
    // Update enrollment status
    await pool.query(
      `UPDATE ld_enrollments SET status = 'in_progress', started_at = COALESCE(started_at, NOW())
       WHERE id = ?`,
      [enrollmentId]
    );
  }

  async completeModule(enrollmentId, moduleId, orgId, { score, time_spent_sec } = {}) {
    // Verify org_id
    const [[access]] = await pool.query(`SELECT id FROM ld_enrollments WHERE id = ? AND org_id = ?`, [enrollmentId, orgId]);
    if (!access) throw new Error("Unauthorized enrollment access");

    await pool.query(
      `UPDATE ld_module_progress SET status = 'completed', score = ?, time_spent_sec = ?, completed_at = NOW()
       WHERE enrollment_id = ? AND module_id = ?`,
      [score, time_spent_sec || 0, enrollmentId, moduleId]
    );

    // Unlock next module
    const [nextModule] = await pool.query(
      `SELECT mp.id, mp.module_id FROM ld_module_progress mp
       JOIN ld_modules m ON m.id = mp.module_id
       WHERE mp.enrollment_id = ? AND mp.status = 'locked'
       ORDER BY m.order_index ASC LIMIT 1`,
      [enrollmentId]
    );
    if (nextModule[0]) {
      await pool.query(
        `UPDATE ld_module_progress SET status = 'available' WHERE id = ?`, [nextModule[0].id]
      );
    }

    // Recalculate overall progress
    await this.recalculateProgress(enrollmentId);
  }

  async recalculateProgress(enrollmentId) {
    const [[stats]] = await pool.query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done
       FROM ld_module_progress WHERE enrollment_id = ?`,
      [enrollmentId]
    );
    const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

    await pool.query(
      `UPDATE ld_enrollments SET progress_pct = ? WHERE id = ?`, [pct, enrollmentId]
    );

    // If all complete → mark enrollment complete
    if (pct >= 100) {
      await pool.query(
        `UPDATE ld_enrollments SET status = 'completed', completed_at = NOW() WHERE id = ?`,
        [enrollmentId]
      );
      // Trigger skill profile update
      await this.updateSkillOnCompletion(enrollmentId);
      // Trigger Spaced Repetition (Reinforce Stage)
      await this.scheduleSpacedRepetition(enrollmentId);
    }
  }

  async updateSkillOnCompletion(enrollmentId) {
    const [[enrollment]] = await pool.query(
      `SELECT e.user_id, e.org_id, p.target_skill_id, p.difficulty
       FROM ld_enrollments e
       JOIN ld_programs p ON e.program_id = p.id
       WHERE e.id = ?`,
      [enrollmentId]
    );

    if (enrollment && enrollment.target_skill_id) {
      // Logic: Bonus +0.5 to AI Inferred score upon completion
      // Difficulty multiplier: beginner=0.3, intermediate=0.5, advanced=0.8
      const bonus = enrollment.difficulty === 'advanced' ? 0.8 : (enrollment.difficulty === 'beginner' ? 0.3 : 0.5);
      
      await pool.query(
        `INSERT INTO ld_skill_profiles (user_id, skill_id, org_id, ai_inferred, assessed_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
           ai_inferred = LEAST(5, COALESCE(ai_inferred, 0) + ?),
           assessed_at = NOW()`,
        [enrollment.user_id, enrollment.target_skill_id, enrollment.org_id, bonus, bonus]
      );

      // Recalculate composite via skills service
      const skillsService = require('../ld-skills/ld-skills.service');
      await skillsService.recalculateComposite(enrollment.user_id, enrollment.target_skill_id);
    }
  }

  async scheduleSpacedRepetition(enrollmentId) {
    const [[enrollment]] = await pool.query(
      `SELECT user_id, program_id, org_id FROM ld_enrollments WHERE id = ?`, [enrollmentId]
    );
    if (!enrollment) return;

    const intervals = [1, 7, 14, 30]; // Days
    for (const days of intervals) {
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + days);

      await pool.query(
        `INSERT IGNORE INTO ld_repetition_schedule (user_id, program_id, nudge_day, scheduled_for, status)
         VALUES (?, ?, ?, ?, 'scheduled')`,
        [enrollment.user_id, enrollment.program_id, days, scheduledFor]
      );
    }
  }

  // ─── ASSESSMENT SUBMISSION ──────────────────────────────

  async submitAssessment(userId, assessmentId, answers) {
    const [assessment] = await pool.query(`SELECT * FROM ld_assessments WHERE id = ?`, [assessmentId]);
    if (!assessment[0]) throw new Error('Assessment not found');

    const a = assessment[0];
    const questions = typeof a.questions === 'string' ? JSON.parse(a.questions) : a.questions;
    let correct = 0;
    const total = questions.length;
    const results = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const userAnswer = answers[i];
      let isCorrect = false;

      if (q.type === 'open_ended') {
        isCorrect = true; // Open-ended auto-pass, evaluated separately
        correct++;
      } else if (q.type === 'true_false') {
        isCorrect = String(userAnswer).toLowerCase() === String(q.correct).toLowerCase();
        if (isCorrect) correct++;
      } else {
        isCorrect = Number(userAnswer) === Number(q.correct);
        if (isCorrect) correct++;
      }

      results.push({ question: q.q, userAnswer, correct: q.correct, isCorrect, explanation: q.explanation });
    }

    const score = Math.round((correct / total) * 100);
    const passed = score >= (a.passing_score || 60);

    // Save score to enrollment
    const [enrollment] = await pool.query(
      `SELECT id FROM ld_enrollments WHERE user_id = ? AND program_id = ?`,
      [userId, a.program_id]
    );

    if (enrollment[0]) {
      if (a.assessment_type === 'pre_test') {
        await pool.query(`UPDATE ld_enrollments SET pre_score = ? WHERE id = ?`, [score, enrollment[0].id]);
      } else if (a.assessment_type === 'post_test') {
        await pool.query(
          `UPDATE ld_enrollments SET post_score = ?, l2_gain_pct = ? - COALESCE(pre_score, 0) WHERE id = ?`,
          [score, score, enrollment[0].id]
        );
      }
    }

    return { score, passed, total, correct, results };
  }

  // ─── ADAPTIVE PATH LOGIC ───────────────────────────────

  async getAdaptiveRecommendation(enrollmentId, moduleId, score) {
    if (score < 60) {
      return {
        action: 'remediate',
        message: 'Your score suggests you need more practice. We\'ve added review material.',
        next_step: 'Review the module again and focus on the areas you missed.',
      };
    } else if (score > 90) {
      return {
        action: 'accelerate',
        message: 'Excellent! You\'re ahead. You can skip to the next advanced module.',
        next_step: 'Move to the next module or try a bonus challenge.',
      };
    }
    return {
      action: 'continue',
      message: 'Good progress! Continue to the next module.',
      next_step: 'Proceed to the next section.',
    };
  }

  // ─── COMPLIANCE TRACKING ────────────────────────────────

  async getComplianceStatus(orgId) {
    const [rows] = await pool.query(
      `SELECT p.id, p.title, p.compliance_deadline,
         COUNT(e.id) as total_enrolled,
         SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN e.due_date < NOW() AND e.status != 'completed' THEN 1 ELSE 0 END) as overdue
       FROM ld_programs p
       JOIN ld_enrollments e ON e.program_id = p.id AND e.org_id = p.org_id
       WHERE p.org_id = ? AND p.is_mandatory = 1 AND p.deleted_at IS NULL
       GROUP BY p.id
       ORDER BY p.compliance_deadline ASC`,
      [orgId]
    );
    return rows;
  }

  // ─── LEARNER STATS ──────────────────────────────────────

  async getLearnerStats(userId, orgId) {
    const [[enrolled]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM ld_enrollments WHERE user_id = ? AND org_id = ?`, [userId, orgId]
    );
    const [[completed]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM ld_enrollments WHERE user_id = ? AND org_id = ? AND status = 'completed'`, [userId, orgId]
    );
    const [[inProgress]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM ld_enrollments WHERE user_id = ? AND org_id = ? AND status = 'in_progress'`, [userId, orgId]
    );
    const [[totalTime]] = await pool.query(
      `SELECT COALESCE(SUM(mp.time_spent_sec), 0) as total_sec
       FROM ld_module_progress mp
       JOIN ld_enrollments e ON mp.enrollment_id = e.id
       WHERE e.user_id = ? AND e.org_id = ?`,
      [userId, orgId]
    );
    const [[avgScore]] = await pool.query(
      `SELECT ROUND(AVG(post_score), 1) as avg FROM ld_enrollments WHERE user_id = ? AND org_id = ? AND post_score IS NOT NULL`,
      [userId, orgId]
    );

    return {
      enrolled: enrolled.cnt,
      completed: completed.cnt,
      in_progress: inProgress.cnt,
      total_learning_hours: Math.round(totalTime.total_sec / 3600 * 10) / 10,
      avg_score: avgScore.avg || 0,
    };
  }

  // ─── ENROLLMENT DETAILS & RAG CHAT ────────────────────────

  async getEnrollmentDetails(userId, enrollmentId, orgId) {
    const [[enrollment]] = await pool.query(
      `SELECT e.*, p.title, p.description, p.program_type
       FROM ld_enrollments e
       JOIN ld_programs p ON e.program_id = p.id
       WHERE e.id = ? AND e.user_id = ? AND e.org_id = ?`,
      [enrollmentId, userId, orgId]
    );

    if (!enrollment) throw new Error("Enrollment not found");

    const [modules] = await pool.query(
      `SELECT m.id, m.title, m.module_type, m.order_index, m.content, m.content_format, m.duration_min,
         mp.status, mp.score, mp.time_spent_sec
       FROM ld_modules m
       LEFT JOIN ld_module_progress mp ON mp.module_id = m.id AND mp.enrollment_id = ?
       WHERE m.program_id = ?
       ORDER BY m.order_index ASC`,
      [enrollmentId, enrollment.program_id]
    );

    const [assessments] = await pool.query(
      `SELECT a.id, a.title, a.assessment_type, a.passing_score
       FROM ld_assessments a
       WHERE a.program_id = ?`,
       [enrollment.program_id]
    );

    return { enrollment, modules, assessments };
  }

  async chatWithCoach(userId, enrollmentId, moduleId, orgId, message, history = []) {
    const [[access]] = await pool.query(`SELECT id FROM ld_enrollments WHERE id = ? AND user_id = ? AND org_id = ?`, [enrollmentId, userId, orgId]);
    if (!access) throw new Error("Unauthorized");

    const [[mod]] = await pool.query(`SELECT title, content FROM ld_modules WHERE id = ?`, [moduleId]);
    if (!mod) throw new Error("Module not found");

    const aiService = require('../../../services/ai.service');

    const systemPrompt = `You are a helpful, expert corporate L&D AI Coach. The learner is currently studying a module titled "${mod.title}".
    
Here is the strict content of the module they are learning:
"""
${mod.content || 'No text available.'}
"""

Instructions:
1. Answer the learner's question accurately, basing your facts ONLY on the provided module content.
2. If their question asks something unrelated to the module content, politely steer them back to the topic. Do not answer questions outside of the corporate context.
3. Keep your answers concise, engaging, encouraging, and clear. Use markdown formatting to make reading easier.
`;

    const result = await aiService.chat(history, message, systemPrompt, { task: 'education' });
    return result;
  }

  // ─── SPACED REPETITION (REINFORCE STAGE) ─────────────────

  async getReinforcements(userId, orgId) {
    const [rows] = await pool.query(
      `SELECT rs.*, p.title as program_title, p.difficulty
       FROM ld_repetition_schedule rs
       JOIN ld_programs p ON rs.program_id = p.id
       WHERE rs.user_id = ? AND p.org_id = ? AND rs.scheduled_for <= NOW() AND rs.status = 'scheduled'
       ORDER BY rs.scheduled_for ASC LIMIT 5`,
      [userId, orgId]
    );

    // If we have due reinforcements, we might want to generate a "nugget" if not already there
    // For this implementation, we'll return the schedule items
    return rows;
  }

  async markReinforcementComplete(userId, scheduleId) {
    await pool.query(
      `UPDATE ld_repetition_schedule SET status = 'completed', completed_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [scheduleId, userId]
    );
  }
}

module.exports = new LDLmsService();
