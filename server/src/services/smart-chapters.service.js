'use strict';
/**
 * smart-chapters.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns a full chapter list for ANY textbook/subject/exam.
 *
 * Priority chain:
 *   1. NCERT extractor  — instant, accurate, covers 23 states + CBSE classes 6-12
 *   2. AI generation    — Gemini's training knowledge covers every standard
 *                         textbook worldwide. Returns structured JSON.
 *
 * Input:  { board, grade, subject, exam, subjectName }
 * Output: { source, bookTitle, chapters: [{num, name, topics:[]}] }
 */

const { generateJSON } = require('./ai.service');
const ncertExtractor   = require('./ncert-extractor.service');

// In-memory cache — TTL 12 hr (chapters don't change often)
const _cache = new Map();
function _cacheGet(k) { const v = _cache.get(k); if (!v) return null; if (Date.now() > v.exp) { _cache.delete(k); return null; } return v.data; }
function _cacheSet(k, d) { _cache.set(k, { data: d, exp: Date.now() + 12 * 3600_000 }); }

async function getSmartChapters({ board, grade, subject, exam }) {
  const cacheKey = `sc:${board || ''}:${grade || ''}:${subject || ''}:${exam || ''}`.toLowerCase();
  const cached = _cacheGet(cacheKey);
  if (cached) return cached;

  // ── 1. NCERT extractor (Classes 6-12, CBSE + 23 state boards) ──────────────
  if (grade && subject && !exam) {
    const toc = await ncertExtractor.getTOC(grade, subject, board || '').catch(() => null);
    if (toc?.chapters?.length > 0) {
      const result = { source: 'ncert', bookTitle: toc.bookTitle, chapters: toc.chapters };
      _cacheSet(cacheKey, result);
      return result;
    }
  }

  // ── 2. AI generation — works for ANY textbook in the world ─────────────────
  let contextLine;
  if (exam) {
    contextLine = `Exam: ${exam} | Subject: ${subject}`;
  } else {
    contextLine = [
      board  && `Board: ${board}`,
      grade  && `Class: ${grade}`,
      subject && `Subject: ${subject}`,
    ].filter(Boolean).join(' | ');
  }

  const prompt = `You are a curriculum expert with complete knowledge of all standard textbooks.

Context: ${contextLine}

Task: List ALL chapters from the official/standard textbook for this context.
For exams (JEE, NEET, UPSC, etc.) list the chapters from the standard reference textbooks.

Return ONLY valid JSON (no markdown fences, no extra text):
{
  "bookTitle": "Full official book title",
  "chapters": [
    { "num": 1, "name": "Exact chapter name from textbook", "topics": ["Key topic 1", "Key topic 2", "Key topic 3", "Key topic 4"] },
    { "num": 2, "name": "...", "topics": ["...", "...", "..."] }
  ]
}

Rules:
- Include ALL chapters in the correct order
- Use exact chapter names as they appear in the textbook
- 3-5 key topics per chapter (subtopics/sections)
- For exam subjects (JEE Physics, NEET Biology etc.), use NCERT + standard reference chapters
- Be accurate and complete`;

  try {
    const result = await generateJSON(prompt, { temperature: 0.1, maxTokens: 2000 });
    if (result?.chapters?.length > 0) {
      const out = {
        source:     'ai',
        bookTitle:  result.bookTitle || `${board || ''} ${grade ? 'Class ' + grade : ''} ${subject || exam || ''}`.trim(),
        chapters:   result.chapters,
      };
      _cacheSet(cacheKey, out);
      return out;
    }
  } catch { /* fall through */ }

  return { source: 'none', bookTitle: '', chapters: [] };
}

module.exports = { getSmartChapters };
