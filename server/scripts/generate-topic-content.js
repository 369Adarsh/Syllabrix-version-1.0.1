/**
 * Bulk topic content generator
 * Fills theory_content, key_formulas, key_concepts, common_mistakes,
 * solved_examples, jee_tips for all empty jee_topics rows.
 * Uses ai.service (Gemini → Groq → Together fallback).
 *
 * Usage: node scripts/generate-topic-content.js [--start=0] [--limit=50]
 */
require('../src/config/env');
const { pool } = require('../src/database/connection');
const ai = require('../src/services/ai.service');

const DELAY_MS = 3000; // 3s between calls to respect rate limits
const BATCH_SIZE = 10;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const args = process.argv.slice(2).reduce((acc, a) => {
  const [k, v] = a.replace('--', '').split('=');
  acc[k] = v ? parseInt(v) : true;
  return acc;
}, {});

const START = args.start || 0;
const LIMIT = args.limit || 999999;

async function generateTopicContent(topic) {
  const bookRefs = {
    physics:     'H.C. Verma, D.C. Pandey, NCERT',
    chemistry:   'NCERT, O.P. Tandon, M.S. Chauhan',
    mathematics: 'R.D. Sharma, S.L. Loney, Arihant',
  };
  const refs = bookRefs[topic.subject_slug] || bookRefs.physics;

  const prompt = `You are an elite JEE professor. Generate comprehensive study notes for this topic.

Subject: ${topic.subject_name}
Chapter: ${topic.chapter_name}
Topic: ${topic.topic_name}
Reference books: ${refs}

Return ONLY valid JSON (no markdown fences, no text outside the JSON):
{
  "theory_content": "# ${topic.topic_name}\\n\\n[Minimum 300 words. Markdown with LaTeX math using $...$ inline and $$...$$ display. Include: introduction, core theory with derivations, real-world intuition, JEE-specific insights.]",
  "key_formulas": [
    {"name": "Formula name", "formula": "LaTeX e.g. F = ma", "description": "When and how to use it", "conditions": "Limitations or special cases"}
  ],
  "key_concepts": ["Concept 1 with exam-level depth", "Concept 2", "Concept 3"],
  "common_mistakes": ["Specific mistake students make and why it's wrong", "Another common error"],
  "solved_examples": [
    {"problem": "JEE-level MCQ or problem", "solution": "Step-by-step solution", "difficulty": "easy|medium|hard", "key_insight": "The trick or concept tested"}
  ],
  "jee_tips": "Specific shortcuts, memory tricks, and time-saving strategies for JEE exams."
}

CRITICAL: Escape all backslashes in JSON strings (use \\\\frac not \\frac). No trailing commas.`;

  const text = await ai.generateText(prompt, { task: 'fast', temperature: 0.4, maxTokens: 4096 });

  // Strip markdown fences
  let cleaned = text.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  // Find JSON object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) cleaned = cleaned.slice(start, end + 1);

  return JSON.parse(cleaned);
}

async function main() {
  const [topics] = await pool.query(`
    SELECT t.id, t.name AS topic_name,
           c.name AS chapter_name,
           s.name AS subject_name, s.slug AS subject_slug
    FROM jee_topics t
    JOIN jee_chapters c ON t.chapter_id = c.id
    JOIN jee_subjects s ON c.subject_id = s.id
    WHERE (t.theory_content IS NULL OR t.theory_content = '')
    ORDER BY s.display_order, c.chapter_number, t.display_order
    LIMIT ${LIMIT} OFFSET ${START}
  `);

  console.log(`\n📚 Topics to fill: ${topics.length} (starting at offset ${START})\n`);

  let success = 0, fail = 0;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    process.stdout.write(`[${i + 1}/${topics.length}] ${topic.subject_slug} › ${topic.chapter_name} › ${topic.topic_name} ... `);

    try {
      const data = await generateTopicContent(topic);

      await pool.query(
        `UPDATE jee_topics SET
          theory_content   = ?,
          key_formulas     = ?,
          key_concepts     = ?,
          common_mistakes  = ?,
          solved_examples  = ?,
          jee_tips         = ?
         WHERE id = ?`,
        [
          data.theory_content || '',
          JSON.stringify(data.key_formulas || []),
          JSON.stringify(data.key_concepts || []),
          JSON.stringify(data.common_mistakes || []),
          JSON.stringify(data.solved_examples || []),
          data.jee_tips || '',
          topic.id,
        ]
      );

      success++;
      console.log(`✅ (${(data.theory_content || '').length} chars)`);

      // Print first topic as sample
      if (i === 0) {
        console.log('\n── SAMPLE OUTPUT ──────────────────────────────────────');
        console.log('Theory preview:', (data.theory_content || '').slice(0, 300), '...');
        console.log('Formulas:', JSON.stringify(data.key_formulas?.slice(0, 2)));
        console.log('Tips:', (data.jee_tips || '').slice(0, 150));
        console.log('────────────────────────────────────────────────────\n');
      }
    } catch (e) {
      fail++;
      console.log(`❌ ${e.message.slice(0, 80)}`);
    }

    // Delay between calls (skip after last)
    if (i < topics.length - 1) await sleep(DELAY_MS);

    // Extra pause every batch to cool down
    if ((i + 1) % BATCH_SIZE === 0) {
      console.log(`\n⏸  Batch pause (${BATCH_SIZE} done)...\n`);
      await sleep(5000);
    }
  }

  console.log(`\n✅ Done. Success: ${success}, Failed: ${fail}`);
  const [remaining] = await pool.query("SELECT COUNT(*) as cnt FROM jee_topics WHERE theory_content IS NULL OR theory_content = ''");
  console.log(`📊 Topics still empty: ${remaining[0].cnt}`);

  pool.end();
}

main().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
