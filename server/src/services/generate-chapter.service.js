'use strict';
/**
 * Generate Chapter Service
 * Produces a full chapter in Syllabrix style: same topics/examples as the
 * source textbook, written in original language to avoid copyright, with
 * in-text Q&A and topic-wise practice questions.
 */

const { generateJSON } = require('./ai.service');

async function generateChapter({ board, grade, subject, chapterName, chapterNumber, topics = [], syllabusVersion = 'latest' }) {
  const prompt = buildPrompt({ board, grade, subject, chapterName, chapterNumber, topics, syllabusVersion });

  const result = await generateJSON(prompt, {
    task: 'reasoning',
    temperature: 0.45,
    maxTokens: 8192,
  });

  return normalise(result);
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt({ board, grade, subject, chapterName, chapterNumber, topics, syllabusVersion }) {
  const isLatest = !syllabusVersion || syllabusVersion === 'latest';
  const gradeLabel = grade ? `Class ${grade}` : '';
  const boardLabel = board ? `${board.toUpperCase()} Board` : 'CBSE / NCERT';
  const topicList = topics.length > 0 ? topics.join(', ') : 'all standard topics for this chapter';

  return `
══════════════════════════════════════════════════════════
ROLE
══════════════════════════════════════════════════════════
You are Syllabrix's master content author — an expert educator who writes complete
textbook chapters for Indian students. You have deep knowledge of every NCERT,
CBSE, and state-board textbook. Your writing is clear, engaging, and exam-focused.

══════════════════════════════════════════════════════════
TASK
══════════════════════════════════════════════════════════
Write the COMPLETE chapter content for:
  Board / Curriculum : ${boardLabel}
  Grade / Level      : ${gradeLabel}
  Subject            : ${subject}
  Chapter            : ${chapterNumber ? `Chapter ${chapterNumber} — ` : ''}${chapterName}
  Syllabus Edition   : ${isLatest ? 'Latest (2024-25, NEP 2020 Rationalized)' : 'Old (Pre-2023, Full original NCERT)'}
  Topics to cover    : ${topicList}

══════════════════════════════════════════════════════════
CONTENT RULES
══════════════════════════════════════════════════════════
1. ORIGINAL WRITING — Same topics, same examples, same diagrams as the standard
   textbook, but written entirely in your own words. NO copy-paste. Syllabrix must
   be copyright-free.
2. SYLLABRIX STYLE — Conversational yet precise. Use **bold** for key terms.
   Short paragraphs. Numbered/bulleted lists where useful.
3. SECTIONS — Create 4-7 logical sections matching the standard chapter structure.
   Each section must have:
   • Full explanation (200-400 words minimum, use Markdown)
   • At least one worked example (problem + step-by-step solution)
   • 1-2 in-text questions with complete answers (simulating textbook exercises)
4. FORMULAS — List every important formula from the chapter with a brief note on
   each variable.
5. CHAPTER SUMMARY — A concise 6-10 point bulleted summary of everything covered.
6. PRACTICE QUESTIONS — Generate per the chapter, topic-wise:
   • 8 MCQs with 4 options, correct answer (A/B/C/D), and explanation
   • 6 short-answer questions (2-3 marks each) with model answers
   • 4 long-answer questions (5 marks each) with detailed model answers

══════════════════════════════════════════════════════════
OUTPUT FORMAT
══════════════════════════════════════════════════════════
Return ONLY a valid JSON object. No markdown fences. No extra text outside the JSON.
Schema (fill ALL fields; use empty arrays/strings for non-applicable fields):

{
  "overview": "Introductory paragraph for the full chapter (100-150 words).",
  "sections": [
    {
      "title": "Section heading (e.g., '1.1 Introduction to Motion')",
      "content": "Full section content in Markdown (bold terms, bullets, paragraphs).",
      "key_concepts": ["concept1", "concept2"],
      "worked_example": {
        "problem": "Example problem statement.",
        "solution": "Step-by-step solution in Markdown."
      },
      "intext_questions": [
        { "question": "In-text question text.", "answer": "Complete model answer." }
      ]
    }
  ],
  "chapter_summary": ["Summary point 1.", "Summary point 2."],
  "key_formulas": [
    { "formula": "v = u + at", "description": "First equation of motion. v=final velocity, u=initial velocity, a=acceleration, t=time." }
  ],
  "practice": {
    "mcq": [
      {
        "topic": "Topic name this MCQ tests",
        "question": "MCQ question text.",
        "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
        "correct": "B",
        "explanation": "Why B is correct."
      }
    ],
    "short_answer": [
      { "topic": "Topic name", "question": "Short-answer question.", "answer": "Model answer." }
    ],
    "long_answer": [
      { "topic": "Topic name", "question": "Long-answer question.", "answer": "Detailed model answer in Markdown." }
    ]
  }
}

CRITICAL: Output ONLY the JSON. The response will be parsed with JSON.parse().
Markdown is allowed inside string values only.
`.trim();
}

// ─── Normaliser ───────────────────────────────────────────────────────────────

function normalise(r) {
  return {
    overview:        r.overview        || '',
    sections:        Array.isArray(r.sections) ? r.sections.map(s => ({
      title:             s.title             || '',
      content:           s.content           || '',
      key_concepts:      Array.isArray(s.key_concepts) ? s.key_concepts : [],
      worked_example:    s.worked_example    || null,
      intext_questions:  Array.isArray(s.intext_questions) ? s.intext_questions : [],
    })) : [],
    chapter_summary: Array.isArray(r.chapter_summary) ? r.chapter_summary : [],
    key_formulas:    Array.isArray(r.key_formulas)    ? r.key_formulas    : [],
    practice: {
      mcq:          Array.isArray(r.practice?.mcq)          ? r.practice.mcq          : [],
      short_answer: Array.isArray(r.practice?.short_answer) ? r.practice.short_answer : [],
      long_answer:  Array.isArray(r.practice?.long_answer)  ? r.practice.long_answer  : [],
    },
  };
}

module.exports = { generateChapter };
