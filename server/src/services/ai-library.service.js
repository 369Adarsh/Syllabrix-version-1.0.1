/**
 * AI Library Service
 * Fetches full syllabus context from DB and builds a rich, board-aware prompt
 * before calling the AI provider chain.
 *
 * Returned shape:
 * {
 *   explanation:         string,
 *   key_points:          string[],
 *   real_life_example:   string,
 *   remember_this:       string,
 *   follow_up_question:  string,
 *   related_topics:      string[],
 *   syllabus_note:       string   // warns if topic deleted / new in current syllabus
 * }
 */

const { generateJSON } = require('./ai.service');
const { getAIContext } = require('../features/library/library.service');

/**
 * @param {object} params
 * @param {string}  params.boardCode
 * @param {number|null} params.syllabusVersionId
 * @param {number|null} params.grade
 * @param {number}  params.subjectId
 * @param {number|null} params.chapterId
 * @param {number|null} params.topicId
 * @param {string}  params.studentQuery
 * @param {string|null} params.studentClass  — free text from student ("Class 9", etc.)
 * @param {number|null} params.userId
 */
async function ask(params) {
  const { boardCode, subjectId, chapterId, topicId, studentQuery, studentClass } = params;

  // 1. Fetch full context from DB
  const { ctx, chapter, topic } = await getAIContext({
    subjectId,
    chapterId: chapterId || null,
    topicId:   topicId   || null,
    syllabusVersionId: params.syllabusVersionId || null,
  });

  // 2. Build prompt with all available context
  const prompt = buildPrompt({ ctx, chapter, topic, studentQuery, studentClass, boardCode });

  // 3. Call AI provider chain (Gemini → Groq → Together → Cohere)
  const result = await generateJSON(prompt, { temperature: 0.6, maxTokens: 2048 });

  // 4. Ensure all expected keys exist (graceful fallback)
  return {
    explanation:        result.explanation        || '',
    key_points:         Array.isArray(result.key_points)   ? result.key_points   : [],
    real_life_example:  result.real_life_example  || '',
    remember_this:      result.remember_this      || '',
    follow_up_question: result.follow_up_question || '',
    related_topics:     Array.isArray(result.related_topics) ? result.related_topics : [],
    syllabus_note:      result.syllabus_note      || '',
  };
}

// ── Prompt builder ─────────────────────────────────────────────────────────────

function buildPrompt({ ctx, chapter, topic, studentQuery, studentClass, boardCode }) {
  const lines = [];

  lines.push('You are a friendly, expert AI tutor on the Syllabrix education platform.');
  lines.push('Answer a student\'s question using ONLY the syllabus context provided below.');
  lines.push('Use simple, clear language appropriate for school students.');
  lines.push('');

  // ── Syllabus context ──────────────────────────────────────────────────────
  lines.push('=== SYLLABUS CONTEXT ===');

  if (ctx) {
    lines.push(`Board: ${ctx.board_name} (${ctx.board_code}) — ${ctx.board_type}`);
    lines.push(`Syllabus Version: ${ctx.version_name} (${ctx.academic_year_start}${ctx.is_current ? ' — CURRENT' : ' — OLDER/LEGACY'})`);
    if (!ctx.is_current) {
      lines.push('⚠️  WARNING: This syllabus version is OLDER and may no longer be taught in schools.');
    }
    lines.push(`Grade: ${ctx.grade_label}${ctx.stream !== 'general' ? ` | Stream: ${ctx.stream}` : ''}`);
    lines.push(`Subject: ${ctx.subject_name} (${ctx.subject_type})`);
  } else if (boardCode) {
    lines.push(`Board: ${boardCode.toUpperCase()}`);
  }
  if (studentClass) {
    lines.push(`Student's class (self-reported): ${studentClass}`);
  }

  if (chapter) {
    lines.push('');
    lines.push(`Chapter ${chapter.chapter_number}: ${chapter.title}`);
    if (chapter.description) lines.push(`  Description: ${chapter.description}`);
    if (chapter.key_concepts?.length) {
      lines.push(`  Key Concepts: ${chapter.key_concepts.join(', ')}`);
    }
    if (chapter.learning_outcomes?.length) {
      lines.push(`  Learning Outcomes: ${chapter.learning_outcomes.join(' | ')}`);
    }
  }

  if (topic) {
    lines.push('');
    lines.push(`Topic: ${topic.title}`);
    if (topic.bloom_levels?.length) {
      lines.push(`  Bloom's Levels: ${topic.bloom_levels.join(', ')}`);
    }
    if (topic.weightage_percent != null) {
      lines.push(`  Exam Weightage: ${topic.weightage_percent}%`);
    }
    if (topic.is_deleted_in_new_syllabus) {
      lines.push('  ⚠️  NOTE: This topic has been REMOVED in the current (NEP 2020) syllabus.');
      lines.push('       Mention this to the student so they know it may not appear in their current exam.');
    }
    if (topic.is_new_in_current_syllabus) {
      lines.push('  ✅  NOTE: This is a NEW topic introduced in the current syllabus.');
    }
  }

  lines.push('');
  lines.push('=== STUDENT\'S QUESTION ===');
  lines.push(studentQuery);

  lines.push('');
  lines.push('=== INSTRUCTIONS ===');
  lines.push('Respond with ONLY a JSON object matching this exact schema:');
  lines.push('{');
  lines.push('  "explanation": "A clear, step-by-step explanation of the topic/question. Use simple language.",');
  lines.push('  "key_points": ["Point 1", "Point 2", "Point 3"],');
  lines.push('  "real_life_example": "A relatable real-life example that makes the concept easy to remember.",');
  lines.push('  "remember_this": "A short memory trick, mnemonic, or one-liner to remember the key idea.",');
  lines.push('  "follow_up_question": "One question to check if the student understood. Keep it simple.",');
  lines.push('  "related_topics": ["Topic A", "Topic B"],');
  lines.push('  "syllabus_note": "Any important note about the syllabus — e.g., if topic is deleted in new syllabus, if chapter is not in their board, etc. Leave empty string if no note needed."');
  lines.push('}');
  lines.push('');
  lines.push('CRITICAL: Return ONLY the JSON. No markdown. No extra text.');

  return lines.join('\n');
}

module.exports = { ask };
