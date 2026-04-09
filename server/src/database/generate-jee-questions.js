#!/usr/bin/env node
/**
 * JEE Question Generator
 * For each chapter with fewer than TARGET questions, generates MCQs via AI.
 *
 * Usage:
 *   node src/database/generate-jee-questions.js           # Run one batch (5 chapters)
 *   node src/database/generate-jee-questions.js --all     # Run until all chapters have TARGET questions
 *   node src/database/generate-jee-questions.js --count   # Show chapter question counts
 *   node src/database/generate-jee-questions.js --fix-mocks # Rebuild mock test question_ids
 */

require('../config/env');
const axios = require('axios');
const { pool } = require('./connection');

const TARGET_QUESTIONS_PER_CHAPTER = 10;
const CHAPTERS_PER_BATCH = 5;
const DELAY_MS = 4000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 20000;

const args = process.argv.slice(2);
const providerArg = args.find((a) => a.startsWith('--provider='));
const PROVIDER = providerArg ? providerArg.split('=')[1] : 'cohere';

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

console.log(`Using provider: ${PROVIDER.toUpperCase()}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getChaptersNeedingQuestions(limit) {
  const [rows] = await pool.query(
    `SELECT
       c.id, c.name AS chapter_name, c.slug, c.class_level,
       s.name AS subject_name, s.slug AS subject_slug,
       COUNT(q.id) AS existing_count
     FROM jee_chapters c
     JOIN jee_subjects s ON s.id = c.subject_id
     LEFT JOIN jee_questions q ON q.chapter_id = c.id
     GROUP BY c.id
     HAVING existing_count < ?
     ORDER BY s.display_order, c.chapter_number
     LIMIT ?`,
    [TARGET_QUESTIONS_PER_CHAPTER, limit]
  );
  return rows;
}

async function getQuestionStats() {
  const [[total]] = await pool.query('SELECT COUNT(*) AS n FROM jee_questions');
  const [[chapsFull]] = await pool.query(
    `SELECT COUNT(*) AS n FROM (
       SELECT chapter_id FROM jee_questions
       GROUP BY chapter_id HAVING COUNT(*) >= ?
     ) t`,
    [TARGET_QUESTIONS_PER_CHAPTER]
  );
  const [[chapsTotal]] = await pool.query('SELECT COUNT(*) AS n FROM jee_chapters');
  return { total: total.n, chapsFull: chapsFull.n, chapsTotal: chapsTotal.n };
}

async function getSubjectIdBySlug(slug) {
  const [[row]] = await pool.query('SELECT id FROM jee_subjects WHERE slug = ?', [slug]);
  return row?.id;
}

async function insertQuestions(chapterId, subjectId, questions) {
  let inserted = 0;
  for (const q of questions) {
    try {
      await pool.query(
        `INSERT INTO jee_questions
           (subject_id, chapter_id, question_text, question_type, options,
            correct_answer, solution_text, difficulty, marks, negative_marks,
            estimated_time_seconds, source_type, concept_tags)
         VALUES (?, ?, ?, 'scq', ?, ?, ?, ?, 4, -1, 180, 'generated', ?)`,
        [
          subjectId,
          chapterId,
          q.question,
          JSON.stringify(q.options || []),
          q.correct_answer || 'A',
          q.solution || '',
          q.difficulty || 'medium',
          JSON.stringify(q.concept_tags || []),
        ]
      );
      inserted++;
    } catch (err) {
      // Skip duplicate or invalid entries
      console.error(`  Insert error: ${err.message.substring(0, 80)}`);
    }
  }
  return inserted;
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildQuestionPrompt(chapter, needed) {
  return `You are a JEE expert tutor. Generate ${needed} high-quality MCQ questions for JEE Main exam.

Subject: ${chapter.subject_name}
Chapter: ${chapter.chapter_name}
Class: ${chapter.class_level}

Requirements:
- Each question must be JEE Main style (single correct answer, 4 options A/B/C/D)
- Mix of difficulties: ~30% easy, 50% medium, 20% hard
- Use LaTeX for formulas: $...$ for inline, $$...$$ for display
- Each question needs a complete step-by-step solution

Return ONLY valid JSON (no markdown fences):
{
  "questions": [
    {
      "question": "Question text with LaTeX formulas",
      "options": [
        {"id": "A", "text": "Option A text with LaTeX if needed"},
        {"id": "B", "text": "Option B text"},
        {"id": "C", "text": "Option C text"},
        {"id": "D", "text": "Option D text"}
      ],
      "correct_answer": "A",
      "solution": "Step-by-step solution with LaTeX. Explain WHY each wrong option is wrong.",
      "difficulty": "easy|medium|hard",
      "concept_tags": ["concept1", "concept2"]
    }
  ]
}`;
}

// ── AI Providers ──────────────────────────────────────────────────────────────

function parseJsonResponse(raw) {
  return JSON.parse(
    raw.trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()
  );
}

async function generateWithCohere(chapter, needed, attempt = 0) {
  try {
    const res = await axios.post(
      'https://api.cohere.com/v2/chat',
      {
        model: 'command-a-03-2025',
        messages: [{ role: 'user', content: buildQuestionPrompt(chapter, needed) }],
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      },
      {
        headers: { Authorization: `Bearer ${COHERE_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 120000,
      }
    );
    const raw = res.data.message?.content?.[0]?.text || '';
    return parseJsonResponse(raw);
  } catch (err) {
    if (err.response?.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = parseInt(err.response?.headers?.['retry-after'] || '0', 10);
      const waitMs = retryAfter > 0 ? retryAfter * 1000 : RETRY_BASE_DELAY_MS * (attempt + 1);
      process.stdout.write(` [429, waiting ${Math.round(waitMs / 1000)}s...] `);
      await sleep(waitMs);
      return generateWithCohere(chapter, needed, attempt + 1);
    }
    throw err;
  }
}

async function generateWithGroq(chapter, needed, attempt = 0) {
  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: buildQuestionPrompt(chapter, needed) }],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      },
      {
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 90000,
      }
    );
    return parseJsonResponse(res.data.choices[0].message.content);
  } catch (err) {
    if (err.response?.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = parseInt(err.response?.headers?.['retry-after'] || '0', 10);
      const waitMs = retryAfter > 0 ? retryAfter * 1000 : RETRY_BASE_DELAY_MS * (attempt + 1);
      process.stdout.write(` [429, waiting ${Math.round(waitMs / 1000)}s...] `);
      await sleep(waitMs);
      return generateWithGroq(chapter, needed, attempt + 1);
    }
    throw err;
  }
}

async function generateQuestions(chapter, needed) {
  if (PROVIDER === 'groq') return generateWithGroq(chapter, needed);
  return generateWithCohere(chapter, needed);
}

// ── Mock test fixer ───────────────────────────────────────────────────────────

async function fixMockTests() {
  console.log('\n── Fixing mock test question_ids ──────────────────────────');
  const [mocks] = await pool.query('SELECT * FROM jee_mock_tests');
  const [allQuestions] = await pool.query(
    'SELECT id, subject_id FROM jee_questions WHERE is_active = 1 ORDER BY RAND()'
  );

  // Group question IDs by subject
  const [subjects] = await pool.query('SELECT id, name FROM jee_subjects');
  const bySubject = {};
  for (const s of subjects) bySubject[s.id] = [];
  for (const q of allQuestions) {
    if (bySubject[q.subject_id]) bySubject[q.subject_id].push(q.id);
  }

  console.log(`Available questions by subject:`);
  for (const s of subjects) {
    console.log(`  ${s.name}: ${bySubject[s.id].length} questions`);
  }

  let fixed = 0;
  for (const mock of mocks) {
    const existingIds = Array.isArray(mock.question_ids)
      ? mock.question_ids
      : JSON.parse(mock.question_ids || '[]');

    // Check how many existing IDs are still valid
    if (existingIds.length > 0) {
      const placeholders = existingIds.map(() => '?').join(',');
      const [[{ n: validCount }]] = await pool.query(
        `SELECT COUNT(*) AS n FROM jee_questions WHERE id IN (${placeholders})`,
        existingIds
      );

      if (validCount === existingIds.length) {
        console.log(`  ✓ "${mock.title}" — all ${existingIds.length} IDs valid, skipping`);
        continue;
      }
      console.log(`  ✗ "${mock.title}" — only ${validCount}/${existingIds.length} IDs valid, rebuilding`);
    } else {
      console.log(`  ✗ "${mock.title}" — no question_ids, building`);
    }

    // Build new question list: 30 physics + 30 chemistry + 30 maths = 90
    const newIds = [];
    for (const s of subjects) {
      const pool30 = bySubject[s.id].slice(0, 30);
      newIds.push(...pool30);
    }

    if (newIds.length < 10) {
      console.log(`    WARNING: Not enough questions to build mock (${newIds.length}), skipping`);
      continue;
    }

    await pool.query(
      'UPDATE jee_mock_tests SET question_ids = ?, total_questions = ? WHERE id = ?',
      [JSON.stringify(newIds), newIds.length, mock.id]
    );
    fixed++;
    console.log(`  ✓ Rebuilt "${mock.title}" with ${newIds.length} questions`);
  }

  console.log(`\nFixed ${fixed} mock tests.\n`);
}

// ── Batch runner ──────────────────────────────────────────────────────────────

async function runBatch(batchSize = CHAPTERS_PER_BATCH) {
  const stats = await getQuestionStats();
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`JEE Question Generator — Batch of ${batchSize} chapters`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`Questions total: ${stats.total}`);
  console.log(`Chapters with ≥${TARGET_QUESTIONS_PER_CHAPTER} questions: ${stats.chapsFull}/${stats.chapsTotal}`);

  const chapters = await getChaptersNeedingQuestions(batchSize);
  if (chapters.length === 0) {
    console.log('\nAll chapters already have enough questions!');
    return { done: true };
  }

  let totalInserted = 0;
  let errors = 0;

  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    const needed = TARGET_QUESTIONS_PER_CHAPTER - ch.existing_count;
    const num = `[${i + 1}/${chapters.length}]`;
    process.stdout.write(
      `${num} ${ch.subject_name} › ${ch.chapter_name} (needs ${needed}) ... `
    );

    try {
      const subjectId = await getSubjectIdBySlug(ch.subject_slug);
      const result = await generateQuestions(ch, needed);
      const questions = result.questions || [];

      if (questions.length === 0) throw new Error('Empty questions array returned');

      const inserted = await insertQuestions(ch.id, subjectId, questions.slice(0, needed));
      totalInserted += inserted;
      console.log(`✓ inserted ${inserted}`);
    } catch (err) {
      errors++;
      console.log(`✗ ERROR: ${err.message.substring(0, 100)}`);
    }

    if (i < chapters.length - 1) await sleep(DELAY_MS);
  }

  const after = await getQuestionStats();
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Batch done: +${totalInserted} questions inserted, ${errors} errors`);
  console.log(`Total questions: ${after.total} | Chapters full: ${after.chapsFull}/${after.chapsTotal}`);
  console.log(`${'─'.repeat(60)}\n`);

  return { done: after.chapsFull >= after.chapsTotal, totalInserted, errors };
}

async function showCount() {
  const stats = await getQuestionStats();
  const [detail] = await pool.query(`
    SELECT s.name AS subject, COUNT(q.id) AS total,
           SUM(CASE WHEN q.difficulty='easy' THEN 1 ELSE 0 END) AS easy,
           SUM(CASE WHEN q.difficulty='medium' THEN 1 ELSE 0 END) AS medium,
           SUM(CASE WHEN q.difficulty='hard' THEN 1 ELSE 0 END) AS hard
    FROM jee_questions q
    JOIN jee_subjects s ON s.id = q.subject_id
    GROUP BY s.id
  `);
  console.log(`\nQuestions: ${stats.total} total | Chapters ≥10 questions: ${stats.chapsFull}/${stats.chapsTotal}`);
  console.log('\nBy subject:');
  detail.forEach((r) => console.log(`  ${r.subject}: ${r.total} (E:${r.easy} M:${r.medium} H:${r.hard})`));
  await pool.end();
}

async function runAll() {
  let iteration = 0;
  while (true) {
    iteration++;
    console.log(`\n>>> BATCH #${iteration}`);
    const result = await runBatch(CHAPTERS_PER_BATCH);
    if (result.done) break;
    console.log('Waiting 5s before next batch...');
    await sleep(5000);
  }
  console.log('\nAll chapters have enough questions!');
  const stats = await getQuestionStats();
  console.log(`Final: ${stats.total} questions across ${stats.chapsTotal} chapters`);
  await pool.end();
}

// ── Entry point ───────────────────────────────────────────────────────────────

if (args.includes('--count')) {
  showCount().catch(console.error);
} else if (args.includes('--fix-mocks')) {
  (async () => {
    await fixMockTests();
    await pool.end();
  })().catch(console.error);
} else if (args.includes('--all')) {
  runAll().catch(console.error);
} else {
  runBatch(CHAPTERS_PER_BATCH)
    .then(() => pool.end())
    .catch((err) => { console.error('Fatal:', err); pool.end(); process.exit(1); });
}
