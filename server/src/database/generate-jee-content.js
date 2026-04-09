#!/usr/bin/env node
/**
 * JEE Topic Content Generator
 * Fills jee_topics with AI-generated theory, formulas, examples, etc.
 *
 * Usage:
 *   node src/database/generate-jee-content.js           # Run one batch of 10
 *   node src/database/generate-jee-content.js --all     # Run all batches until done
 *   node src/database/generate-jee-content.js --count   # Show current count
 */

require('../config/env'); // Load .env.development
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { pool } = require('./connection');

const BATCH_SIZE = 10;
const DELAY_MS = 3000;         // 3s between calls
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 20000; // 20s base retry wait for 429s

// ── Provider selection ────────────────────────────────────────────────────────
// Default: cohere (free trial — 20 RPM, good quality)
// Options:  --provider=cohere | --provider=groq | --provider=gemini
const args_raw = process.argv.slice(2);
const providerArg = args_raw.find((a) => a.startsWith('--provider='));
const PROVIDER = providerArg ? providerArg.split('=')[1] : 'cohere';

console.log(`Using provider: ${PROVIDER.toUpperCase()}`);

// Cohere setup
const COHERE_API_KEY = process.env.COHERE_API_KEY;
if (PROVIDER === 'cohere' && !COHERE_API_KEY) {
  console.error('ERROR: COHERE_API_KEY not set. Check .env.development');
  process.exit(1);
}

// Groq setup
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (PROVIDER === 'groq' && !GROQ_API_KEY) {
  console.error('ERROR: GROQ_API_KEY not set. Check .env.development');
  process.exit(1);
}

// Together AI setup
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

// Gemini setup
let geminiModel = null;
if (PROVIDER === 'gemini') {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) { console.error('ERROR: GEMINI_API_KEY not set.'); process.exit(1); }
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  geminiModel = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getTopicsWithoutContent(limit) {
  const [rows] = await pool.query(
    `SELECT
       t.id, t.name, t.difficulty,
       c.name AS chapter_name, c.slug AS chapter_slug,
       s.name AS subject_name
     FROM jee_topics t
     JOIN jee_chapters c ON c.id = t.chapter_id
     JOIN jee_subjects s ON s.id = c.subject_id
     WHERE (t.theory_content IS NULL OR t.theory_content = '')
     ORDER BY s.display_order, c.chapter_number, t.display_order
     LIMIT ?`,
    [limit]
  );
  return rows;
}

async function getTotalCounts() {
  const [[total]] = await pool.query('SELECT COUNT(*) AS n FROM jee_topics');
  const [[filled]] = await pool.query(
    "SELECT COUNT(*) AS n FROM jee_topics WHERE theory_content IS NOT NULL AND theory_content != ''"
  );
  return { total: total.n, filled: filled.n, remaining: total.n - filled.n };
}

function buildPrompt(topic) {
  return `You are a JEE expert tutor. Generate comprehensive study material for:
Subject: ${topic.subject_name}
Chapter: ${topic.chapter_name}
Topic: ${topic.name}
Difficulty: ${topic.difficulty}

Return ONLY valid JSON with NO markdown fences, NO extra text before or after. Just the raw JSON object:
{
  "theory_content": "Detailed theory in Markdown. Use $...$ for inline LaTeX and $$...$$ for display LaTeX. Minimum 400 words. Include: (1) introduction and physical meaning, (2) derivations with step-by-step math, (3) key insights and intuition, (4) JEE relevance and exam pattern.",
  "key_formulas": [
    {"name": "Formula name", "formula": "LaTeX formula string", "when_to_use": "When to apply this formula"}
  ],
  "key_concepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"],
  "common_mistakes": ["Mistake 1", "Mistake 2", "Mistake 3"],
  "solved_examples": [
    {
      "question": "JEE-level question with LaTeX using $...$ syntax",
      "difficulty": "easy",
      "solution": "Step-by-step solution with LaTeX",
      "concept_used": "Concept name"
    },
    {
      "question": "Harder JEE-level question",
      "difficulty": "hard",
      "solution": "Step-by-step solution",
      "concept_used": "Concept name"
    }
  ],
  "jee_tips": "JEE-specific tips: common question patterns, time-saving tricks, what to memorize vs derive, year-wise appearance frequency."
}`;
}

function parseJsonResponse(raw) {
  const jsonStr = raw.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  return JSON.parse(jsonStr);
}

async function generateWithGemini(topic) {
  const result = await geminiModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: buildPrompt(topic) }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
  });
  return parseJsonResponse(result.response.text());
}

async function callOpenAICompatible(url, apiKey, model, topic, attempt, retryFn) {
  try {
    const res = await axios.post(
      url,
      {
        model,
        messages: [{ role: 'user', content: buildPrompt(topic) }],
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 120000,
      }
    );
    return parseJsonResponse(res.data.choices[0].message.content);
  } catch (err) {
    if (err.response?.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = parseInt(err.response?.headers?.['retry-after'] || '0', 10);
      const waitMs = retryAfter > 0 ? retryAfter * 1000 : RETRY_BASE_DELAY_MS * (attempt + 1);
      process.stdout.write(` [429, waiting ${Math.round(waitMs/1000)}s...] `);
      await sleep(waitMs);
      return retryFn(topic, attempt + 1);
    }
    throw err;
  }
}

async function generateWithTogether(topic, attempt = 0) {
  return callOpenAICompatible(
    'https://api.together.xyz/v1/chat/completions',
    TOGETHER_API_KEY,
    'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    topic, attempt,
    generateWithTogether
  );
}

async function generateWithGroq(topic, attempt = 0) {
  return callOpenAICompatible(
    'https://api.groq.com/openai/v1/chat/completions',
    GROQ_API_KEY,
    'llama-3.3-70b-versatile',
    topic, attempt,
    generateWithGroq
  );
}

async function generateWithCohere(topic, attempt = 0) {
  try {
    const res = await axios.post(
      'https://api.cohere.com/v2/chat',
      {
        model: 'command-a-03-2025',
        messages: [{ role: 'user', content: buildPrompt(topic) }],
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      },
      {
        headers: { Authorization: `Bearer ${COHERE_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 120000,
      }
    );
    // Cohere v2 response: message.content[0].text
    const raw = res.data.message?.content?.[0]?.text || res.data.text || '';
    return parseJsonResponse(raw);
  } catch (err) {
    if (err.response?.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = parseInt(err.response?.headers?.['retry-after'] || '0', 10);
      const waitMs = retryAfter > 0 ? retryAfter * 1000 : RETRY_BASE_DELAY_MS * (attempt + 1);
      process.stdout.write(` [429, waiting ${Math.round(waitMs/1000)}s...] `);
      await sleep(waitMs);
      return generateWithCohere(topic, attempt + 1);
    }
    throw err;
  }
}

async function generateContent(topic) {
  if (PROVIDER === 'gemini') return generateWithGemini(topic);
  if (PROVIDER === 'groq') return generateWithGroq(topic);
  if (PROVIDER === 'together') return generateWithTogether(topic);
  return generateWithCohere(topic);
}

async function saveContent(topicId, content) {
  await pool.query(
    `UPDATE jee_topics SET
       theory_content = ?,
       key_formulas   = ?,
       key_concepts   = ?,
       common_mistakes = ?,
       solved_examples = ?,
       jee_tips        = ?
     WHERE id = ?`,
    [
      content.theory_content,
      JSON.stringify(content.key_formulas || []),
      JSON.stringify(content.key_concepts || []),
      JSON.stringify(content.common_mistakes || []),
      JSON.stringify(content.solved_examples || []),
      content.jee_tips || '',
      topicId,
    ]
  );
}

async function runBatch(batchSize = BATCH_SIZE) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`JEE Content Generator — Batch of ${batchSize}`);
  console.log(`${'─'.repeat(60)}`);

  const counts = await getTotalCounts();
  console.log(`Status: ${counts.filled}/${counts.total} topics filled (${counts.remaining} remaining)\n`);

  if (counts.remaining === 0) {
    console.log('All topics already have content!');
    await pool.end();
    return;
  }

  const topics = await getTopicsWithoutContent(batchSize);
  console.log(`Processing ${topics.length} topics...\n`);

  let successCount = 0;
  let errorCount = 0;
  let firstContent = null;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const num = `[${i + 1}/${topics.length}]`;
    process.stdout.write(`${num} ${topic.subject_name} › ${topic.chapter_name} › ${topic.name} ... `);

    try {
      const content = await generateContent(topic);
      await saveContent(topic.id, content);

      if (!firstContent) firstContent = { topic, content };
      successCount++;
      console.log(`✓ (${(content.theory_content || '').split(' ').length} words)`);
    } catch (err) {
      errorCount++;
      console.log(`✗ ERROR: ${err.message}`);
    }

    // Delay between calls (skip after last item)
    if (i < topics.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Final counts
  const after = await getTotalCounts();
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Batch complete: ${successCount} succeeded, ${errorCount} failed`);
  console.log(`Progress: ${after.filled}/${after.total} (${after.remaining} remaining)`);
  console.log(`${'─'.repeat(60)}\n`);

  // Show example of generated content
  if (firstContent) {
    const { topic, content } = firstContent;
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`SAMPLE CONTENT PREVIEW`);
    console.log(`Topic: ${topic.subject_name} › ${topic.chapter_name} › ${topic.name}`);
    console.log(`${'═'.repeat(60)}\n`);
    console.log('THEORY (first 600 chars):');
    console.log((content.theory_content || '').substring(0, 600));
    console.log('\n...\n');
    console.log('KEY FORMULAS:');
    (content.key_formulas || []).slice(0, 3).forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.name}: ${f.formula}`);
      console.log(`     When to use: ${f.when_to_use}`);
    });
    console.log('\nKEY CONCEPTS:');
    (content.key_concepts || []).forEach((c, idx) => console.log(`  ${idx + 1}. ${c}`));
    console.log('\nCOMMON MISTAKES:');
    (content.common_mistakes || []).forEach((m, idx) => console.log(`  ${idx + 1}. ${m}`));
    console.log('\nJEE TIPS:');
    console.log(content.jee_tips || '(none)');
    if (content.solved_examples && content.solved_examples.length > 0) {
      const ex = content.solved_examples[0];
      console.log('\nSOLVED EXAMPLE (first one):');
      console.log(`  Q: ${ex.question}`);
      console.log(`  Difficulty: ${ex.difficulty}`);
      console.log(`  Concept: ${ex.concept_used}`);
      console.log(`  Solution: ${(ex.solution || '').substring(0, 300)}...`);
    }
    console.log(`\n${'═'.repeat(60)}\n`);
  }

  return { successCount, errorCount, remaining: after.remaining };
}

async function showCount() {
  const counts = await getTotalCounts();
  console.log(`\nJEE Topics with content: ${counts.filled} / ${counts.total}`);
  console.log(`Remaining: ${counts.remaining}\n`);
  await pool.end();
}

async function runAll() {
  let iteration = 0;
  while (true) {
    iteration++;
    console.log(`\n>>> BATCH ITERATION #${iteration}`);
    const result = await runBatch(BATCH_SIZE);
    if (!result || result.remaining === 0) break;
    console.log(`Waiting 3s before next batch...\n`);
    await sleep(3000);
  }
  console.log('\nAll topics have been filled!');
  const counts = await getTotalCounts();
  console.log(`Final count: ${counts.filled} / ${counts.total} topics with content`);
  await pool.end();
}

// ── Entry point ──────────────────────────────────────────────────────────────
const args = args_raw;

if (args.includes('--count')) {
  showCount().catch(console.error);
} else if (args.includes('--all')) {
  runAll().catch(console.error);
} else {
  // Default: run one batch of 10
  runBatch(BATCH_SIZE)
    .then(() => pool.end())
    .catch((err) => {
      console.error('Fatal error:', err);
      pool.end();
      process.exit(1);
    });
}
