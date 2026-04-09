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
function _cacheSet(k, d) { _cache.set(k, { data: d, exp: Date.now() + 6 * 3600_000 }); }

async function getSmartChapters({ board, grade, subject, exam, version }) {
  const ver = (version === 'old') ? 'old' : 'latest';
  const cacheKey = `sc:${board || ''}:${grade || ''}:${subject || ''}:${exam || ''}:${ver}`.toLowerCase();
  const cached = _cacheGet(cacheKey);
  if (cached) return cached;

  // ── 1. NCERT extractor — ONLY for 'latest' (holds 2023-24 rationalized content) ──
  // For 'old' edition we intentionally skip this and fall through to AI generation
  // which will use the pre-2023 comprehensive textbook prompt.
  if (ver === 'latest' && grade && subject && !exam) {
    const toc = await ncertExtractor.getTOC(grade, subject, board || '').catch(() => null);
    if (toc?.chapters?.length > 0) {
      const result = { source: 'ncert', edition: 'latest', bookTitle: toc.bookTitle, chapters: toc.chapters };
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

  // Edition-specific directive block
  const editionBlock = ver === 'latest'
    ? `SYLLABUS EDITION: LATEST (2024-25, NEP 2020 Rationalized NCERT)
- List ONLY chapters present in the CURRENT rationalized textbook.
- DO NOT include chapters deleted in the 2023 rationalization (e.g. Dobereiner's Triads, Newlands' Octaves, deleted evolution units, removed history/geography themes).
- Match the exact chapter count and order of the current official NCERT textbook edition.`
    : `SYLLABUS EDITION: OLD / COMPREHENSIVE (Pre-2023, Full Original NCERT)
- List ALL chapters from the ORIGINAL, UNEDITED NCERT textbook (before the 2023 rationalization cuts).
- INCLUDE chapters that were later deleted: Dobereiner, Newlands, Mendeleev trivia; full evolution chapter; all original history/geography units; "Management of Natural Resources" & "Our Environment" (Class 10); "Clothing: A Social History" (Class 9 History); etc.
- Represent the complete textbook as it existed before the Neo rationalization.`;

  const prompt = `You are a curriculum expert with complete knowledge of all standard textbooks.

Context: ${contextLine}
${editionBlock}

Task: List ALL chapters from the specified edition of the official/standard textbook for this context.
For exams (JEE, NEET, UPSC, etc.) list chapters from the standard reference textbooks (edition context does not apply, always use complete chapters).

Return ONLY valid JSON (no markdown fences, no extra text):
{
  "bookTitle": "Full official book title (include 'Rationalized' or year if known)",
  "chapters": [
    { "num": 1, "name": "Exact chapter name from textbook", "topics": ["Key topic 1", "Key topic 2", "Key topic 3", "Key topic 4"] },
    { "num": 2, "name": "...", "topics": ["...", "...", "..."] }
  ]
}

Rules:
- Include ALL chapters in the correct order for the specified edition
- Use exact chapter names as they appear in the textbook
- 3-5 key topics per chapter (subtopics/sections)
- For exam subjects (JEE Physics, NEET Biology etc.), use NCERT + standard reference chapters
- Be accurate and complete`;

  try {
    const result = await generateJSON(prompt, { temperature: 0.2, maxTokens: 8000 });
    if (result?.chapters?.length > 0) {
      const out = {
        source:     'ai',
        edition:    ver,
        bookTitle:  result.bookTitle || `${board || ''} ${grade ? 'Class ' + grade : ''} ${subject || exam || ''}`.trim(),
        chapters:   result.chapters,
      };
      _cacheSet(cacheKey, out);
      return out;
    }
  } catch (err) {
    console.error('[Smart Chapters] AI generation failed:', err.message);
  }

  return { source: 'none', bookTitle: '', chapters: [] };
}

module.exports = { getSmartChapters };
