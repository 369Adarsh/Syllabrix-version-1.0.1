/**
 * Bulk question generator
 * For each chapter with fewer than 10 questions, generates 10 JEE MCQs via AI.
 * Uses ai.service (Groq first, Gemini/Together/Cohere fallback).
 *
 * Usage: node scripts/generate-questions.js [--start=0] [--limit=20] [--target=10]
 */
require('../src/config/env');
const { pool } = require('../src/database/connection');
const ai = require('../src/services/ai.service');

const DELAY_MS = 2000;
const BATCH_PAUSE = 6000;
const BATCH_SIZE = 5;
const QUESTIONS_PER_CALL = 5; // small calls to avoid JSON truncation

const sleep = ms => new Promise(r => setTimeout(r, ms));

const args = process.argv.slice(2).reduce((acc, a) => {
  const [k, v] = a.replace('--', '').split('=');
  acc[k] = v ? parseInt(v) : true;
  return acc;
}, {});

const START = args.start || 0;
const LIMIT = args.limit || 999999;
const TARGET = args.target || 10;

// Repair common AI JSON escaping issues with LaTeX
function repairJSON(text) {
  let cleaned = text.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start >= 0 && end > start) cleaned = cleaned.slice(start, end + 1);

  // Fix bad single backslash before letters (LaTeX) — replace \f \c \s etc with \\
  cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
  // Remove control characters
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F]/g, ' ');
  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  return cleaned;
}

async function generateQuestionsForChapter(chapter, count) {
  const prompt = `Generate exactly ${count} JEE Main single-correct MCQ questions for:
Subject: ${chapter.subject_name}, Chapter: ${chapter.chapter_name}, Class ${chapter.class_level}
Topics: ${(chapter.topic_names || chapter.chapter_name).slice(0, 150)}

Return ONLY a JSON array. No markdown. No text outside the array:
[{"question_text":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct_answer":"B","solution_text":"...","quick_trick":"...","difficulty":"medium"}]

Rules: correct_answer = A/B/C/D only. Vary difficulty. For math use plain text not LaTeX to avoid escape issues.`;

  const text = await ai.generateText(prompt, { task: 'fast', temperature: 0.5, maxTokens: 6000 });
  const cleaned = repairJSON(text);
  return JSON.parse(cleaned);
}

async function main() {
  const [chapters] = await pool.query(`
    SELECT c.id, c.name AS chapter_name, c.class_level,
           s.id AS subject_id, s.name AS subject_name, s.slug AS subject_slug,
           COUNT(q.id) AS existing_q,
           SUBSTRING(GROUP_CONCAT(DISTINCT t.name ORDER BY t.display_order SEPARATOR ', '), 1, 200) AS topic_names
    FROM jee_chapters c
    JOIN jee_subjects s ON c.subject_id = s.id
    LEFT JOIN jee_questions q ON q.chapter_id = c.id
    LEFT JOIN jee_topics t ON t.chapter_id = c.id
    WHERE c.is_active = 1
    GROUP BY c.id
    HAVING existing_q < ${TARGET}
    ORDER BY s.display_order, c.class_level, c.chapter_number
    LIMIT ${LIMIT} OFFSET ${START}
  `);

  console.log(`\n📝 Chapters needing questions: ${chapters.length}\n`);

  let totalInserted = 0, fail = 0;

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const needed = TARGET - chapter.existing_q;
    process.stdout.write(`[${i + 1}/${chapters.length}] ${chapter.subject_slug} › ${chapter.chapter_name} (need ${needed}) ... `);

    try {
      // Generate in batches of QUESTIONS_PER_CALL to avoid truncation
      let allQuestions = [];
      let remaining = needed;
      while (remaining > 0) {
        const callSize = Math.min(QUESTIONS_PER_CALL, remaining);
        const batch = await generateQuestionsForChapter(chapter, callSize);
        if (!Array.isArray(batch) || batch.length === 0) break;
        allQuestions = allQuestions.concat(batch);
        remaining -= batch.length;
        if (remaining > 0) await sleep(DELAY_MS);
      }

      if (allQuestions.length === 0) throw new Error('No questions returned');

      // Get topic_id for this chapter
      const [topics] = await pool.query(
        'SELECT id FROM jee_topics WHERE chapter_id = ? ORDER BY display_order LIMIT 1',
        [chapter.id]
      );
      const topicId = topics[0]?.id || null;

      let inserted = 0;
      for (const q of allQuestions.slice(0, needed + 2)) {
        const correctAnswer = ['A','B','C','D'].includes(q.correct_answer) ? q.correct_answer : 'A';
        const difficulty = ['easy','medium','hard','advanced'].includes(q.difficulty) ? q.difficulty : 'medium';

        await pool.query(
          `INSERT INTO jee_questions
            (subject_id, chapter_id, topic_id, question_text, question_type, options,
             correct_answer, solution_text, quick_trick, difficulty, marks, negative_marks,
             estimated_time_seconds, concept_tags, source_year, content_source, is_active)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'ai_generated',1)`,
          [
            chapter.subject_id,
            chapter.id,
            topicId,
            (q.question_text || '').slice(0, 5000),
            'scq',
            JSON.stringify(q.options || { A: '', B: '', C: '', D: '' }),
            correctAnswer,
            (q.solution_text || '').slice(0, 5000),
            (q.quick_trick || '').slice(0, 500),
            difficulty,
            4,
            -1,
            q.estimated_time_seconds || 120,
            JSON.stringify([chapter.chapter_name]),
            null,
          ]
        );
        inserted++;
      }

      totalInserted += inserted;
      console.log(`✅ +${inserted}`);

      if (i === 0 && allQuestions[0]) {
        console.log('\n── SAMPLE ──────────────────────────────────────────');
        console.log('Q:', allQuestions[0].question_text?.slice(0, 200));
        console.log('Options:', JSON.stringify(allQuestions[0].options));
        console.log('Answer:', allQuestions[0].correct_answer);
        console.log('Solution:', allQuestions[0].solution_text?.slice(0, 120));
        console.log('────────────────────────────────────────────────────\n');
      }
    } catch (e) {
      fail++;
      console.log(`❌ ${e.message.slice(0, 100)}`);
    }

    if (i < chapters.length - 1) await sleep(DELAY_MS);
    if ((i + 1) % BATCH_SIZE === 0) {
      console.log(`\n⏸  Batch pause...\n`);
      await sleep(BATCH_PAUSE);
    }
  }

  const [total] = await pool.query('SELECT COUNT(*) as cnt FROM jee_questions');
  console.log(`\n✅ Done. Inserted: ${totalInserted}, Failed: ${fail} chapters`);
  console.log(`📊 Total questions now: ${total[0].cnt}`);
  pool.end();
}

main().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
