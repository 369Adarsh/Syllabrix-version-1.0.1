/**
 * AI Library Service
 * Builds a board/syllabus-aware or exam-aware prompt from DB context
 * and calls the AI provider chain (Gemini → Groq → Together → Cohere).
 *
 * Supports two modes:
 *   1. School mode  — subjectId + chapterId + topicId  (NCERT / board syllabus)
 *   2. Exam mode    — examCode  (UPSC, JEE, NEET, SSC, Banking, NDA, etc.)
 *
 * Returned shape:
 * {
 *   explanation:         string,
 *   key_points:          string[],
 *   real_life_example:   string,
 *   remember_this:       string,
 *   follow_up_question:  string,
 *   related_topics:      string[],
 *   syllabus_note:       string,
 *   recommended_books:   { title, author, publisher, usage_tip, priority_rank }[]
 * }
 */

const { generateJSON } = require('./ai.service');
const { getAIContext, getAIExamContext, getRecommendedBooks } = require('../features/library/library.service');

/**
 * @param {object} params
 * @param {string|null}  params.boardCode
 * @param {number|null}  params.syllabusVersionId
 * @param {number|null}  params.grade
 * @param {number|null}  params.subjectId
 * @param {number|null}  params.chapterId
 * @param {number|null}  params.topicId
 * @param {string|null}  params.examCode        — for competitive exam mode
 * @param {string}       params.studentQuery
 * @param {string|null}  params.studentClass
 * @param {number|null}  params.userId
 */
async function ask(params) {
  const { subjectId, chapterId, topicId, examCode, studentQuery, studentClass, boardCode } = params;

  // ── 1. Fetch DB context ──────────────────────────────────────────────────────
  const { ctx, chapter, topic } = await getAIContext({
    subjectId: subjectId || null,
    chapterId: chapterId || null,
    topicId:   topicId   || null,
  });

  // Competitive exam context (if examCode provided)
  const examCtx = examCode ? await getAIExamContext(examCode) : null;

  // ── 2. Fetch recommended books (DB-driven, injected into prompt) ────────────
  let recommendedBooks = [];
  if (examCode) {
    // For competitive mode: get top priority books for this exam
    // Optionally filter by subject if chapter/topic gives us a hint
    const subjectHint = ctx?.subject_name || chapter?.title || null;
    recommendedBooks = await getRecommendedBooks({
      examCode,
      subject: subjectHint,
      classLevel: 'beginner',  // return priority_rank=1 books only for prompt injection
    });
    // Limit to top 5 for prompt efficiency
    recommendedBooks = recommendedBooks.slice(0, 5);
  } else if (subjectId && ctx) {
    // School mode: check if there are competitive books for the board's likely exam
    // (basic heuristic — JEE for science subjects, UPSC for history/geo)
    const examHint = guessExamFromSubject(ctx.subject_name);
    if (examHint) {
      recommendedBooks = await getRecommendedBooks({
        examCode: examHint,
        subject: ctx.subject_name,
        classLevel: 'beginner',
      });
      recommendedBooks = recommendedBooks.slice(0, 3);
    }
  }

  // ── 3. Build prompt ──────────────────────────────────────────────────────────
  const prompt = buildPrompt({
    ctx, chapter, topic, examCtx, recommendedBooks,
    studentQuery, studentClass, boardCode,
  });

  // ── 4. Call AI provider chain ────────────────────────────────────────────────
  const result = await generateJSON(prompt, { temperature: 0.6, maxTokens: 2048 });

  // ── 5. Normalize output ──────────────────────────────────────────────────────
  return {
    explanation:        result.explanation        || '',
    key_points:         Array.isArray(result.key_points)      ? result.key_points      : [],
    real_life_example:  result.real_life_example  || '',
    remember_this:      result.remember_this      || '',
    follow_up_question: result.follow_up_question || '',
    related_topics:     Array.isArray(result.related_topics)  ? result.related_topics  : [],
    syllabus_note:      result.syllabus_note      || '',
    recommended_books:  recommendedBooks.map(b => ({
      title:         b.title,
      author:        b.author,
      publisher:     b.publisher_name || b.publisher_short,
      usage_tip:     b.usage_tip,
      priority_rank: b.priority_rank,
    })),
  };
}

// ── Prompt Builder ─────────────────────────────────────────────────────────────

function buildPrompt({ ctx, chapter, topic, examCtx, recommendedBooks, studentQuery, studentClass, boardCode }) {
  const lines = [];

  lines.push('You are a friendly, expert AI tutor on the Syllabrix education platform.');
  lines.push('Answer the student\'s question using the syllabus context provided below.');
  lines.push('Use simple, clear language appropriate for school and competitive exam students.');
  lines.push('');

  // ── Section 1: Syllabus / Exam context ──────────────────────────────────────
  lines.push('=== SECTION 1: CONTEXT ===');

  if (examCtx) {
    lines.push(`Exam: ${examCtx.name} (${examCtx.code})`);
    lines.push(`Type: ${examCtx.type} | Level: ${examCtx.level}`);
    if (examCtx.state) lines.push(`State: ${examCtx.state}`);
    if (examCtx.conducting_body) lines.push(`Conducting Body: ${examCtx.conducting_body}`);
  }

  if (ctx) {
    lines.push(`Board: ${ctx.board_name} (${ctx.board_code}) — ${ctx.board_type}`);
    lines.push(`Syllabus Version: ${ctx.version_name} (${ctx.academic_year_start}${ctx.is_current ? ' — CURRENT' : ' — OLDER/LEGACY'})`);
    if (!ctx.is_current) {
      lines.push('⚠️  NOTE: This syllabus version is older and may no longer be examined.');
    }
    lines.push(`Grade: ${ctx.grade_label}${ctx.stream !== 'general' ? ` | Stream: ${ctx.stream}` : ''}`);
    lines.push(`Subject: ${ctx.subject_name}`);
  } else if (boardCode) {
    lines.push(`Board: ${boardCode.toUpperCase()}`);
  }

  if (studentClass) lines.push(`Student\'s class (self-reported): ${studentClass}`);

  // ── Section 2: Chapter / Topic ───────────────────────────────────────────────
  if (chapter) {
    lines.push('');
    lines.push(`=== SECTION 2: CHAPTER ===`);
    lines.push(`Chapter ${chapter.chapter_number}: ${chapter.title}`);
    if (chapter.description)           lines.push(`  Description: ${chapter.description}`);
    if (chapter.key_concepts?.length)  lines.push(`  Key Concepts: ${chapter.key_concepts.join(', ')}`);
    if (chapter.learning_outcomes?.length) lines.push(`  Learning Outcomes: ${chapter.learning_outcomes.join(' | ')}`);
  }

  if (topic) {
    lines.push('');
    lines.push(`=== SECTION 3: TOPIC ===`);
    lines.push(`Topic: ${topic.title}`);
    if (topic.bloom_levels?.length)   lines.push(`  Bloom's Levels: ${topic.bloom_levels.join(', ')}`);
    if (topic.weightage_percent != null) lines.push(`  Exam Weightage: ${topic.weightage_percent}%`);
    if (topic.is_deleted_in_new_syllabus) {
      lines.push('  ⚠️  This topic has been REMOVED in the NEP 2020 rationalized syllabus.');
      lines.push('      Inform the student so they do not waste time if on current syllabus.');
    }
    if (topic.is_new_in_current_syllabus) {
      lines.push('  ✅  This is a NEW topic added in the current syllabus.');
    }
  }

  // ── Section 4: Recommended books (100% DB-driven) ────────────────────────────
  if (recommendedBooks.length) {
    lines.push('');
    lines.push('=== SECTION 4: RECOMMENDED BOOKS (from Syllabrix library database) ===');
    lines.push('Mention these books if they are directly relevant to the student\'s question:');
    recommendedBooks.forEach((b, i) => {
      const author    = b.author           ? ` by ${b.author}` : '';
      const publisher = b.publisher_name   ? ` — ${b.publisher_name}` : '';
      const tip       = b.usage_tip        ? ` | Tip: ${b.usage_tip}` : '';
      lines.push(`  ${i + 1}. "${b.title}"${author}${publisher}${tip}`);
    });
  }

  // ── Student's question ───────────────────────────────────────────────────────
  lines.push('');
  lines.push('=== STUDENT\'S QUESTION ===');
  lines.push(studentQuery);

  // ── Output schema ─────────────────────────────────────────────────────────────
  lines.push('');
  lines.push('=== INSTRUCTIONS ===');
  lines.push('Respond with ONLY a JSON object matching this exact schema:');
  lines.push('{');
  lines.push('  "explanation": "Clear step-by-step explanation. Use simple language.",');
  lines.push('  "key_points": ["Point 1", "Point 2", "Point 3"],');
  lines.push('  "real_life_example": "A relatable real-life example that makes the concept stick.",');
  lines.push('  "remember_this": "Short memory trick, mnemonic, or one-liner to retain the key idea.",');
  lines.push('  "follow_up_question": "One simple question to check if the student understood.",');
  lines.push('  "related_topics": ["Topic A", "Topic B"],');
  lines.push('  "syllabus_note": "Any syllabus warning (deleted topic, old version, state-specific note). Empty string if none."');
  lines.push('}');
  lines.push('');
  lines.push('CRITICAL: Return ONLY the JSON object. No markdown. No extra text before or after.');

  return lines.join('\n');
}

// ── Heuristic: guess competitive exam from school subject ─────────────────────

function guessExamFromSubject(subjectName) {
  if (!subjectName) return null;
  const s = subjectName.toLowerCase();
  if (s.includes('history') || s.includes('geography') || s.includes('polity') || s.includes('economy')) return 'UPSC_IAS';
  if (s.includes('physics') || s.includes('chemistry') || s.includes('mathematics')) return 'JEE_MAIN';
  if (s.includes('biology')) return 'NEET_UG';
  return null;
}

module.exports = { ask };
