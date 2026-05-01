const { pool } = require('../../database/connection');
const { getGeminiModel, GEMINI_TIERS } = require('../../utils/gemini-utils');

// ── Table bootstrap ───────────────────────────────────────────────────────────
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

// ── Model fallback wrapper ────────────────────────────────────────────────────
// Tries each Gemini model in order; skips on quota/rate-limit errors (429).
// Resolves with { text, modelUsed } or throws if all models are exhausted.
async function callGemini(prompt, generationConfig) {
  let lastErr;
  for (const modelId of GEMINI_TIERS) {
    try {
      const model  = getGeminiModel(modelId);
      const result = await model.generateContent({
        contents:         [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      return { text: result.response.text(), modelUsed: modelId };
    } catch (e) {
      lastErr = e;
      const msg = e.message || '';
      // Only retry on quota / rate-limit errors
      if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate')) {
        console.warn(`[gemini] ${modelId} rate-limited, trying next model…`);
        continue;
      }
      throw e; // Non-quota errors bubble up immediately
    }
  }
  throw lastErr;
}

// ── Parse plain JSON from AI response (strips any markdown fences) ─────────────
function parseJSON(text) {
  const clean = text.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(clean);
}

// ── Standard NCERT section list for each subject as last-resort fallback ──────
function defaultTopics(chapterNum, chapterTitle, subjectName) {
  const sub = (subjectName || '').toLowerCase();
  let sections;
  if (sub.includes('phys') || sub.includes('chem') || sub.includes('math')) {
    sections = [
      'Introduction',
      'Basic Concepts and Definitions',
      'Laws and Principles',
      'Mathematical Treatment and Derivations',
      'Solved Examples',
      'Applications in Real Life',
      'Summary and Key Points',
    ];
  } else {
    sections = [
      'Introduction',
      'Key Concepts',
      'Detailed Study',
      'Examples and Case Studies',
      'Summary',
    ];
  }
  return sections.map((title, i) => ({ order: i + 1, title }));
}

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
      ORDER BY CASE WHEN cl.stream='science' THEN 0 ELSE 1 END, bk.priority_rank ASC, bk.id ASC
      LIMIT 5
    `, [grade, subjectLike]);

    let chosen = books;
    if (!chosen.length) {
      const [fb] = await pool.query(`
        SELECT bk.id, bk.title, bk.cover_image_url, s.name AS subject_name, cl.grade, cl.stream
        FROM books bk
        JOIN subjects s  ON s.id  = bk.subject_id
        JOIN classes  cl ON cl.id = s.class_id AND cl.grade = ?
        WHERE LOWER(s.name) LIKE ?
        ORDER BY bk.priority_rank ASC, bk.id ASC LIMIT 5
      `, [grade, subjectLike]);
      chosen = fb;
    }

    if (!chosen.length) return res.json({ success: true, data: [], book: null });

    const book = chosen[0];
    const [chapters] = await pool.query(`
      SELECT ch.id, ch.chapter_number, ch.title, ch.description,
             ch.estimated_study_time_mins,
             COUNT(t.id)                                          AS topic_count,
             SUM(CASE WHEN lc.id IS NOT NULL THEN 1 ELSE 0 END)  AS notes_count
      FROM   chapters ch
      LEFT JOIN topics            t  ON t.chapter_id  = ch.id
      LEFT JOIN lib_topic_content lc ON lc.topic_id   = t.id AND lc.content_type='notes'
      WHERE  ch.book_id = ?
      GROUP  BY ch.id
      ORDER  BY ch.chapter_number ASC, ch.id ASC
    `, [book.id]);

    res.json({
      success: true, data: chapters,
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

    const [topics] = await pool.query(`
      SELECT t.id, t.title, t.topic_order,
             CASE WHEN lc.id IS NOT NULL THEN 1 ELSE 0 END AS has_notes
      FROM   topics t
      LEFT JOIN lib_topic_content lc ON lc.topic_id=t.id AND lc.content_type='notes'
      WHERE  t.chapter_id = ?
      ORDER BY t.topic_order ASC
    `, [rows[0].id]);

    res.json({ success: true, chapter: rows[0], topics });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GENERATE CHAPTER TOPICS ───────────────────────────────────────────────────
exports.generateChapterTopics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ch.id, ch.chapter_number, ch.title, s.name AS subject_name, cl.grade
      FROM   chapters ch
      JOIN   books bk ON bk.id=ch.book_id
      JOIN   subjects s ON s.id=bk.subject_id
      JOIN   classes  cl ON cl.id=s.class_id
      WHERE  ch.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Chapter not found' });
    const ch = rows[0];

    // Return existing topics if already generated
    const [existing] = await pool.query(
      `SELECT id, title, topic_order, 0 AS has_notes FROM topics WHERE chapter_id=? ORDER BY topic_order ASC`,
      [ch.id]
    );
    if (existing.length) return res.json({ success: true, topics: existing, source: 'existing' });

    // Ask AI for the NCERT section list
    let sections = [];
    try {
      const prompt = `List every numbered section in NCERT Class ${ch.grade} ${ch.subject_name} Chapter ${ch.chapter_number}: "${ch.title}".

Use real NCERT section numbers like ${ch.chapter_number}.1, ${ch.chapter_number}.2, etc.
Include ALL sections from Introduction to Summary.

Return ONLY a JSON array. No explanation, no markdown:
[{"order":1,"title":"Introduction"},{"order":2,"title":"..."}]`;

      const { text } = await callGemini(prompt, {
        responseMimeType: 'application/json',
        maxOutputTokens:  1000,
        temperature:      0.1,
      });

      const parsed = parseJSON(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        sections = parsed;
      }
    } catch (aiErr) {
      console.warn('[lib-study] AI topic generation failed:', aiErr.message, '— using default sections');
    }

    // Guaranteed fallback: always produce usable topics even when AI is down
    if (!sections.length) {
      sections = defaultTopics(ch.chapter_number, ch.title, ch.subject_name);
    }

    // Insert topics
    for (let i = 0; i < sections.length; i++) {
      const title = String(sections[i].title || '').trim().slice(0, 290);
      const order = parseInt(sections[i].order) || (i + 1);
      if (!title) continue;
      await pool.query(
        `INSERT IGNORE INTO topics (chapter_id, title, topic_order) VALUES (?,?,?)`,
        [ch.id, title, order]
      );
    }

    const [created] = await pool.query(
      `SELECT id, title, topic_order, 0 AS has_notes FROM topics WHERE chapter_id=? ORDER BY topic_order ASC`,
      [ch.id]
    );

    res.json({ success: true, topics: created, source: sections.length ? 'ai' : 'default' });
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
      `SELECT content, generated_at FROM lib_topic_content WHERE topic_id=? AND content_type='notes'`,
      [req.params.id]
    );
    if (rows.length) {
      return res.json({ success: true, data: JSON.parse(rows[0].content), cached: true });
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
             bk.title AS book_title, s.name AS subject_name, cl.grade
      FROM   topics t
      JOIN   chapters ch ON ch.id=t.chapter_id
      JOIN   books    bk ON bk.id=ch.book_id
      JOIN   subjects s  ON s.id=bk.subject_id
      JOIN   classes  cl ON cl.id=s.class_id
      WHERE  t.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Topic not found' });
    const t   = rows[0];
    const sec = `${t.chapter_number}.${t.topic_order}`;

    const prompt = `You are a brilliant NCERT teacher writing study notes for Class ${t.grade} students preparing for JEE/NEET.

Topic: Section ${sec} — "${t.title}"
Chapter ${t.chapter_number}: ${t.chapter_title}
Subject: ${t.subject_name}, Class ${t.grade}

Write detailed, student-friendly notes. Rules:
- Explain simply, like talking to a curious 16-year-old
- Use real-life analogies (cricket, smartphones, kitchen, cars)
- Show EVERY derivation step in plain English
- Use $...$ for inline math and $$...$$ for block equations

Return a JSON object with this exact structure:
{
  "summary": "2-3 sentences about what this section covers and why it matters",
  "theory": "Full explanation with ## headings. Min 400 words. Include analogies, $inline math$, $$block equations$$.",
  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "derivations": [
    {
      "name": "What is being derived",
      "why_we_derive": "Why this result matters",
      "starting_point": "Starting equation or observation",
      "steps": ["Step 1: equation — reason", "Step 2: equation — reason"],
      "final_result": "$$final formula$$",
      "remember_as": "Quick memory trick"
    }
  ],
  "formulas": [
    {
      "name": "Formula name",
      "formula": "$$LaTeX$$",
      "variables": "var = meaning (unit)",
      "trick": "Exam shortcut",
      "unit_check": "Result unit is ..."
    }
  ],
  "solved_example": {
    "problem": "Realistic NCERT-style numerical problem",
    "given": "Given values",
    "to_find": "What to calculate",
    "solution": "Step-by-step working",
    "answer": "Final answer with units",
    "key_insight": "The one idea that makes this click"
  },
  "common_mistakes": [
    {"mistake": "Wrong approach", "why_wrong": "Why incorrect", "correct_way": "Right approach"}
  ],
  "fun_fact": "Interesting real-world application of this topic"
}`;

    const { text, modelUsed } = await callGemini(prompt, {
      responseMimeType: 'application/json',
      maxOutputTokens:  7000,
      temperature:      0.4,
    });

    const notes = parseJSON(text);

    await pool.query(
      `INSERT INTO lib_topic_content (topic_id, content_type, content) VALUES (?,'notes',?)
       ON DUPLICATE KEY UPDATE content=VALUES(content), generated_at=CURRENT_TIMESTAMP`,
      [t.id, JSON.stringify(notes)]
    );

    res.json({ success: true, data: notes, cached: false, model: modelUsed, section: sec });
  } catch (e) {
    console.error('[lib-study] generateTopicContent:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GENERATE PRACTICE QUESTIONS ───────────────────────────────────────────────
exports.generatePracticeQuestions = async (req, res) => {
  try {
    const { count=5, difficulty='mixed', offset=0 } = req.query;

    const [rows] = await pool.query(`
      SELECT t.id, t.title, t.topic_order,
             ch.chapter_number, ch.title AS chapter_title,
             s.name AS subject_name, cl.grade
      FROM   topics t
      JOIN   chapters ch ON ch.id=t.chapter_id
      JOIN   books    bk ON bk.id=ch.book_id
      JOIN   subjects s  ON s.id=bk.subject_id
      JOIN   classes  cl ON cl.id=s.class_id
      WHERE  t.id=?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Topic not found' });
    const t   = rows[0];
    const n   = Math.min(parseInt(count)||5, 10);
    const off = parseInt(offset)||0;

    const diffStr  = difficulty==='mixed' ? '2 easy, 2 medium, 1 hard' : `all ${difficulty}`;
    const batchTag = off>0 ? `Batch #${Math.floor(off/n)+1} — make problems COMPLETELY DIFFERENT from previous batches.` : '';

    const prompt = `You are an expert ${t.subject_name} teacher. ${batchTag}

Create ${n} practice problems for:
Section ${t.chapter_number}.${t.topic_order} — "${t.title}" (${t.chapter_title})
Subject: ${t.subject_name}, Class ${t.grade}
Difficulty: ${diffStr}

Rules:
- Mix MCQ, Numerical, Short Answer types
- MCQ wrong options must be plausible
- Show complete step-by-step solution
- Use $math$ inline and $$math$$ for block equations

Return a JSON array:
[{
  "type": "mcq or numerical or short_answer",
  "difficulty": "easy or medium or hard",
  "question": "question text",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "hint": "nudge without revealing answer",
  "solution": "full step-by-step working",
  "answer": "final answer",
  "formula_used": "key formula"
}]`;

    const { text } = await callGemini(prompt, {
      responseMimeType: 'application/json',
      maxOutputTokens:  4000,
      temperature:      0.8,
    });

    let questions = [];
    try { questions = parseJSON(text); } catch { questions = []; }

    res.json({
      success: true,
      data: Array.isArray(questions) ? questions : [],
      topic: { title: t.title, section: `${t.chapter_number}.${t.topic_order}` },
    });
  } catch (e) {
    console.error('[lib-study] practice:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};
