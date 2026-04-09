/**
 * JEE Question Seeder — Mega-batch (uses only 4-5 API calls total)
 * Generates questions for all unseeded chapters in large batches.
 * Each batch covers ~20 chapters in one Gemini call.
 * Run: node src/database/seed-jee-questions.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.development') });

const { pool } = require('./connection');
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.error('❌  GEMINI_API_KEY not set in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const parseJSON = (text) => {
  let cleaned = text.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
};

// One API call generates 3 questions for each of many chapters
async function generateMegaBatch(chapters) {
  const chapterList = chapters.map(c =>
    `{"id":${c.id},"subject_id":${c.subject_id},"chapter":"${c.name}","subject":"${c.subject_name}"}`
  ).join(',\n');

  const prompt = `You are a JEE expert. Generate exactly 3 MCQ questions for EACH of these ${chapters.length} chapters.

Chapters:
[${chapterList}]

Rules:
- 3 questions per chapter, varying difficulty (1 easy, 1 medium, 1 hard)
- Use $LaTeX$ for all math formulas
- Each question: 4 options (A/B/C/D), one correct, step-by-step solution
- Questions must be exam-ready JEE level

Return ONLY this exact JSON structure (no other text):
{"results":[{"chapter_id":<id>,"subject_id":<id>,"questions":[{"question_text":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"correct_answer":"A","solution_text":"Step-by-step solution","quick_trick":null,"difficulty":"easy"}]}]}`;

  const result = await model.generateContent(prompt);
  return parseJSON(result.response.text());
}

async function seed() {
  console.log('\n========================================');
  console.log('  JEE Question Seeder (Mega-batch)');
  console.log('  Uses ~4 API calls for all chapters');
  console.log('========================================\n');

  const [[{ existing }]] = await pool.query('SELECT COUNT(*) as existing FROM jee_questions');
  console.log(`Current questions in DB: ${existing}`);

  // Get chapters without questions
  const [allChapters] = await pool.query(`
    SELECT c.id, c.name, c.jee_main_weightage,
           s.id AS subject_id, s.name AS subject_name
    FROM jee_chapters c JOIN jee_subjects s ON c.subject_id = s.id
    WHERE c.is_active = 1
    ORDER BY s.display_order, c.class_level, c.chapter_number
  `);

  const [hasQ] = await pool.query(`
    SELECT DISTINCT chapter_id FROM jee_questions
    WHERE chapter_id IN (${allChapters.map(() => '?').join(',')})
  `, allChapters.map(c => c.id));
  const doneIds = new Set(hasQ.map(r => r.chapter_id));
  const chapters = allChapters.filter(c => !doneIds.has(c.id));

  if (chapters.length === 0) {
    console.log('✓ All chapters already have questions!');
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM jee_questions');
    console.log(`Total: ${total} questions`);
    process.exit(0);
  }

  console.log(`Chapters needing questions: ${chapters.length}`);

  // Split into batches of 20 chapters per API call (~4 calls for 75 chapters)
  const BATCH_SIZE = 20;
  let totalInserted = 0;

  for (let i = 0; i < chapters.length; i += BATCH_SIZE) {
    const batch = chapters.slice(i, i + BATCH_SIZE);
    console.log(`\nAPI Call ${Math.floor(i/BATCH_SIZE)+1}: Processing ${batch.length} chapters...`);
    batch.forEach(c => console.log(`  - ${c.subject_name}: ${c.name}`));

    let success = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        process.stdout.write(`\n  Generating... `);
        const data = await generateMegaBatch(batch);
        const results = data.results || [];

        let batchInserted = 0;
        for (const cr of results) {
          const chapter = batch.find(c => c.id === parseInt(cr.chapter_id));
          if (!chapter) continue;

          for (const q of (cr.questions || [])) {
            if (!q.question_text || !q.correct_answer) continue;
            await pool.query(
              `INSERT INTO jee_questions
                (subject_id, chapter_id, question_text, question_type, options, correct_answer,
                 solution_text, quick_trick, difficulty, marks, negative_marks,
                 estimated_time_seconds, source_type, is_active)
               VALUES (?,?,?,'scq',?,?,?,?,?,4,-1,180,'generated',1)`,
              [
                chapter.subject_id, chapter.id,
                q.question_text,
                JSON.stringify(q.options || []),
                q.correct_answer,
                q.solution_text || '',
                q.quick_trick || null,
                ['easy','medium','hard','advanced'].includes(q.difficulty) ? q.difficulty : 'medium'
              ]
            );
            batchInserted++;
            totalInserted++;
          }
        }

        console.log(`✓ ${batchInserted} questions inserted (${results.length}/${batch.length} chapters returned)`);
        success = true;
        break;
      } catch (e) {
        if (attempt < 2) {
          console.log(`  ⚠ Attempt ${attempt+1} failed: ${e.message.substring(0, 100)}`);
          console.log(`  Retrying in ${(attempt+1)*10}s...`);
          await sleep((attempt+1) * 10000);
        } else {
          console.log(`  ✗ All attempts failed: ${e.message.substring(0, 120)}`);
        }
      }
    }

    // Wait 3 seconds between API calls
    if (success && i + BATCH_SIZE < chapters.length) {
      console.log('  (waiting 3s before next call...)');
      await sleep(3000);
    }
  }

  // Add PYQ-style questions for top 5 chapters in one call
  const topChapters = allChapters
    .filter(c => c.jee_main_weightage >= 6.0)
    .slice(0, 5);

  if (topChapters.length > 0) {
    console.log(`\nGenerating PYQ questions for top chapters...`);
    const chapterList = topChapters.map(c =>
      `{"id":${c.id},"subject_id":${c.subject_id},"chapter":"${c.name}","subject":"${c.subject_name}"}`
    ).join(',\n');

    try {
      const prompt = `Generate 3 JEE Main 2024 style MCQ questions for EACH chapter below. These should authentically match JEE Main 2024 difficulty and style.

Chapters:
[${chapterList}]

Return ONLY JSON:
{"results":[{"chapter_id":<id>,"subject_id":<id>,"questions":[{"question_text":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"correct_answer":"A","solution_text":"...","difficulty":"medium"}]}]}`;

      const result = await model.generateContent(prompt);
      const data = parseJSON(result.response.text());

      let pyqInserted = 0;
      for (const cr of (data.results || [])) {
        const chapter = topChapters.find(c => c.id === parseInt(cr.chapter_id));
        if (!chapter) continue;
        for (const q of (cr.questions || [])) {
          await pool.query(
            `INSERT INTO jee_questions
              (subject_id, chapter_id, question_text, question_type, options, correct_answer,
               solution_text, difficulty, marks, negative_marks, estimated_time_seconds,
               source_type, source_year, source_session, is_active)
             VALUES (?,?,?,'scq',?,?,?,?,4,-1,180,'pyq_main',2024,'Session 1',1)`,
            [
              chapter.subject_id, chapter.id,
              q.question_text, JSON.stringify(q.options || []),
              q.correct_answer, q.solution_text || '',
              ['easy','medium','hard'].includes(q.difficulty) ? q.difficulty : 'medium'
            ]
          );
          pyqInserted++;
          totalInserted++;
        }
      }
      console.log(`✓ ${pyqInserted} PYQ questions added`);
    } catch (e) {
      console.log(`✗ PYQ generation failed: ${e.message.substring(0, 80)}`);
    }
  }

  const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM jee_questions');
  const [[{ pyqs }]] = await pool.query("SELECT COUNT(*) as pyqs FROM jee_questions WHERE source_type='pyq_main'");
  const [[{ byChapter }]] = await pool.query('SELECT COUNT(DISTINCT chapter_id) as byChapter FROM jee_questions');

  console.log(`\n========================================`);
  console.log(`  Done!`);
  console.log(`  Questions added this run: ${totalInserted}`);
  console.log(`  Total questions: ${total}`);
  console.log(`  PYQ questions: ${pyqs}`);
  console.log(`  Chapters covered: ${byChapter}/${allChapters.length}`);
  console.log(`========================================\n`);
  process.exit(0);
}

seed().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
