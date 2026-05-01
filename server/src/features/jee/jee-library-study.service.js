const { pool } = require('../../database/connection');
const { getGeminiModel } = require('../../utils/gemini-utils');

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lib_topic_content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      topic_id INT NOT NULL,
      content_type VARCHAR(50) NOT NULL,
      content LONGTEXT,
      generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_topic_type (topic_id, content_type),
      INDEX idx_topic (topic_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

function parseAI(text) {
  try {
    const s = text.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(s);
  } catch {
    const m = text.match(/[\[{][\s\S]*[\]}]/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Could not parse AI response');
  }
}

// ── GET CHAPTERS FROM LIBRARY ─────────────────────────────────────────────────
// GET /jee/library/chapters?subject=physics&class=11
exports.getLibraryChapters = async (req, res) => {
  try {
    const { subject, class: classLevel } = req.query;
    if (!subject || !classLevel) {
      return res.status(400).json({ success: false, message: 'subject and class required' });
    }

    const grade = parseInt(classLevel);
    const subjectLike = subject.toLowerCase() === 'maths' ? 'math%' : `%${subject.toLowerCase()}%`;

    const [books] = await pool.query(`
      SELECT bk.id, bk.title, bk.cover_image_url,
        s.name AS subject_name, cl.grade
      FROM books bk
      JOIN subjects s ON s.id = bk.subject_id AND s.is_active = 1
      JOIN classes cl ON cl.id = s.class_id AND cl.grade = ?
      JOIN boards b ON b.id = cl.board_id AND (b.type = 'national' OR UPPER(b.code) = 'CBSE')
      WHERE LOWER(s.name) LIKE ?
        AND (bk.is_official = 1 OR LOWER(bk.title) LIKE '%ncert%')
      ORDER BY bk.is_official DESC, bk.priority_rank ASC
      LIMIT 3
    `, [grade, subjectLike]);

    if (!books.length) {
      return res.json({ success: true, data: [], source: 'empty' });
    }

    const book = books[0];
    const [chapters] = await pool.query(`
      SELECT ch.id, ch.chapter_number, ch.title, ch.description,
        ch.estimated_study_time_mins,
        COUNT(t.id) AS topic_count
      FROM chapters ch
      LEFT JOIN topics t ON t.chapter_id = ch.id
      WHERE ch.book_id = ?
      GROUP BY ch.id
      ORDER BY ch.chapter_number ASC, ch.id ASC
    `, [book.id]);

    res.json({
      success: true,
      data: chapters,
      book: { id: book.id, title: book.title, cover: book.cover_image_url, subject: book.subject_name, grade: book.grade },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GET CHAPTER + TOPICS ──────────────────────────────────────────────────────
// GET /jee/library/chapter/:id
exports.getChapterWithTopics = async (req, res) => {
  try {
    await ensureTable();

    const [rows] = await pool.query(`
      SELECT ch.id, ch.chapter_number, ch.title, ch.description, ch.key_concepts,
        bk.id AS book_id, bk.title AS book_title,
        s.name AS subject_name, cl.grade
      FROM chapters ch
      JOIN books bk ON bk.id = ch.book_id
      JOIN subjects s ON s.id = bk.subject_id
      JOIN classes cl ON cl.id = s.class_id
      WHERE ch.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Chapter not found' });
    const chapter = rows[0];

    const [topics] = await pool.query(`
      SELECT t.id, t.title, t.topic_order, t.weightage_percent,
        CASE WHEN lc.id IS NOT NULL THEN 1 ELSE 0 END AS has_notes
      FROM topics t
      LEFT JOIN lib_topic_content lc ON lc.topic_id = t.id AND lc.content_type = 'notes'
      WHERE t.chapter_id = ?
      ORDER BY t.topic_order ASC
    `, [chapter.id]);

    res.json({ success: true, chapter, topics });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GET CACHED NOTES ──────────────────────────────────────────────────────────
// GET /jee/library/topic/:id/content
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

// ── AI GENERATE NOTES ─────────────────────────────────────────────────────────
// POST /jee/library/topic/:id/generate
exports.generateTopicContent = async (req, res) => {
  try {
    await ensureTable();

    const [rows] = await pool.query(`
      SELECT t.id, t.title, t.topic_order,
        ch.chapter_number, ch.title AS chapter_title,
        bk.title AS book_title,
        s.name AS subject_name, cl.grade
      FROM topics t
      JOIN chapters ch ON ch.id = t.chapter_id
      JOIN books bk ON bk.id = ch.book_id
      JOIN subjects s ON s.id = bk.subject_id
      JOIN classes cl ON cl.id = s.class_id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Topic not found' });
    const t = rows[0];
    const sectionNum = `${t.chapter_number}.${t.topic_order}`;

    const prompt = `You are a friendly, brilliant NCERT teacher. Your student is a curious Class ${t.grade} student studying ${t.subject_name} from the NCERT textbook for JEE/NEET preparation.

Write COMPLETE, SIMPLE, and ENGAGING study notes for:

📚 Book: ${t.book_title}
📖 Chapter ${t.chapter_number}: ${t.chapter_title}
🔖 Section ${sectionNum}: ${t.title}

GOLDEN RULES:
- Write like you are explaining to a 16-year-old friend — simple, warm, encouraging
- Use real-life examples (cricket balls, cars, kitchen, smartphones, etc.)
- For every formula, show WHERE it comes from and a trick to remember it
- Every derivation: show EVERY step — never skip. Explain each step in plain English
- Use "$...$" for inline math (e.g. $F = ma$) and "$$...$$" for displayed equations
- Make students feel "Oh! That makes sense!" after reading

Return ONLY valid JSON (no markdown wrapper, no explanation outside JSON):
{
  "summary": "2-3 warm, simple sentences: what this section is about and why it's useful in real life",
  "theory": "# ${t.title}\\n\\n[Full detailed explanation. Use ## for sub-sections. Min 400 words. Use analogies, examples, and simple language. Explain WHY, not just WHAT. Use $math$ for inline and $$math$$ for block equations.]",
  "key_points": [
    "🎯 Key point 1 — kept short and memorable",
    "🎯 Key point 2",
    "🎯 Key point 3",
    "🎯 Key point 4",
    "🎯 Key point 5"
  ],
  "derivations": [
    {
      "name": "Name of what we are deriving",
      "why_we_derive": "One sentence: why this result matters",
      "starting_point": "We start with [equation or observation]",
      "steps": [
        "Step 1: [equation]. Because [plain English reason]",
        "Step 2: [equation]. Because [reason]",
        "Step 3: [equation]. So we get [result]"
      ],
      "final_result": "$$The final formula$$",
      "remember_as": "Simple way to recall or re-derive in 30 seconds"
    }
  ],
  "formulas": [
    {
      "name": "Formula name",
      "formula": "$$LaTeX formula$$",
      "variables": "Variable 1 = meaning (unit), Variable 2 = meaning (unit)",
      "trick": "🔥 Numerical trick: when [condition], use this shortcut",
      "unit_check": "Result unit is [unit] — always verify before writing final answer"
    }
  ],
  "solved_example": {
    "problem": "A complete numerical problem (NCERT textbook style, with realistic numbers)",
    "given": "• Item 1\\n• Item 2",
    "to_find": "What we need to calculate",
    "solution": "Step 1: [working]\\nStep 2: [working]\\nStep 3: [final calculation]",
    "answer": "✅ Final answer with correct units",
    "key_insight": "The most important idea in this problem"
  },
  "common_mistakes": [
    {
      "mistake": "What students wrongly do",
      "why_wrong": "Why this is incorrect",
      "correct_way": "The right approach"
    }
  ],
  "fun_fact": "An interesting real-world application or historical fact about this topic"
}`;

    const model = getGeminiModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 6000, temperature: 0.35 },
    });

    const notes = parseAI(result.response.text());

    await pool.query(
      `INSERT INTO lib_topic_content (topic_id, content_type, content) VALUES (?, 'notes', ?)
       ON DUPLICATE KEY UPDATE content = VALUES(content), generated_at = CURRENT_TIMESTAMP`,
      [t.id, JSON.stringify(notes)]
    );

    res.json({ success: true, data: notes, cached: false, section: sectionNum, topic_title: t.title });
  } catch (e) {
    console.error('[lib-study] generate:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GENERATE PRACTICE QUESTIONS (always fresh, never cached) ──────────────────
// POST /jee/library/topic/:id/practice
exports.generatePracticeQuestions = async (req, res) => {
  try {
    const { count = 5, difficulty = 'mixed', offset = 0 } = req.query;

    const [rows] = await pool.query(`
      SELECT t.id, t.title, t.topic_order,
        ch.chapter_number, ch.title AS chapter_title,
        s.name AS subject_name, cl.grade
      FROM topics t
      JOIN chapters ch ON ch.id = t.chapter_id
      JOIN books bk ON bk.id = ch.book_id
      JOIN subjects s ON s.id = bk.subject_id
      JOIN classes cl ON cl.id = s.class_id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Topic not found' });
    const t = rows[0];

    const n = Math.min(parseInt(count) || 5, 10);
    const off = parseInt(offset) || 0;
    const diffStr = difficulty === 'mixed'
      ? '2 easy, 2 medium, and 1 hard'
      : `all ${difficulty}`;

    const variety = ['Use completely different scenarios than typical textbook examples.',
      'Focus on application-based problems with real-world context.',
      'Include multi-concept problems that combine ideas.',
      'Use problems with surprising or counterintuitive answers.',
      'Include problems that appear simple but require careful analysis.'];
    const twist = variety[Math.floor(Math.random() * variety.length)];

    const offsetNote = off > 0
      ? `IMPORTANT: This is batch #${Math.floor(off / n) + 1}. Generate COMPLETELY DIFFERENT problems from any previous batch.`
      : '';

    const model = getGeminiModel();
    const prompt = `You are an expert ${t.subject_name} teacher creating engaging practice problems.

${offsetNote}

Topic: Section ${t.chapter_number}.${t.topic_order} — "${t.title}"
Chapter: ${t.chapter_title}
Subject: ${t.subject_name}, Class ${t.grade} (NCERT)
${twist}

Generate EXACTLY ${n} practice questions (difficulty: ${diffStr}).
Include a mix of: MCQ (with 4 distinct options), Numerical (calculation required), Short Answer.

RULES:
- Each numerical must use DIFFERENT numbers and scenarios
- MCQ wrong options must be plausible (not obviously wrong)
- Solutions must show EVERY calculation step
- Use $math$ for inline and $$math$$ for block equations
- Vary the style: some straightforward, some tricky, some real-world

Return ONLY a strict JSON array (no markdown, no extra text):
[
  {
    "type": "mcq|numerical|short_answer",
    "difficulty": "easy|medium|hard",
    "question": "Full question text with $math$ where needed",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "hint": "A nudge in the right direction without revealing the answer",
    "solution": "Complete step-by-step solution. Show every line of working.",
    "answer": "For MCQ: 'C) text'. For numerical: 'value unit'. For short: brief answer",
    "formula_used": "The key formula or concept applied here"
  }
]`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 4000, temperature: 0.75 },
    });

    const questions = parseAI(result.response.text());
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
