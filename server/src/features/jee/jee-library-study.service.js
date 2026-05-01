const { pool } = require('../../database/connection');
const { getGeminiModel } = require('../../utils/gemini-utils');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Shared safety settings ────────────────────────────────────────────────────
const SAFETY = [
  { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH',        threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',  threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT',  threshold: 'BLOCK_NONE' },
];

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
exports.getLibraryChapters = async (req, res) => {
  try {
    await ensureTable();

    const { subject, class: classLevel } = req.query;
    if (!subject || !classLevel) {
      return res.status(400).json({ success: false, message: 'subject and class required' });
    }

    const grade = parseInt(classLevel);
    const s = subject.toLowerCase();

    // Build LIKE pattern — handle 'maths' → 'Mathematics'
    let subjectLike;
    if (s === 'maths' || s === 'math' || s === 'mathematics') subjectLike = 'math%';
    else if (s === 'biology' || s === 'bio')                   subjectLike = '%bio%';
    else                                                        subjectLike = `%${s}%`;

    // Primary query — prefer science stream, no is_official restriction
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
        bk.priority_rank ASC,
        bk.id ASC
      LIMIT 5
    `, [grade, subjectLike]);

    // Fallback — drop board/stream filters entirely (catches admin-uploaded books)
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

    // Fetch chapters with topic count and how many already have AI notes
    const [chapters] = await pool.query(`
      SELECT ch.id, ch.chapter_number, ch.title, ch.description,
             ch.estimated_study_time_mins,
             COUNT(t.id)                                                        AS topic_count,
             SUM(CASE WHEN lc.id IS NOT NULL THEN 1 ELSE 0 END)                AS notes_count
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
      data:    chapters,
      book:    { id: book.id, title: book.title, cover: book.cover_image_url,
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

// ── STEP 1 — Google Search grounded research ──────────────────────────────────
async function groundedResearch(t, sectionNum) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model  = genAI.getGenerativeModel({
    model:          'gemini-2.0-flash',
    tools:          [{ googleSearch: {} }],
    safetySettings: SAFETY,
  });

  const query = `NCERT Class ${t.grade} ${t.subject_name} Chapter ${t.chapter_number} "${t.chapter_title}" Section ${sectionNum}: "${t.title}" — full explanation, derivations, formulas, solved examples, JEE NEET tricks`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text:
      `You are a senior NCERT educator. Use Google Search to retrieve accurate information about:

${query}

Write comprehensive study material covering:
1. Complete conceptual explanation with real-life analogies
2. All mathematical derivations — show every single step
3. All key formulas with variables, units, and shortcuts
4. Solved example from the NCERT textbook (Chapter ${t.chapter_number})
5. Common mistakes students make in exams
6. Memory tricks and JEE/NEET exam shortcuts

Write in plain, simple English suitable for a Class ${t.grade} student preparing for competitive exams.`
    }] }],
    generationConfig: { maxOutputTokens: 4000, temperature: 0.2 },
  });

  return result.response.text();
}

// ── STEP 2 — Structure raw research into JSON ─────────────────────────────────
async function structureIntoJSON(raw, t, sectionNum) {
  const model = getGeminiModel('gemini-2.0-flash');

  const prompt = `You are formatting verified educational content into a structured JSON object.

Here is researched content about NCERT Class ${t.grade} ${t.subject_name} — Section ${sectionNum} "${t.title}":

---
${raw}
---

Convert the above into this EXACT JSON structure. Return ONLY valid JSON — no markdown, no extra text:
{
  "summary": "2–3 warm sentences: what this section is about and why it matters in real life",
  "theory": "# ${t.title}\\n\\n[Full detailed explanation. Use ## sub-sections. Min 400 words. Use analogies. Use $math$ for inline equations, $$math$$ for displayed equations.]",
  "key_points": ["🎯 point 1", "🎯 point 2", "🎯 point 3", "🎯 point 4", "🎯 point 5"],
  "derivations": [
    {
      "name": "Name of derivation",
      "why_we_derive": "One sentence: why this result matters",
      "starting_point": "We start from [equation or observation]",
      "steps": ["Step 1: [eq]. Because [reason]", "Step 2: [eq]. So [result]"],
      "final_result": "$$final formula$$",
      "remember_as": "30-second re-derivation trick"
    }
  ],
  "formulas": [
    {
      "name": "Formula name",
      "formula": "$$LaTeX$$",
      "variables": "var1 = meaning (unit), var2 = meaning (unit)",
      "trick": "🔥 Exam shortcut or quick-recall method",
      "unit_check": "Result unit is [unit] — verify before writing final answer"
    }
  ],
  "solved_example": {
    "problem": "Full NCERT-style numerical problem with realistic numbers",
    "given": "• datum 1\\n• datum 2",
    "to_find": "What to calculate",
    "solution": "Step 1: ...\\nStep 2: ...\\nStep 3: final calculation",
    "answer": "✅ Final answer with units",
    "key_insight": "The one idea that makes this problem click"
  },
  "common_mistakes": [
    { "mistake": "What students wrongly do", "why_wrong": "Why incorrect", "correct_way": "Right approach" }
  ],
  "fun_fact": "Interesting real-world application or historical connection to this topic"
}`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 6000, temperature: 0.2 },
  });

  return parseAI(result.response.text());
}

// ── DIRECT GENERATION (fallback) ──────────────────────────────────────────────
async function directGenerate(t, sectionNum) {
  const model = getGeminiModel('gemini-2.0-flash');

  const prompt = `You are a brilliant, friendly NCERT teacher. Write complete study notes for:

📚 Book: ${t.book_title}
📖 Chapter ${t.chapter_number}: ${t.chapter_title}
🔖 Section ${sectionNum}: ${t.title}
📘 Subject: ${t.subject_name}, Class ${t.grade}

RULES:
- Explain like talking to a curious 16-year-old. Simple, warm, encouraging.
- Use real-life analogies (cricket, smartphones, kitchen, cars, etc.)
- Show EVERY derivation step — never skip. Explain each step in plain English.
- Use $math$ inline, $$math$$ for block equations.

Return ONLY valid JSON (no markdown wrapper):
{
  "summary": "2–3 warm sentences about this section and why it matters",
  "theory": "# ${t.title}\\n\\n[Full explanation, ## sub-sections, analogies, $math$ inline, $$math$$ block. Min 400 words.]",
  "key_points": ["🎯 point 1","🎯 point 2","🎯 point 3","🎯 point 4","🎯 point 5"],
  "derivations": [{"name":"...","why_we_derive":"...","starting_point":"...","steps":["Step 1: ..."],"final_result":"$$...$$","remember_as":"..."}],
  "formulas": [{"name":"...","formula":"$$...$$","variables":"...","trick":"🔥 ...","unit_check":"..."}],
  "solved_example": {"problem":"...","given":"...","to_find":"...","solution":"...","answer":"✅ ...","key_insight":"..."},
  "common_mistakes": [{"mistake":"...","why_wrong":"...","correct_way":"..."}],
  "fun_fact": "..."
}`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 6000, temperature: 0.35 },
  });

  return parseAI(result.response.text());
}

// ── GENERATE TOPIC NOTES (AI + web grounding) ─────────────────────────────────
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

    let notes;
    let method = 'grounded';

    try {
      // Attempt two-step: web research → JSON structuring
      const raw = await groundedResearch(t, sectionNum);
      notes     = await structureIntoJSON(raw, t, sectionNum);
    } catch (groundErr) {
      console.warn(`[lib-study] Grounding failed (${groundErr.message}), falling back to direct generation`);
      method = 'direct';
      notes  = await directGenerate(t, sectionNum);
    }

    await pool.query(
      `INSERT INTO lib_topic_content (topic_id, content_type, content) VALUES (?, 'notes', ?)
       ON DUPLICATE KEY UPDATE content = VALUES(content), generated_at = CURRENT_TIMESTAMP`,
      [t.id, JSON.stringify(notes)]
    );

    res.json({
      success: true,
      data:    notes,
      cached:  false,
      method,
      section: sectionNum,
      topic_title: t.title,
    });
  } catch (e) {
    console.error('[lib-study] generate:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GENERATE PRACTICE QUESTIONS (always fresh) ───────────────────────────────
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

    const n       = Math.min(parseInt(count)  || 5, 10);
    const off     = parseInt(offset) || 0;
    const diffStr = difficulty === 'mixed'
      ? '2 easy, 2 medium, 1 hard'
      : `all ${difficulty}`;

    const TWISTS = [
      'Use completely different scenarios than typical textbook examples.',
      'Focus on application-based problems with real-world context.',
      'Combine multiple concepts in each problem.',
      'Include problems with surprising or counterintuitive answers.',
      'Include problems that appear simple but require careful analysis.',
    ];
    const twist     = TWISTS[Math.floor(Math.random() * TWISTS.length)];
    const batchNote = off > 0
      ? `IMPORTANT: This is batch #${Math.floor(off / n) + 1}. Generate COMPLETELY DIFFERENT problems from any previous batch.`
      : '';

    const model  = getGeminiModel('gemini-2.0-flash');
    const prompt = `You are an expert ${t.subject_name} teacher creating engaging practice problems.

${batchNote}

Topic: Section ${t.chapter_number}.${t.topic_order} — "${t.title}"
Chapter: ${t.chapter_title}
Subject: ${t.subject_name}, Class ${t.grade} (NCERT)
${twist}

Generate EXACTLY ${n} questions (difficulty: ${diffStr}).
Mix types: MCQ (4 options), Numerical (calculation), Short Answer.

RULES:
- Each numerical must use DIFFERENT numbers and scenarios
- MCQ wrong options must be plausible (not obviously wrong)
- Solutions must show EVERY calculation step
- Use $math$ inline and $$math$$ for block equations
- Vary: some straightforward, some tricky, some real-world

Return ONLY a strict JSON array (no markdown, no extra text):
[
  {
    "type": "mcq|numerical|short_answer",
    "difficulty": "easy|medium|hard",
    "question": "Full question text",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "hint": "A nudge without revealing the answer",
    "solution": "Complete step-by-step solution with every line of working",
    "answer": "For MCQ: 'C) text'. For numerical: 'value unit'. For short: brief answer",
    "formula_used": "Key formula or concept applied"
  }
]`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 4000, temperature: 0.75 },
    });

    const questions = parseAI(result.response.text());
    res.json({
      success: true,
      data:    Array.isArray(questions) ? questions : [],
      topic:   { title: t.title, section: `${t.chapter_number}.${t.topic_order}`, subject: t.subject_name },
    });
  } catch (e) {
    console.error('[lib-study] practice:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};
