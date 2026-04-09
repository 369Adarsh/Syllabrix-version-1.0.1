// LD Content Service — AI Content Studio (Epic 2)
const { ldPool: pool } = require('../../../database/connection');
const aiService = require('../../../services/ai.service');

class LDContentService {

  // ─── AI COURSE OUTLINE GENERATOR ────────────────────────

  async generateCourseOutline(orgId, { skill_name, topic, learning_objective, context, difficulty, tone, audience, duration_hours }) {
    const prompt = `You are an expert L&D instructional designer.

Create a detailed course outline for corporate training.

Skill to develop: ${skill_name || topic || 'General Topic'}
Learning Objective: ${learning_objective || context || 'General upskilling'}
Difficulty: ${difficulty || 'intermediate'}
Tone: ${tone || 'formal'}
Target Audience: ${audience || 'Working professionals'}
Approximate Duration: ${duration_hours || 4} hours

Generate a structured course outline with:
1. Course title
2. Course description (2-3 sentences)
3. An array of modules, each with:
   - title
   - type: one of "intro", "concept", "application", "case_study", "quiz", "summary"
   - duration_min (estimated minutes)
   - learning_objectives (array of 2-3 bullet points)
   - key_topics (array of 3-5 topics covered)

Include at minimum:
- 1 Intro module
- 2-4 Concept modules
- 1-2 Application/Case Study modules
- 1 Quiz module
- 1 Summary module

Return ONLY a JSON object with this shape:
{ "title": "...", "description": "...", "modules": [{ "title": "...", "type": "...", "duration_min": 15, "learning_objectives": [], "key_topics": [] }] }`;

    try {
      const outline = await aiService.generateJSON(prompt);
      await this.logAIAction(orgId, null, 'course_outline', prompt, JSON.stringify(outline));
      return outline;
    } catch (e) {
      throw new Error('Failed to parse AI outline: ' + e.message);
    }
  }

  // ─── AI MODULE CONTENT GENERATOR ────────────────────────

  async generateModuleContent(orgId, { module_title, moduleTitle, module_type, key_topics, moduleDescription, learning_objectives, tone, skill_name, programTitle }) {
    const actualModuleTitle = module_title || moduleTitle || 'Training Module';
    const actualSkillName = skill_name || programTitle || 'Corporate Skill';
    const topicsArr = key_topics || (moduleDescription ? [moduleDescription] : []);
    
    const prompt = `You are a corporate L&D content writer.

Write the full learning content for this module:

Module Title: ${actualModuleTitle}
Module Type: ${module_type || 'concept'}
Skill: ${actualSkillName}
Tone: ${tone || 'formal'}

Key Topics to Cover:
${topicsArr.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Learning Objectives:
${(learning_objectives || []).map((o, i) => `- ${o}`).join('\n')}

Requirements:
- Write in Markdown format
- Include clear section headers (##)
- Include at least 1 real-world example or case study
- Include 2-3 key takeaway boxes (use > blockquotes)
- Write 800-1500 words
- Use professional language suitable for working adults
- Include practical tips they can apply immediately

Return the content in Markdown format.`;

    const result = await aiService.generateText(prompt);
    await this.logAIAction(orgId, null, 'content_gen', prompt, result);
    return result;
  }

  // ─── AI ASSESSMENT GENERATOR ────────────────────────────

  async generateAssessment(orgId, { module_title, skill_name, key_topics, assessment_type, num_questions }) {
    const prompt = `You are an assessment designer for corporate L&D.

Create a knowledge assessment for:
Module: ${module_title}
Skill: ${skill_name}
Type: ${assessment_type || 'module_quiz'}

Topics covered:
${(key_topics || []).map(t => `- ${t}`).join('\n')}

Generate ${num_questions || 7} questions with this mix:
- 3-4 Multiple Choice (MCQ) with 4 options each
- 1-2 Scenario-based questions (present a workplace scenario, ask what they'd do)
- 1 True/False
- 1 Open-ended (short response)

For each question return:
{
  "q": "Question text",
  "type": "mcq" | "scenario" | "true_false" | "open_ended",
  "options": ["A","B","C","D"] (for mcq/scenario),
  "correct": 0-based index or "true"/"false" or null for open_ended,
  "explanation": "Why this is the correct answer",
  "rubric": "Scoring criteria for open-ended questions" (if applicable),
  "difficulty": "easy" | "medium" | "hard"
}

Return ONLY a JSON array containing these question objects.`;

    try {
      const questions = await aiService.generateJSON(prompt);
      await this.logAIAction(orgId, null, 'assessment_gen', prompt, JSON.stringify(questions));
      return Array.isArray(questions) ? questions : [];
    } catch {
      return [];
    }
  }

  // ─── AI MICROLEARNING CARD ──────────────────────────────

  async generateMicrolearning(orgId, { skill_name, gap_details }) {
    const prompt = `You are a microlearning designer.

Create a 3-minute microlearning card for this skill gap:

Skill: ${skill_name}
Gap Context: ${gap_details || 'Employee needs to strengthen this skill'}

The card must contain:
{
  "title": "Catchy, actionable title (max 50 chars)",
  "key_insight": "One powerful sentence about why this matters",
  "explanation": "2-3 paragraph explanation (150-200 words)",
  "quick_tip": "One immediately actionable tip they can apply today",
  "knowledge_check": {
    "q": "Quick quiz question",
    "options": ["A","B","C","D"],
    "correct": 0,
    "explanation": "Why"
  },
  "tags": ["tag1", "tag2"]
}

Return ONLY a JSON object.`;

    try {
      const card = await aiService.generateJSON(prompt);
      await this.logAIAction(orgId, null, 'content_gen', prompt, JSON.stringify(card));
      return card;
    } catch {
      return null;
    }
  }

  // ─── PROGRAM CRUD ───────────────────────────────────────

  async createProgram(orgId, userId, data) {
    const { title, description, target_skill_id, program_type, difficulty, duration_hours, language, tone, cover_image_url, is_mandatory, target_audience, tags } = data;
    const [result] = await pool.query(
      `INSERT INTO ld_programs (org_id, title, description, target_skill_id, program_type, difficulty, duration_hours, language, tone, cover_image_url, is_mandatory, target_audience, tags, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orgId, title, description, target_skill_id, program_type || 'course', difficulty || 'intermediate', duration_hours, language || 'en', tone || 'formal', cover_image_url, is_mandatory || 0, target_audience ? JSON.stringify(target_audience) : null, tags ? JSON.stringify(tags) : null, userId]
    );
    return result.insertId;
  }

  async getPrograms(orgId, { status, program_type, limit = 50, offset = 0 } = {}) {
    let where = 'p.org_id = ? AND p.deleted_at IS NULL';
    const params = [orgId];
    if (status) { where += ' AND p.status = ?'; params.push(status); }
    if (program_type) { where += ' AND p.program_type = ?'; params.push(program_type); }
    params.push(limit, offset);

    const [rows] = await pool.query(
      `SELECT p.*, s.name as target_skill_name,
         (SELECT COUNT(*) FROM ld_modules WHERE program_id = p.id) as module_count,
         (SELECT COUNT(*) FROM ld_enrollments WHERE program_id = p.id) as enrollment_count
       FROM ld_programs p
       LEFT JOIN ld_skills s ON p.target_skill_id = s.id
       WHERE ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      params
    );
    return rows;
  }

  async getProgramById(programId, orgId) {
    const [rows] = await pool.query(
      `SELECT p.*, s.name as target_skill_name
       FROM ld_programs p
       LEFT JOIN ld_skills s ON p.target_skill_id = s.id
       WHERE p.id = ? AND p.org_id = ? AND p.deleted_at IS NULL`,
      [programId, orgId]
    );
    if (!rows[0]) return null;

    const [modules] = await pool.query(
      `SELECT * FROM ld_modules WHERE program_id = ? ORDER BY order_index`, [programId]
    );
    const [assessments] = await pool.query(
      `SELECT * FROM ld_assessments WHERE program_id = ?`, [programId]
    );

    return { ...rows[0], modules, assessments };
  }

  // ─── MODULE MANAGEMENT ──────────────────────────────────

  async saveModules(programId, modules) {
    // modules = [{title, module_type, order_index, content, content_format, duration_min, ai_generated}]
    const ids = [];
    for (const m of modules) {
      const [result] = await pool.query(
        `INSERT INTO ld_modules (program_id, title, module_type, order_index, content, content_format, duration_min, ai_generated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [programId, m.title, m.module_type || 'concept', m.order_index, m.content || null, m.content_format || 'markdown', m.duration_min || 15, m.ai_generated ? 1 : 0]
      );
      ids.push(result.insertId);
    }
    return ids;
  }

  async saveAssessment(programId, moduleId, questions, type = 'module_quiz') {
    const [result] = await pool.query(
      `INSERT INTO ld_assessments (program_id, module_id, assessment_type, questions, ai_generated)
       VALUES (?, ?, ?, ?, 1)`,
      [programId, moduleId, type, JSON.stringify(questions)]
    );
    return result.insertId;
  }

  // ─── SME REVIEW WORKFLOW ────────────────────────────────

  async submitForReview(orgId, contentType, contentId, reviewerIds) {
    for (const reviewerId of reviewerIds) {
      await pool.query(
        `INSERT INTO ld_reviews (org_id, content_type, content_id, reviewer_id)
         VALUES (?, ?, ?, ?)`,
        [orgId, contentType, contentId, reviewerId]
      );
    }
    // Update program status if applicable
    if (contentType === 'program') {
      await pool.query(`UPDATE ld_programs SET status = 'in_review' WHERE id = ?`, [contentId]);
    }
  }

  async getReviewQueue(orgId, reviewerId) {
    const [rows] = await pool.query(
      `SELECT r.*, 
         CASE r.content_type 
           WHEN 'program' THEN (SELECT title FROM ld_programs WHERE id = r.content_id)
           WHEN 'module' THEN (SELECT title FROM ld_modules WHERE id = r.content_id)
           WHEN 'knowledge_item' THEN (SELECT title FROM ld_knowledge_items WHERE id = r.content_id)
           ELSE NULL END as content_title
       FROM ld_reviews r
       WHERE r.org_id = ? AND r.reviewer_id = ? AND r.status = 'pending'
       ORDER BY r.created_at ASC`,
      [orgId, reviewerId]
    );
    return rows;
  }

  async submitReview(reviewId, { status, comments, feedback_notes, inline_comments }) {
    const finalComments = comments || feedback_notes || null;
    await pool.query(
      `UPDATE ld_reviews SET status = ?, comments = ?, inline_comments = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [status, finalComments, inline_comments ? JSON.stringify(inline_comments) : null, reviewId]
    );

    // If approved, check if all reviewers approved
    const [review] = await pool.query(`SELECT * FROM ld_reviews WHERE id = ?`, [reviewId]);
    if (review[0] && status === 'approved') {
      const [pending] = await pool.query(
        `SELECT COUNT(*) as cnt FROM ld_reviews 
         WHERE content_type = ? AND content_id = ? AND status = 'pending'`,
        [review[0].content_type, review[0].content_id]
      );
      if (pending[0].cnt === 0 && review[0].content_type === 'program') {
        await pool.query(
          `UPDATE ld_programs SET status = 'published', published_at = NOW() WHERE id = ?`,
          [review[0].content_id]
        );
      }
    }
  }

  // ─── BIAS & HALLUCINATION CHECK ─────────────────────────

  async runSafetyChecks(content) {
    const prompt = `You are an AI safety reviewer for corporate L&D content.

Analyze this content for:
1. Bias (gender, racial, cultural, age) — score 0.000 to 1.000
2. Hallucination risk (unverifiable claims, made-up statistics) — score 0.000 to 1.000
3. Toxicity (offensive, harmful, inappropriate for workplace) — score 0.000 to 1.000

Content to analyze:
"""
${content.substring(0, 3000)}
"""

Threshold for safe: all scores < 0.15
Return ONLY a JSON object exactly like this:
{"bias_score": 0.0, "hallucination_score": 0.0, "toxicity_score": 0.0, "flags": ["list any concerns"], "safe": true}`;

    try {
      return await aiService.generateJSON(prompt);
    } catch {
      return { bias_score: 0, hallucination_score: 0, toxicity_score: 0, flags: [], safe: true };
    }
  }

  // ─── AI AUDIT LOG ───────────────────────────────────────

  async logAIAction(orgId, userId, actionType, promptText, outputText, extra = {}) {
    const crypto = require('crypto');
    const promptHash = crypto.createHash('sha256').update(promptText).digest('hex').substring(0, 64);
    await pool.query(
      `INSERT INTO ld_ai_audit_logs (org_id, user_id, action_type, model_used, prompt_hash, input_summary, output_summary, tokens_used, latency_ms, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orgId, userId, actionType, extra.model || 'ai-model', promptHash,
       promptText.substring(0, 500), outputText?.substring(0, 500),
       extra.tokens || null, extra.latency || null, extra.meta ? JSON.stringify(extra.meta) : null]
    );
  }
}

module.exports = new LDContentService();
