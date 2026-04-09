// LD Skills Service — Skill Intelligence Engine (Epic 1)
const { ldPool: pool } = require('../../../database/connection');
const aiService = require('../../../services/ai.service');
const config = require('../../../config/env');

class LDSkillsService {

  // ─── TAXONOMY MANAGEMENT ────────────────────────────────

  async createSkill(orgId, { name, category, skill_type, synonyms, description }) {
    const [result] = await pool.query(
      `INSERT INTO ld_skills (org_id, name, category, skill_type, synonyms, description)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE category = VALUES(category), skill_type = VALUES(skill_type),
       synonyms = VALUES(synonyms), description = VALUES(description)`,
      [orgId, name, category || 'General', skill_type || 'technical',
       synonyms ? JSON.stringify(synonyms) : null, description]
    );
    return result.insertId || result.affectedRows;
  }

  async getSkills(orgId, { category, skill_type, search } = {}) {
    let where = 'org_id = ?';
    const params = [orgId];
    if (category) { where += ' AND category = ?'; params.push(category); }
    if (skill_type) { where += ' AND skill_type = ?'; params.push(skill_type); }
    if (search) { where += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const [rows] = await pool.query(
      `SELECT * FROM ld_skills WHERE ${where} ORDER BY category, name`, params
    );
    return rows;
  }

  async getSkillById(skillId, orgId) {
    const [rows] = await pool.query(`SELECT * FROM ld_skills WHERE id = ? AND org_id = ?`, [skillId, orgId]);
    return rows[0] || null;
  }

  // ─── ROLE-SKILL MAPPING ─────────────────────────────────

  async createRole(orgId, { title, department, level, description, jd_text }) {
    const [result] = await pool.query(
      `INSERT INTO ld_roles (org_id, title, department, level, description, jd_text)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orgId, title, department, level || 'mid', description, jd_text]
    );
    return result.insertId;
  }

  async getRoles(orgId, { department, level } = {}) {
    let where = 'org_id = ? AND is_active = 1';
    const params = [Number(orgId)];
    if (department) { where += ' AND department = ?'; params.push(department); }
    if (level) { where += ' AND level = ?'; params.push(level); }
    const [rows] = await pool.query(`SELECT * FROM ld_roles WHERE ${where} ORDER BY title ASC`, params);
    return rows;
  }

  async mapRoleSkill(orgId, roleId, skillId, requiredProficiency = 3, criticalityWeight = 5) {
    // Verify both belong to org
    const [[role]] = await pool.query(`SELECT id FROM ld_roles WHERE id = ? AND org_id = ?`, [roleId, orgId]);
    const [[skill]] = await pool.query(`SELECT id FROM ld_skills WHERE id = ? AND org_id = ?`, [skillId, orgId]);
    if (!role || !skill) throw new Error("Unauthorized mapping: role or skill doesn't belong to this organization");

    await pool.query(
      `INSERT INTO ld_role_skills (role_id, skill_id, required_proficiency, criticality_weight)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE required_proficiency = VALUES(required_proficiency),
       criticality_weight = VALUES(criticality_weight)`,
      [Number(roleId), Number(skillId), requiredProficiency, criticalityWeight]
    );
  }

  async getRoleSkills(roleId, orgId) {
    // Verify role belongs to org
    const [[role]] = await pool.query(`SELECT id FROM ld_roles WHERE id = ? AND org_id = ?`, [roleId, orgId]);
    if (!role) throw new Error("Unauthorized role access");

    const [rows] = await pool.query(
      `SELECT rs.*, s.name as skill_name, s.category, s.skill_type
       FROM ld_role_skills rs
       JOIN ld_skills s ON rs.skill_id = s.id
       WHERE rs.role_id = ?
       ORDER BY rs.criticality_weight DESC, s.name`,
      [Number(roleId)]
    );
    return rows;
  }

  // ─── AI-POWERED SKILL EXTRACTION FROM JD ────────────────

  async extractSkillsFromJD(orgId, jdText) {
    const prompt = `You are a skill taxonomy expert for corporate L&D. 
Analyze this Job Description and extract ALL required skills.

JD Text:
"""
${jdText}
"""

Return a JSON object with a property "skills" containing an array of extracted skills. For each skill object include:
- skill: The skill name (normalized, e.g. "JavaScript" not "JS")
- type: One of: "Technical", "Soft Skills", "Domain Knowledge", "Leadership", "Compliance"
- importance: "high", "medium", or "low" based on how critical it is
- context: A short phrase describing how it's used in this role`;

    try {
      const resultObj = await aiService.generateJSON(prompt);
      return { skills: Array.isArray(resultObj?.skills) ? resultObj.skills : [] };
    } catch (e) {
      console.error('Failed to extract skills:', e);
      return { skills: [] };
    }
  }

  async importSkillsFromCSV(orgId, csvRows) {
    // csvRows = [{role_title, department, level, jd_text}]
    const results = [];
    for (const row of csvRows) {
      // Create or update role
      const roleId = await this.createRole(orgId, {
        title: row.role_title,
        department: row.department,
        level: row.level || 'mid',
        jd_text: row.jd_text,
      });

      // AI-extract skills from JD
      const extractResult = await this.extractSkillsFromJD(orgId, row.jd_text);
      const extractedSkills = extractResult.skills || [];

      // Normalize and save skills + mappings
      for (const sk of extractedSkills) {
        const normalized = this.normalizeSkillName(sk.skill);
        await this.createSkill(orgId, {
          name: normalized,
          category: sk.type || 'Technical',
          skill_type: (sk.type || '').toLowerCase().includes('soft') ? 'soft' : 'technical',
          description: sk.context || null,
        });
        // Get skill ID
        const [skillRows] = await pool.query(
          `SELECT id FROM ld_skills WHERE org_id = ? AND name = ?`, [orgId, normalized]
        );
        if (skillRows[0]) {
          const prof = sk.importance === 'high' ? 4 : (sk.importance === 'medium' ? 3 : 2);
          const crit = sk.importance === 'high' ? 8 : (sk.importance === 'medium' ? 5 : 3);
          await this.mapRoleSkill(roleId, skillRows[0].id, prof, crit);
        }
      }

      results.push({ role: row.role_title, skills_extracted: extractedSkills.length, role_id: roleId });
    }
    return results;
  }

  normalizeSkillName(name) {
    const synonymMap = {
      'js': 'JavaScript', 'javascript': 'JavaScript', 'ts': 'TypeScript', 'typescript': 'TypeScript',
      'py': 'Python', 'python': 'Python', 'react.js': 'React', 'reactjs': 'React', 'react': 'React',
      'node.js': 'Node.js', 'nodejs': 'Node.js', 'node': 'Node.js',
      'sql': 'SQL', 'mysql': 'MySQL', 'postgres': 'PostgreSQL', 'postgresql': 'PostgreSQL',
      'ml': 'Machine Learning', 'ai': 'Artificial Intelligence', 'dl': 'Deep Learning',
      'communication': 'Communication', 'leadership': 'Leadership', 'teamwork': 'Teamwork',
    };
    const lower = name.toLowerCase().trim();
    return synonymMap[lower] || name.trim();
  }

  // ─── EMPLOYEE SKILL PROFILES ────────────────────────────

  async submitSelfAssessment(userId, orgId, ratings) {
    // ratings = [{skill_id, rating}]
    for (const r of ratings) {
      // Upsert skill profile
      await pool.query(
        `INSERT INTO ld_skill_profiles (user_id, skill_id, org_id, self_rating, assessed_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE self_rating = VALUES(self_rating), assessed_at = NOW()`,
        [userId, r.skill_id, orgId, r.rating]
      );
      // Recalculate composite
      await this.recalculateComposite(userId, r.skill_id);
      // Log history
      await pool.query(
        `INSERT INTO ld_skill_history (profile_id, source, new_value)
         SELECT id, 'self', ? FROM ld_skill_profiles WHERE user_id = ? AND skill_id = ?`,
        [r.rating, userId, r.skill_id]
      );
    }
  }

  async submitManagerRating(managerId, employeeId, orgId, ratings) {
    for (const r of ratings) {
      await pool.query(
        `INSERT INTO ld_skill_profiles (user_id, skill_id, org_id, manager_rating, assessed_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE manager_rating = VALUES(manager_rating), assessed_at = NOW()`,
        [employeeId, r.skill_id, orgId, r.rating]
      );
      await this.recalculateComposite(employeeId, r.skill_id);
      await pool.query(
        `INSERT INTO ld_skill_history (profile_id, source, new_value, notes)
         SELECT id, 'manager', ?, CONCAT('Rated by manager ID=', ?)
         FROM ld_skill_profiles WHERE user_id = ? AND skill_id = ?`,
        [r.rating, managerId, employeeId, r.skill_id]
      );
    }
  }

  async recalculateComposite(userId, skillId) {
    // Composite = 40% self + 50% manager + 10% AI (if available)
    await pool.query(
      `UPDATE ld_skill_profiles
       SET composite_score = ROUND(
         COALESCE(self_rating, 0) * 0.4 +
         COALESCE(manager_rating, self_rating, 0) * 0.5 +
         COALESCE(ai_inferred, self_rating, 0) * 0.1, 2
       )
       WHERE user_id = ? AND skill_id = ?`,
      [userId, skillId]
    );
  }

  // ─── GAP ANALYSIS ENGINE ────────────────────────────────

  async getEmployeeGaps(userId, orgId) {
    const [rows] = await pool.query(
      `SELECT
         s.id as skill_id, s.name as skill_name, s.category, s.skill_type,
         rs.required_proficiency, rs.criticality_weight,
         sp.self_rating, sp.manager_rating, sp.composite_score,
         GREATEST(0, rs.required_proficiency - COALESCE(sp.composite_score, 0)) as gap,
         ROUND(GREATEST(0, rs.required_proficiency - COALESCE(sp.composite_score, 0)) * rs.criticality_weight, 2) as weighted_gap
       FROM ld_org_members m
       JOIN ld_roles r ON r.org_id = m.org_id AND r.title = m.job_title AND r.is_active = 1
       JOIN ld_role_skills rs ON rs.role_id = r.id
       JOIN ld_skills s ON s.id = rs.skill_id
       LEFT JOIN ld_skill_profiles sp ON sp.user_id = m.user_id AND sp.skill_id = s.id
       WHERE m.user_id = ? AND m.org_id = ?
       ORDER BY weighted_gap DESC`,
      [userId, orgId]
    );
    return rows;
  }

  async getTeamGapHeatmap(orgId, { department, team } = {}) {
    let where = 'm.org_id = ? AND m.status = "active"';
    const params = [orgId];
    if (department) { where += ' AND m.department = ?'; params.push(department); }
    if (team) { where += ' AND m.team = ?'; params.push(team); }

    const [rows] = await pool.query(
      `SELECT
         m.user_id, u.username as full_name, m.department, m.job_title,
         s.id as skill_id, s.name as skill_name, s.category,
         rs.required_proficiency,
         COALESCE(sp.composite_score, 0) as current_score,
         GREATEST(0, rs.required_proficiency - COALESCE(sp.composite_score, 0)) as gap
       FROM ld_org_members m
       LEFT JOIN ${config.DB_SOCIAL.NAME}.users u ON u.id = m.user_id
       LEFT JOIN ld_roles r ON r.org_id = m.org_id AND r.title = m.job_title AND r.is_active = 1
       LEFT JOIN ld_role_skills rs ON rs.role_id = r.id
       LEFT JOIN ld_skills s ON s.id = rs.skill_id
       LEFT JOIN ld_skill_profiles sp ON sp.user_id = m.user_id AND sp.skill_id = s.id
       WHERE ${where} AND s.id IS NOT NULL
       ORDER BY m.department, u.username, s.category, s.name`,
      params
    );
    return rows;
  }

  async getOrgGapSummary(orgId) {
    const [rows] = await pool.query(
      `SELECT
         s.id, s.name, s.category, s.skill_type,
         COUNT(DISTINCT sp.user_id) as employees_assessed,
         ROUND(AVG(COALESCE(sp.composite_score, 0)), 2) as avg_score,
         ROUND(AVG(rs.required_proficiency), 2) as avg_required,
         ROUND(AVG(GREATEST(0, rs.required_proficiency - COALESCE(sp.composite_score, 0))), 2) as avg_gap
       FROM ld_skills s
       LEFT JOIN ld_role_skills rs ON rs.skill_id = s.id
       LEFT JOIN ld_skill_profiles sp ON sp.skill_id = s.id AND sp.org_id = s.org_id
       WHERE s.org_id = ?
       GROUP BY s.id
       ORDER BY avg_gap DESC`,
      [orgId]
    );
    return rows;
  }

  async getEmployeeProfile(userId, orgId) {
    const [skills] = await pool.query(
      `SELECT sp.*, s.name as skill_name, s.category, s.skill_type
       FROM ld_skill_profiles sp
       JOIN ld_skills s ON s.id = sp.skill_id
       WHERE sp.user_id = ? AND sp.org_id = ?
       ORDER BY s.category, s.name`,
      [userId, orgId]
    );
    const [history] = await pool.query(
      `SELECT sh.*, sp.skill_id
       FROM ld_skill_history sh
       JOIN ld_skill_profiles sp ON sp.id = sh.profile_id
       WHERE sp.user_id = ? AND sp.org_id = ?
       ORDER BY sh.created_at DESC LIMIT 50`,
      [userId, orgId]
    );
    return { skills, history };
  }

  // ─── TALENT & CAREER INTEGRATION ────────────────────────

  async generateCareerRoadmap(orgId, userId, targetRoleId) {
    // 1. Fetch target role requirements
    const targetSkills = await this.getRoleSkills(targetRoleId, orgId);
    if (!targetSkills.length) throw new Error("Target role has no defined skill requirements");

    // 2. Fetch user's current profile
    const profile = await this.getEmployeeProfile(userId, orgId);
    const userSkills = profile.skills || [];

    // 3. Calculate Gaps against Target Role
    const gaps = targetSkills.map(ts => {
      const us = userSkills.find(s => s.skill_id === ts.skill_id);
      const current = us ? us.composite_score : 0;
      return {
        skill_id: ts.skill_id,
        skill_name: ts.skill_name,
        required: ts.required_proficiency,
        current: current,
        gap: Math.max(0, ts.required_proficiency - current)
      };
    }).filter(g => g.gap > 0).sort((a, b) => b.gap - a.gap);

    // 4. Find matching programs
    const [programs] = await pool.query(
      `SELECT id, title, description, target_skill_id, difficulty, duration_hours
       FROM ld_programs WHERE org_id = ? AND status = 'published' AND deleted_at IS NULL`,
      [orgId]
    );

    const relevantPrograms = programs.filter(p => gaps.some(g => g.skill_id === p.target_skill_id));

    // 5. AI Generation
    const [[role]] = await pool.query(`SELECT title FROM ld_roles WHERE id = ?`, [targetRoleId]);
    const [[user]] = await pool.query(`SELECT username FROM ${config.DB_SOCIAL.NAME}.users WHERE id = ?`, [userId]);

    const prompt = `You are a career development coach. Create a 3-step learning roadmap for ${user?.username || 'the employee'} to transition into the role of "${role?.title || 'Target Role'}".
    
    Current Skill Gaps to bridge:
    ${gaps.map(g => `- ${g.skill_name}: Needs ${g.required}, Current ${g.current}`).join('\n')}
    
    Available Programs:
    ${relevantPrograms.map(p => `- ${p.title} (${p.difficulty}, ~${p.duration_hours}h)`).join('\n')}
    
    Task: Select the top 3 programs that should be taken FIRST. Provide a brief rationale for the sequence and an estimated total timeline (in weeks). 
    Format as a professional roadmap.`;

    const roadmap = await aiService.chat([], prompt, "You are a career growth architect.", { task: 'career' });
    return {
      target_role: role?.title,
      gaps: gaps,
      roadmap_text: roadmap
    };
  }
}

module.exports = new LDSkillsService();
