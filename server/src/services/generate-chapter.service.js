'use strict';
/**
 * Generate Chapter Service
 * Reads the admin-uploaded PDF for the chapter, extracts text, then runs two
 * parallel Gemini calls:
 *   Call A — Subject study guide  +  full chapter content (from PDF text)
 *   Call B — Chapter exercise Q&A  +  topic-wise practice questions
 *
 * If no PDF is uploaded the AI falls back to its own training knowledge.
 */

const pdfParse     = require('pdf-parse');
const axios        = require('axios');
const { pool }     = require('../database/connection');
const { generateJSON } = require('./ai.service');

const MAX_PDF_CHARS = 80_000; // ~50K tokens — well inside Gemini 2.0 Flash's 1M limit

// ─── Entry point ──────────────────────────────────────────────────────────────

async function generateChapter({
  chapterId, subject, chapterName, chapterNumber,
  topics = [], board, grade, syllabusVersion = 'latest',
}) {
  // 1. Attempt to get PDF text from admin-uploaded file
  let pdfText = '';
  let hasPdf  = false;

  const realChapterId = chapterId && !String(chapterId).startsWith('fb') ? Number(chapterId) : null;

  if (realChapterId) {
    try {
      const [files] = await pool.query(
        `SELECT file_url, file_name FROM lib_uploads
         WHERE entity_type = 'chapter' AND entity_id = ?
         ORDER BY created_at DESC`,
        [realChapterId]
      );
      const pdfRow = files.find(f =>
        /\.pdf$/i.test(f.file_name || '') || /\.pdf($|\?)/i.test(f.file_url || '')
      );
      if (pdfRow?.file_url) {
        pdfText = await fetchAndParsePdf(pdfRow.file_url);
        hasPdf  = pdfText.length > 50;
      }
    } catch (e) {
      console.warn('[ChapterGen] PDF extraction failed:', e.message);
    }
  }

  // 2. Run two parallel Gemini calls
  const ctx = { board, grade, subject, chapterName, chapterNumber, topics, syllabusVersion, pdfText, hasPdf };

  const [call1, call2] = await Promise.all([
    generateJSON(buildGuideAndContentPrompt(ctx), { task: 'reasoning', temperature: 0.35, maxTokens: 8192 }),
    generateJSON(buildExercisesAndPracticePrompt(ctx), { task: 'reasoning', temperature: 0.3, maxTokens: 8192 }),
  ]);

  return {
    subject_guide:   normaliseGuide(call1.subject_guide),
    chapter_content: normaliseContent(call1.chapter_content),
    exercises:       normaliseExercises(call2.exercises),
    practice:        normalisePractice(call2.practice),
    has_pdf:         hasPdf,
  };
}

// ─── PDF helpers ──────────────────────────────────────────────────────────────

async function fetchAndParsePdf(url) {
  const resp   = await axios.get(url, { responseType: 'arraybuffer', timeout: 30_000 });
  const parsed = await pdfParse(Buffer.from(resp.data));
  const text   = (parsed.text || '').replace(/\s{3,}/g, '\n\n').trim();
  return text.length > MAX_PDF_CHARS ? text.slice(0, MAX_PDF_CHARS) : text;
}

// ─── Context header (shared by both prompts) ──────────────────────────────────

function ctxHeader({ board, grade, subject, chapterName, chapterNumber, syllabusVersion, pdfText, hasPdf }) {
  const isLatest = !syllabusVersion || syllabusVersion === 'latest';
  const lines = [
    '══════════════════════════════════════════════════════════',
    'CHAPTER CONTEXT',
    '══════════════════════════════════════════════════════════',
    `Board / Curriculum : ${board ? board.toUpperCase() + ' Board' : 'CBSE / NCERT'}`,
    grade  ? `Grade / Level      : Class ${grade}` : '',
    `Subject            : ${subject}`,
    `Chapter            : ${chapterNumber ? `Chapter ${chapterNumber} — ` : ''}${chapterName}`,
    `Syllabus Edition   : ${isLatest ? 'Latest 2024-25 (NEP 2020 Rationalized)' : 'Old / Full Pre-2023 NCERT'}`,
  ].filter(Boolean);

  if (hasPdf) {
    lines.push('');
    lines.push('══════════════════════════════════════════════════════════');
    lines.push('EXTRACTED PDF TEXT  (the actual uploaded chapter textbook)');
    lines.push('══════════════════════════════════════════════════════════');
    lines.push(pdfText);
  } else {
    lines.push('');
    lines.push('NOTE: No PDF has been uploaded for this chapter.');
    lines.push('Use your comprehensive training knowledge to generate accurate content.');
  }
  return lines.join('\n');
}

// ─── Prompt A: Subject guide + chapter content ────────────────────────────────

function buildGuideAndContentPrompt(ctx) {
  const { subject, chapterName, chapterNumber, hasPdf } = ctx;
  const contentInstruction = hasPdf
    ? `FORMAT the extracted PDF text above into clean, well-structured Markdown sections.
       PRESERVE the original content EXACTLY — do NOT add, remove, or change any facts, examples, or definitions.
       Your job is FORMATTING only, not rewriting.`
    : `Write the complete chapter content from your training knowledge.
       Cover every topic, definition, example, and formula the standard textbook would include.
       Be thorough — this is a complete subject guide, NOT a short summary.`;

  return `
${ctxHeader(ctx)}

══════════════════════════════════════════════════════════
ROLE
══════════════════════════════════════════════════════════
You are Syllabrix's chief content architect. Your output becomes the primary study
material for lakhs of Indian students. It must be COMPLETE, ACCURATE, and CLEAR.

══════════════════════════════════════════════════════════
TASK A — SUBJECT STUDY GUIDE
══════════════════════════════════════════════════════════
Create a complete, exam-focused study guide for this chapter. Include:
• Overview: What this chapter is about and why it matters (2-3 paragraphs)
• Topics at a Glance: Every major topic in the chapter
• Marks Distribution: How questions from this chapter appear in exams
  (1 mark → typically MCQ/fill/VSA; 2 marks → short answer; 3 marks → medium; 5 marks → long/diagram)
• Study Strategy: How to approach, memorize, and revise this chapter
• Key Formulas / Key Terms at a glance (plain-text list)

══════════════════════════════════════════════════════════
TASK B — COMPLETE CHAPTER CONTENT
══════════════════════════════════════════════════════════
${contentInstruction}

Structure EVERY section as:
  • A clear heading
  • Full explanation content (Markdown, bold key terms, bullets where appropriate)
  • At least one worked example per section (problem → step-by-step solution)
  • Key terms / concepts at the end of each section

After all sections include:
  • All important formulas with variable definitions
  • 8-10 point chapter summary

══════════════════════════════════════════════════════════
OUTPUT FORMAT — Return ONLY valid JSON, no markdown fences
══════════════════════════════════════════════════════════
{
  "subject_guide": {
    "overview": "2-3 paragraph overview of the chapter and its importance.",
    "why_it_matters": "Practical / exam importance.",
    "topics_at_a_glance": ["Topic 1", "Topic 2"],
    "marks_distribution": {
      "one_mark":   "What kind of questions appear as 1-mark (MCQ, fill in the blank, VSA)",
      "two_mark":   "Short answer type — what specifically",
      "three_mark": "Medium answer type — what specifically",
      "five_mark":  "Long answer / diagram / derivation — what specifically"
    },
    "study_strategy": ["Strategy point 1", "Strategy point 2"],
    "key_terms_and_formulas": ["v = u + at (first equation of motion)", "Another formula or term"]
  },
  "chapter_content": {
    "overview": "Chapter-opening paragraph (learning objectives / what we will study).",
    "sections": [
      {
        "title": "Section heading (e.g., '1.1 Introduction to Motion')",
        "content": "Full section content in Markdown. Use **bold** for key terms, - for bullets, ## sub-headings if needed.",
        "examples": [
          { "problem": "Example problem statement.", "solution": "Step-by-step solution in Markdown." }
        ],
        "key_terms": ["term1", "term2"]
      }
    ],
    "formulas": [
      { "formula": "v = u + at", "variables": "v = final velocity, u = initial velocity, a = acceleration, t = time" }
    ],
    "summary": ["Summary point 1.", "Summary point 2."]
  }
}
CRITICAL: Output ONLY the JSON object. Markdown allowed inside string values.
`.trim();
}

// ─── Prompt B: Exercises + practice questions ─────────────────────────────────

function buildExercisesAndPracticePrompt(ctx) {
  const { subject, chapterName, chapterNumber, topics, hasPdf } = ctx;
  const topicList = topics.length ? topics.join(', ') : 'all standard topics for this chapter';

  const exerciseInstruction = hasPdf
    ? `Extract ALL exercise questions printed at the END of the chapter from the PDF text above.
       These are typically labeled "Exercises", "Questions", "NCERT Exercises", "Exercise X.X", etc.
       List every question exactly as it appears.`
    : `Generate 8-12 typical textbook exercise questions for this chapter,
       in the style of NCERT end-of-chapter exercises.`;

  return `
${ctxHeader(ctx)}

══════════════════════════════════════════════════════════
ROLE
══════════════════════════════════════════════════════════
You are Syllabrix's exam preparation expert. Write model answers that are:
  • In SIMPLE ENGLISH (no complicated vocabulary)
  • Always in BULLET POINTS (never a long paragraph for an answer)
  • Complete and mark-worthy
  • Appropriate to the marks allocated

══════════════════════════════════════════════════════════
TASK A — CHAPTER EXERCISE Q&A
══════════════════════════════════════════════════════════
${exerciseInstruction}

For EACH exercise question provide:
  • The exact question text
  • The marks (estimate if not printed: 1/2/3/5)
  • A model answer in bullet points — simple English, complete coverage

══════════════════════════════════════════════════════════
TASK B — EXTRA PRACTICE QUESTIONS
══════════════════════════════════════════════════════════
Topics to cover: ${topicList}

Generate exactly:
  • 6 questions worth 1 mark each  (MCQ or very short answer)
  • 6 questions worth 2 marks each (short answer)
  • 5 questions worth 3 marks each (medium answer)
  • 3 questions worth 5 marks each (long answer / derivation / diagram)

For EACH practice question:
  • Label which topic it covers
  • Write the question clearly
  • Provide a model answer in bullet points
  • Answers for 1-mark questions: 1 bullet
  • Answers for 2-mark questions: 2 bullets
  • Answers for 3-mark questions: 3 bullets
  • Answers for 5-mark questions: 5+ bullets

══════════════════════════════════════════════════════════
OUTPUT FORMAT — Return ONLY valid JSON, no markdown fences
══════════════════════════════════════════════════════════
{
  "exercises": [
    {
      "number": "1",
      "question": "Full question text exactly as in the chapter/textbook.",
      "marks": 3,
      "answer_points": [
        "Point 1 in simple English.",
        "Point 2 in simple English.",
        "Point 3 in simple English."
      ]
    }
  ],
  "practice": {
    "one_mark": [
      { "topic": "Topic name", "question": "Question text.", "answer": "Single-line answer." }
    ],
    "two_mark": [
      { "topic": "Topic name", "question": "Question text.", "answer_points": ["Point 1.", "Point 2."] }
    ],
    "three_mark": [
      { "topic": "Topic name", "question": "Question text.", "answer_points": ["Point 1.", "Point 2.", "Point 3."] }
    ],
    "five_mark": [
      { "topic": "Topic name", "question": "Question text.", "answer_points": ["Point 1.", "Point 2.", "Point 3.", "Point 4.", "Point 5."] }
    ]
  }
}
CRITICAL: Output ONLY the JSON object. Markdown allowed inside string values.
`.trim();
}

// ─── Normalisers ──────────────────────────────────────────────────────────────

function normaliseGuide(g = {}) {
  return {
    overview:                g.overview                || '',
    why_it_matters:          g.why_it_matters          || '',
    topics_at_a_glance:      Array.isArray(g.topics_at_a_glance)      ? g.topics_at_a_glance      : [],
    marks_distribution:      g.marks_distribution      || {},
    study_strategy:          Array.isArray(g.study_strategy)          ? g.study_strategy          : [],
    key_terms_and_formulas:  Array.isArray(g.key_terms_and_formulas)  ? g.key_terms_and_formulas  : [],
  };
}

function normaliseContent(c = {}) {
  return {
    overview: c.overview || '',
    sections: Array.isArray(c.sections) ? c.sections.map(s => ({
      title:     s.title    || '',
      content:   s.content  || '',
      examples:  Array.isArray(s.examples)  ? s.examples  : [],
      key_terms: Array.isArray(s.key_terms) ? s.key_terms : [],
    })) : [],
    formulas: Array.isArray(c.formulas) ? c.formulas : [],
    summary:  Array.isArray(c.summary)  ? c.summary  : [],
  };
}

function normaliseExercises(exs) {
  if (!Array.isArray(exs)) return [];
  return exs.map(e => ({
    number:        e.number        || '',
    question:      e.question      || '',
    marks:         Number(e.marks) || 0,
    answer_points: Array.isArray(e.answer_points) ? e.answer_points : [],
  }));
}

function normalisePractice(p = {}) {
  const clean = (arr) => Array.isArray(arr) ? arr.map(q => ({
    topic:         q.topic         || '',
    question:      q.question      || '',
    answer:        q.answer        || '',
    answer_points: Array.isArray(q.answer_points) ? q.answer_points : [],
  })) : [];
  return {
    one_mark:   clean(p.one_mark),
    two_mark:   clean(p.two_mark),
    three_mark: clean(p.three_mark),
    five_mark:  clean(p.five_mark),
  };
}

module.exports = { generateChapter };
