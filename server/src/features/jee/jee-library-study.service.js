const { pool } = require('../../database/connection');
const { getGeminiModel } = require('../../utils/gemini-utils');

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lib_topic_content (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      topic_id     INT NOT NULL,
      content_type VARCHAR(50) NOT NULL,
      content      LONGTEXT,
      generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_topic_type (topic_id, content_type),
      INDEX idx_topic (topic_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

// JSON mode: forces Gemini to return raw JSON — no markdown, no prose wrapper
const JSON_CONFIG = {
  responseMimeType: 'application/json',
  maxOutputTokens: 8000,
  temperature: 0.3,
};

// ── GET CHAPTERS FROM LIBRARY ─────────────────────────────────────────────────
exports.getLibraryChapters = async (req, res) => {
  try {
    await ensureTable();

    const { subject, class: classLevel } = req.query;
    if (!subject || !classLevel) {
      return res.status(400).json({ success: false, message: 'subject and class required' });
    }

    const grade = parseInt(classLevel);
    const s = subject.toLowerCase();

    let subjectLike;
    if (s === 'maths' || s === 'math' || s === 'mathematics') subjectLike = 'math%';
    else if (s === 'biology' || s === 'bio')                   subjectLike = '%bio%';
    else                                                        subjectLike = `%${s}%`;

    // Primary: prefer science stream, no is_official restriction
    const [books] = await pool.query(`
      SELECT bk.id, bk.title, bk.cover_image_url,
             s.name AS subject_name, cl.grade, cl.stream
      FROM   books bk
      JOIN   subjects s  ON s.id  = bk.subject_id AND s.is_active = 1
      JOIN   classes  cl ON cl.id = s.class_id    AND cl.grade   = ?
      JOIN   boards   b  ON b.id  = cl.board_id
      WHERE  LOWER(s.name) LIKE ?
        AND (b.type = 'national' OR UPPER(b.code) IN ('CBSE','NCERT'))
        AND  cl.stream IN ('science','general','NA')
      ORDER BY
        CASE WHEN cl.stream = 'science' THEN 0 ELSE 1 END ASC,
        bk.priority_rank ASC, bk.id ASC
      LIMIT 5
    `, [grade, subjectLike]);

    // Fallback: drop board/stream filters
    let chosen = books;
    if (!chosen.length) {
      const [fallback] = await pool.query(`
        SELECT bk.id, bk.title, bk.cover_image_url,
               s.name AS subject_name, cl.grade, cl.stream
        FROM   books bk
        JOIN   subjects s  ON s.id  = bk.subject_id
        JOIN   classes  cl ON cl.id = s.class_id AND cl.grade = ?
        WHERE  LOWER(s.name) LIKE ?
        ORDER BY bk.priority_rank ASC, bk.id ASC
        LIMIT 5
      `, [grade, subjectLike]);
      chosen = fallback;
    }

    if (!chosen.length) {
      return res.json({ success: true, data: [], book: null, source: 'empty' });
    }

    const book = chosen[0];

    const [chapters] = await pool.query(`
      SELECT ch.id, ch.chapter_number, ch.title, ch.description,
             ch.estimated_study_time_mins,
             COUNT(t.id)                                             AS topic_count,
             SUM(CASE WHEN lc.id IS NOT NULL THEN 1 ELSE 0 END)     AS notes_count
      FROM   chapters ch
      LEFT JOIN topics            t  ON t.chapter_id  = ch.id
      LEFT JOIN lib_topic_content lc ON lc.topic_id   = t.id
                                    AND lc.content_type = 'notes'
      WHERE  ch.book_id = ?
      GROUP BY ch.id
      ORDER BY ch.chapter_number ASC, ch.id ASC
    `, [book.id]);

    res.json({
      success: true,
      data: chapters,
      book: { id: book.id, title: book.title, cover: book.cover_image_url,
              subject: book.subject_name, grade: book.grade },
    });
  } catch (e) {
    console.error('[lib-study] getLibraryChapters:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GET CHAPTER + TOPICS ──────────────────────────────────────────────────────
exports.getChapterWithTopics = async (req, res) => {
  try {
    await ensureTable();

    const [rows] = await pool.query(`
      SELECT ch.id, ch.chapter_number, ch.title, ch.description, ch.key_concepts,
             bk.id AS book_id, bk.title AS book_title,
             s.name AS subject_name, cl.grade
      FROM   chapters ch
      JOIN   books    bk ON bk.id = ch.book_id
      JOIN   subjects s  ON s.id  = bk.subject_id
      JOIN   classes  cl ON cl.id = s.class_id
      WHERE  ch.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Chapter not found' });
    const chapter = rows[0];

    const [topics] = await pool.query(`
      SELECT t.id, t.title, t.topic_order, t.weightage_percent,
             CASE WHEN lc.id IS NOT NULL THEN 1 ELSE 0 END AS has_notes
      FROM   topics t
      LEFT JOIN lib_topic_content lc ON lc.topic_id = t.id AND lc.content_type = 'notes'
      WHERE  t.chapter_id = ?
      ORDER BY t.topic_order ASC
    `, [chapter.id]);

    res.json({ success: true, chapter, topics });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GENERATE CHAPTER TOPICS ───────────────────────────────────────────────────
exports.generateChapterTopics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ch.id, ch.chapter_number, ch.title,
             s.name AS subject_name, cl.grade
      FROM   chapters ch
      JOIN   books    bk ON bk.id = ch.book_id
      JOIN   subjects s  ON s.id  = bk.subject_id
      JOIN   classes  cl ON cl.id = s.class_id
      WHERE  ch.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Chapter not found' });
    const ch = rows[0];

    // Idempotent — return existing topics if already generated
    const [existing] = await pool.query(
      `SELECT id, title, topic_order, 0 AS has_notes FROM topics WHERE chapter_id = ? ORDER BY topic_order ASC`,
      [ch.id]
    );
    if (existing.length) {
      return res.json({ success: true, topics: existing, source: 'existing' });
    }

    // Single Gemini call with JSON mode — no grounding needed, Gemini knows NCERT well
    const model = getGeminiModel('gemini-2.0-flash');
    const prompt = `You are an expert on NCERT textbooks. List every numbered section in:

NCERT Class ${ch.grade} ${ch.subject_name} — Chapter ${ch.chapter_number}: "${ch.title}"

Use the real NCERT section numbering (${ch.chapter_number}.1, ${ch.chapter_number}.2, ...).
Include ALL sections, including introduction and summary sections.

Return a JSON array. Each element has "order" (integer, 1-based) and "title" (string, exact NCERT name).
Example: [{"order":1,"title":"Introduction"},{"order":2,"title":"Path Length"}]`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { ...JSON_CONFIG, maxOutputTokens: 1200 },
    });

    let topicsRaw;
    try {
      topicsRaw = JSON.parse(result.response.text());
    } catch (parseErr) {
      console.error('[lib-study] topics parse error:', result.response.text().slice(0, 200));
      throw new Error('AI returned invalid JSON for topic list');
    }

    if (!Array.isArray(topicsRaw) || !topicsRaw.length) {
      throw new Error('AI returned empty topic list');
    }

    // Insert topics one by one (safest, avoids bulk-insert edge cases)
    for (let i = 0; i < topicsRaw.length; i++) {
      const title = String(topicsRaw[i].title || '').trim().slice(0, 290);
      const order = parseInt(topicsRaw[i].order) || (i + 1);
      if (!title) continue;
      await pool.query(
        `INSERT IGNORE INTO topics (chapter_id, title, topic_order) VALUES (?, ?, ?)`,
        [ch.id, title, order]
      );
    }

    const [created] = await pool.query(
      `SELECT id, title, topic_order, 0 AS has_notes FROM topics WHERE chapter_id = ? ORDER BY topic_order ASC`,
      [ch.id]
    );

    res.json({ success: true, topics: created, source: 'generated' });
  } catch (e) {
    console.error('[lib-study] generateChapterTopics:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GET CACHED NOTES ──────────────────────────────────────────────────────────
exports.getTopicContent = async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.query(
      `SELECT content, generated_at FROM lib_topic_content WHERE topic_id = ? AND content_type = 'notes'`,
      [req.params.id]
    );
    if (rows.length) {
      return res.json({ success: true, data: JSON.parse(rows[0].content), cached: true, generated_at: rows[0].generated_at });
    }
    res.json({ success: true, data: null, cached: false });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GENERATE TOPIC NOTES ──────────────────────────────────────────────────────
exports.generateTopicContent = async (req, res) => {
  try {
    await ensureTable();

    const [rows] = await pool.query(`
      SELECT t.id, t.title, t.topic_order,
             ch.chapter_number, ch.title AS chapter_title,
             bk.title AS book_title,
             s.name AS subject_name, cl.grade
      FROM   topics  t
      JOIN   chapters ch ON ch.id = t.chapter_id
      JOIN   books    bk ON bk.id = ch.book_id
      JOIN   subjects s  ON s.id  = bk.subject_id
      JOIN   classes  cl ON cl.id = s.class_id
      WHERE  t.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Topic not found' });
    const t = rows[0];
    const sectionNum = `${t.chapter_number}.${t.topic_order}`;

    const model = getGeminiModel('gemini-2.0-flash');

    const prompt = `You are a brilliant NCERT teacher. Write complete, detailed study notes for a Class ${t.grade} student preparing for JEE/NEET.

Topic: Section ${sectionNum} — "${t.title}"
Chapter ${t.chapter_number}: ${t.chapter_title}
Subject: ${t.subject_name}, Class ${t.grade} (NCERT)

RULES:
- Explain like talking to a curious 16-year-old. Simple, warm, encouraging.
- Use real-life examples (cricket, smartphones, kitchen, cars).
- Show EVERY derivation step — never skip. Explain each step in plain English.
- For every formula: where it comes from + trick to remember it.
- Use $...$  for inline math and $$...$$ for displayed equations.

Return a single JSON object matching this exact schema:
{
  "summary": "2-3 sentences: what this section covers and why it matters",
  "theory": "Full explanation using ## headings for sub-sections. Min 400 words. Use analogies and $math$ inline, $$math$$ for block equations.",
  "key_points": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "derivations": [
    {
      "name": "Name of what is being derived",
      "why_we_derive": "One sentence: why this result matters",
      "starting_point": "We start from [equation or observation]",
      "steps": ["Step 1: equation. Because reason.", "Step 2: equation. So result."],
      "final_result": "$$final formula$$",
      "remember_as": "Quick 30-second re-derivation trick"
    }
  ],
  "formulas": [
    {
      "name": "Formula name",
      "formula": "$$LaTeX$$",
      "variables": "var = meaning (unit), var2 = meaning (unit)",
      "trick": "Exam shortcut or quick-recall tip",
      "unit_check": "Result unit is [unit]"
    }
  ],
  "solved_example": {
    "problem": "A realistic NCERT-style numerical problem",
    "given": "datum 1, datum 2",
    "to_find": "What to calculate",
    "solution": "Step 1: ...\\nStep 2: ...\\nStep 3: final answer",
    "answer": "Final answer with units",
    "key_insight": "The one idea that makes this problem click"
  },
  "common_mistakes": [
    { "mistake": "What students do wrong", "why_wrong": "Why incorrect", "correct_way": "Right approach" }
  ],
  "fun_fact": "An interesting real-world application or fact about this topic"
}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: JSON_CONFIG,
    });

    let notes;
    try {
      notes = JSON.parse(result.response.text());
    } catch (parseErr) {
      console.error('[lib-study] notes parse error:', result.response.text().slice(0, 300));
      throw new Error('AI returned invalid JSON for notes');
    }

    await pool.query(
      `INSERT INTO lib_topic_content (topic_id, content_type, content) VALUES (?, 'notes', ?)
       ON DUPLICATE KEY UPDATE content = VALUES(content), generated_at = CURRENT_TIMESTAMP`,
      [t.id, JSON.stringify(notes)]
    );

    res.json({ success: true, data: notes, cached: false, section: sectionNum, topic_title: t.title });
  } catch (e) {
    console.error('[lib-study] generateTopicContent:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GENERATE PRACTICE QUESTIONS ───────────────────────────────────────────────
exports.generatePracticeQuestions = async (req, res) => {
  try {
    const { count = 5, difficulty = 'mixed', offset = 0 } = req.query;

    const [rows] = await pool.query(`
      SELECT t.id, t.title, t.topic_order,
             ch.chapter_number, ch.title AS chapter_title,
             s.name AS subject_name, cl.grade
      FROM   topics  t
      JOIN   chapters ch ON ch.id = t.chapter_id
      JOIN   books    bk ON bk.id = ch.book_id
      JOIN   subjects s  ON s.id  = bk.subject_id
      JOIN   classes  cl ON cl.id = s.class_id
      WHERE  t.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Topic not found' });
    const t = rows[0];

    const n       = Math.min(parseInt(count) || 5, 10);
    const off     = parseInt(offset) || 0;
    const diffStr = difficulty === 'mixed' ? '2 easy, 2 medium, 1 hard' : `all ${difficulty}`;

    const TWISTS = [
      'Use completely different scenarios from typical textbook examples.',
      'Focus on application-based problems with real-world context.',
      'Combine multiple concepts in each problem.',
      'Include problems with surprising or counterintuitive answers.',
      'Include problems that appear simple but require careful analysis.',
    ];
    const twist     = TWISTS[Math.floor(Math.random() * TWISTS.length)];
    const batchNote = off > 0 ? `This is batch #${Math.floor(off / n) + 1}. Make problems COMPLETELY DIFFERENT from previous batches.` : '';

    const model  = getGeminiModel('gemini-2.0-flash');
    const prompt = `You are an expert ${t.subject_name} teacher. ${batchNote}

Create ${n} practice problems for:
Section ${t.chapter_number}.${t.topic_order} — "${t.title}" (${t.chapter_title})
Subject: ${t.subject_name}, Class ${t.grade} (NCERT)
Difficulty mix: ${diffStr}
Style: ${twist}

Rules:
- Mix types: MCQ (4 options), Numerical, Short Answer
- MCQ wrong options must be plausible
- Show complete step-by-step solution for every question
- Use $math$ inline and $$math$$ for block equations

Return a JSON array:
[
  {
    "type": "mcq or numerical or short_answer",
    "difficulty": "easy or medium or hard",
    "question": "question text with $math$ where needed",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "hint": "nudge without revealing the answer",
    "solution": "full step-by-step working",
    "answer": "final answer",
    "formula_used": "key formula applied"
  }
]`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { ...JSON_CONFIG, maxOutputTokens: 4000, temperature: 0.75 },
    });

    let questions;
    try {
      questions = JSON.parse(result.response.text());
    } catch {
      questions = [];
    }

    res.json({
      success: true,
      data: Array.isArray(questions) ? questions : [],
      topic: { title: t.title, section: `${t.chapter_number}.${t.topic_order}`, subject: t.subject_name },
    });
  } catch (e) {
    console.error('[lib-study] practice:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};
