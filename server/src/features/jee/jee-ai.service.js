const { generateText, generateJSON } = require('../../services/ai.service');
const { pool } = require('../../database/connection');

// getModel is removed in favor of using the central generateText/JSON functions

const parseJSON = (text) => {
  let cleaned = text.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
};

const JEE_SYSTEM = `You are an elite JEE expert tutor (IIT graduate, 10+ years teaching). The student is preparing for JEE Main + Advanced.

Rules:
- Show DETAILED step-by-step solutions — never skip steps
- Use LaTeX for ALL math: $F = ma$ inline, $$\\int_0^\\pi \\sin x\\,dx = 2$$ block
- Connect every concept to JEE exam patterns
- Highlight common mistakes in bold
- Mention if the topic appeared in JEE Main/Advanced and which year
- Format in clean Markdown with headings
- Give shortcuts and tricks that save time in exam`;

// ── SOLVE DOUBT ────────────────────────────────────────────────
exports.solveDoubt = async (req, res) => {
  try {
    const { doubt, question, subject, chapter, image_base64, image_data, image_mime, exam_type } = req.body;
    const questionText = doubt || question || '';

    const parts = [];
    const imgData = image_base64 || image_data;
    if (imgData) {
      const mimeType = image_mime || 'image/jpeg';
      const base64 = imgData.replace(/^data:image\/\w+;base64,/, '');
      parts.push({ inlineData: { mimeType, data: base64 } });
    }
    parts.push({ text: `${JEE_SYSTEM}\n\nSubject: ${subject || 'Auto-detect'}\nChapter: ${chapter || 'Auto-detect'}\n\nStudent's doubt:\n${questionText || 'Solve the problem shown in the image.'}\n\n---\nProvide a COMPLETE response with:\n\n## Understanding the Problem\n[Identify what is given and what is asked]\n\n## Key Concept\n[State the principle/formula needed]\n\n## Step-by-Step Solution\n[Every step with LaTeX formulas]\n\n## Final Answer\n[Boxed answer with units]\n\n## Common Mistake to Avoid\n[What students typically get wrong here]\n\n## JEE Tip\n[Shortcut or trick for this type of question]` });

    console.log(`[JEE-AI] Solving doubt: ${questionText.slice(0, 50)}...`);
    const responseText = await generateText(parts, { task: 'reasoning', model: req.body.model || 'Gemini 3 Flash' });

    console.log(`[JEE-AI] Solution generated (${responseText.length} chars)`);
    res.json({ success: true, data: { solution: responseText } });
  } catch (e) {
    console.error(`[JEE-AI] Error in solveDoubt:`, e.stack || e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};


// ── EXPLAIN CONCEPT ────────────────────────────────────────────
exports.explainConcept = async (req, res) => {
  try {
    const { concept, topic, subject, chapter, depth_level, depth, exam_type } = req.body;
    const conceptText = concept || topic || '';
    const depthVal = parseInt(depth_level || depth || 3);

    const depthDescriptions = {
      1: 'ELI5 level — simple everyday analogies, no formulas, build intuition only',
      2: 'Basic Class 11 textbook level — introduce formulas gently with simple examples',
      3: 'Intermediate coaching level — full derivations, worked examples, common question types',
      4: 'Advanced level — complete theory, multiple approaches, edge cases, exceptions',
      5: 'JEE Advanced level — all tricks, shortcuts, PYQ patterns, time-saving methods, tricky variations',
    };

    const prompt = `${JEE_SYSTEM}\n\nExplain this JEE concept at DEPTH LEVEL ${depthVal}: ${depthDescriptions[depthVal] || depthDescriptions[3]}\n\nConcept: ${conceptText}\nSubject: ${subject || 'Auto-detect'}\nChapter: ${chapter || 'Auto-detect'}\nExam focus: ${exam_type === 'advanced' ? 'JEE Advanced' : 'JEE Main + Advanced'}\n\nStructure your response as:\n\n# ${conceptText}\n\n## 1. Intuition & Physical Meaning\n[What does this concept really mean? Build mental model]\n\n## 2. Theory & Derivation\n[Full mathematical treatment with LaTeX]\n\n## 3. Key Formulas\n[All important formulas with conditions/constraints]\n\n## 4. Worked Examples\n[2-3 solved problems at increasing difficulty]\n\n## 5. JEE Relevance\n[How this appears in JEE, which years, what types of questions]\n\n## 6. Common Mistakes\n[What students get wrong]\n\n## 7. Quick Revision Points\n[5-7 bullet points to remember]`;

    console.log(`[JEE-AI] Explaining concept: ${conceptText}`);
    const responseText = await generateText(prompt, { task: 'reasoning', model: req.body.model || 'Gemini 3 Flash' });

    console.log(`[JEE-AI] Explanation generated (${responseText.length} chars)`);
    res.json({ success: true, data: { explanation: responseText } });
  } catch (e) {
    console.error(`[JEE-AI] Error in explainConcept:`, e.stack || e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};


// ── SOLVE STEP BY STEP ─────────────────────────────────────────
exports.solveStepByStep = async (req, res) => {
  try {
    const { question_id, question_text } = req.body;
    let questionText = question_text;
    if (question_id && !question_text) {
      const [rows] = await pool.query('SELECT question_text FROM jee_questions WHERE id = ?', [question_id]);
      if (rows.length) questionText = rows[0].question_text;
    }
    if (!questionText) return res.status(400).json({ success: false, message: 'No question provided' });

    const prompt = `${JEE_SYSTEM}\n\nSolve this JEE problem completely:\n\n${questionText}\n\n## Step 1: Read & Understand\n[Identify given quantities, draw diagram if needed]\n\n## Step 2: Identify Approach\n[Which law/theorem/formula applies and WHY]\n\n## Step 3: Setup Equations\n[Write the equations with LaTeX]\n\n## Step 4: Solve\n[Work through every algebraic step]\n\n## Step 5: Final Answer\n[State the answer clearly with units and significant figures]\n\n## Alternative Method (if applicable)\n[Faster/different approach]\n\n## 90-Second Trick\n[Is there a shortcut? State it clearly]`;

    const responseText = await generateText(prompt, { task: 'reasoning', model: req.body.model || 'Gemini 3 Flash' });
    res.json({ success: true, data: { solution: responseText } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GENERATE QUESTIONS ─────────────────────────────────────────
exports.generateQuestions = async (req, res) => {
  try {
    const { topic, chapter, subject, count = 5, difficulty = 'medium', question_type = 'scq' } = req.body;

    const prompt = `Generate ${count} JEE-level ${question_type.toUpperCase()} questions for:\nSubject: ${subject}\nChapter: ${chapter}\nTopic: ${topic || chapter}\nDifficulty: ${difficulty}\n\nRules:\n- Questions must be exam-ready (solvable in 2-3 minutes)\n- Use LaTeX for all math\n- For SCQ: exactly 4 options (A,B,C,D), one correct\n- For numerical: give exact decimal/integer answer\n- Solutions must be complete step-by-step\n\nReturn ONLY a valid JSON array (no markdown, no explanation):\n[{"question_text":"...with LaTeX...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"correct_answer":"A","solution_text":"Complete step-by-step solution with LaTeX formulas","quick_trick":"90-second shortcut or null","difficulty":"${difficulty}","marks":4,"negative_marks":-1}]`;

    const questions = await generateJSON(prompt, { task: 'json', model: req.body.model || 'Gemini 3 Flash' });
    if (!Array.isArray(questions)) throw new Error('AI did not return an array of questions');

    if (req.query.save === 'true') {
      const [chapterRows] = await pool.query(
        'SELECT id FROM jee_chapters WHERE name = ? OR slug = ? LIMIT 1',
        [chapter, (chapter || '').toLowerCase().replace(/\s+/g, '-')]
      );
      const [subjectRows] = await pool.query(
        'SELECT id FROM jee_subjects WHERE name = ? OR slug = ? LIMIT 1',
        [subject, (subject || '').toLowerCase()]
      );
      if (chapterRows.length && subjectRows.length) {
        for (const q of questions) {
          await pool.query(
            `INSERT INTO jee_questions (subject_id, chapter_id, question_text, question_type, options, correct_answer, solution_text, quick_trick, difficulty, marks, negative_marks, source_type)
             VALUES (?,?,?,?,?,?,?,?,?,4,-1,'generated')`,
            [subjectRows[0].id, chapterRows[0].id, q.question_text, question_type,
             JSON.stringify(q.options || []), q.correct_answer, q.solution_text, q.quick_trick || null, difficulty]
          ).catch(() => {});
        }
      }
    }
    res.json({ success: true, data: questions });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GENERATE SIMILAR QUESTIONS ─────────────────────────────────
exports.generateSimilar = async (req, res) => {
  try {
    const { question_id, count = 3, infinite = false } = req.body;
    const [rows] = await pool.query(
      `SELECT q.*, c.name AS chapter_name, s.name AS subject_name
       FROM jee_questions q JOIN jee_chapters c ON q.chapter_id = c.id JOIN jee_subjects s ON q.subject_id = s.id
       WHERE q.id = ?`,
      [question_id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Question not found' });
    const q = rows[0];

    // Infinite mode: use a "Seed-and-Shift" strategy to ensure variety
    const modePrompt = infinite
      ? "INFINITE MODE: Create highly unique variations by shifting scenarios, combining with related sub-concepts, and varying numerical constants. Ensure NO two questions are identical."
      : "SIMILAR MODE: Create questions that test the exact same concept with different numbers.";

    const prompt = `You are a JEE Master Examiner. ${modePrompt}

Source Question:
${q.question_text}

Subject: ${q.subject_name}, Chapter: ${q.chapter_name}, Type: ${q.question_type}, Difficulty: ${q.difficulty}

Generate ${count} NEW questions based on this.
Rules:
1. Use LaTeX for ALL math.
2. Return ONLY a JSON array.
3. Each question must have: question_text, options[A,B,C,D], correct_answer, solution_text, quick_trick, difficulty.
4. Set marks=4, negative_marks=-1.

JSON Structure:
[{"question_text":"...","options":[{"id":"A","text":"..."}],"correct_answer":"A","solution_text":"...","quick_trick":"...","difficulty":"${q.difficulty}"}]`;

    const questions = await generateJSON(prompt, { task: 'json', model: req.body.model || 'Gemini 3 Flash' });
    if (!Array.isArray(questions)) throw new Error('AI did not return an array of questions');
    
    res.json({ success: true, data: questions });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── EXTRACT HISTORICAL PYQs (30 YEARS) ──────────────────────────
exports.extractHistoricalPYQs = async (req, res) => {
  try {
    const { subject, chapter, year, count = 10 } = req.body;
    if (!subject || !chapter || !year) return res.status(400).json({ success: false, message: 'Missing parameters' });

    const prompt = `You are a JEE Historian & Expert. Use your internal knowledge to retrieve/reconstruct actual JEE (Main or Advanced/IIT-JEE) Previous Year Questions for the year ${year}.

Subject: ${subject}
Chapter: ${chapter}
Year: ${year}
Target Count: ${count}

Rules:
- Questions must be AUTHENTIC to the JEE pattern of that era (${year}).
- Use LaTeX for ALL math.
- Return ONLY a JSON array of questions with: question_text, options[A,B,C,D], correct_answer, solution_text, source_type (pyq_main/pyq_advanced), source_year, source_session.
- If specific questions from ${year} for this exact chapter are rare, provide the most high-relevance ones that appeared in that decade.

Return JSON format:
[{"question_text":"...","options":[{"id":"A","text":"..."}],"correct_answer":"A","solution_text":"...","source_type":"pyq_main","source_year":${year},"source_session":"Session 1"}]`;

    console.log(`[JEE-AI] Extracting ${year} PYQs for ${chapter}...`);
    const questions = await generateJSON(prompt, { task: 'json', model: req.body.model || 'Gemini 3 Flash' });

    // Auto-seed to database if requested
    if (req.query.seed === 'true') {
      const [chapterRows] = await pool.query('SELECT id FROM jee_chapters WHERE slug = ? OR name = ?', [chapter, chapter]);
      const [subjectRows] = await pool.query('SELECT id FROM jee_subjects WHERE slug = ? OR name = ?', [subject, subject]);

      if (chapterRows.length && subjectRows.length) {
        for (const q of questions) {
          await pool.query(
            `INSERT INTO jee_questions (subject_id, chapter_id, question_text, question_type, options, correct_answer, solution_text, source_type, source_year, source_session)
             VALUES (?, ?, ?, 'scq', ?, ?, ?, ?, ?, ?)`,
            [subjectRows[0].id, chapterRows[0].id, q.question_text, JSON.stringify(q.options), q.correct_answer, q.solution_text, q.source_type, q.source_year, q.source_session]
          ).catch(err => console.error('Seeding error:', err));
        }
      }
    }

    res.json({ success: true, data: questions, count: questions.length });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── DAILY PRACTICE SET ─────────────────────────────────────────
exports.dailyPracticeSet = async (req, res) => {
  try {
    const uid = req.user.id;
    // Get user's weak chapters from error log
    const [errors] = await pool.query(
      `SELECT q.chapter_id, c.name AS chapter_name, s.name AS subject_name, COUNT(*) AS error_count
       FROM jee_error_log e JOIN jee_questions q ON e.question_id = q.id
       JOIN jee_chapters c ON q.chapter_id = c.id JOIN jee_subjects s ON c.subject_id = s.id
       WHERE e.user_id = ? AND e.reviewed = 0
       GROUP BY q.chapter_id ORDER BY error_count DESC LIMIT 3`,
      [uid]
    );

    const weakChapterIds = errors.map(e => e.chapter_id);
    let questions = [];

    // Questions from weak chapters
    if (weakChapterIds.length) {
      const placeholders = weakChapterIds.map(() => '?').join(',');
      const [weakQ] = await pool.query(
        `SELECT id FROM jee_questions WHERE chapter_id IN (${placeholders}) AND is_active = 1 ORDER BY RAND() LIMIT 12`,
        weakChapterIds
      );
      questions = weakQ;
    }

    // Fill remaining with random questions not yet seen
    const remainingCount = 20 - questions.length;
    if (remainingCount > 0) {
      const seenIds = questions.map(q => q.id);
      let revQ;
      if (seenIds.length > 0) {
        const placeholders = seenIds.map(() => '?').join(',');
        const [rows] = await pool.query(
          `SELECT id FROM jee_questions WHERE is_active = 1 AND id NOT IN (${placeholders}) ORDER BY RAND() LIMIT ?`,
          [...seenIds, remainingCount]
        );
        revQ = rows;
      } else {
        const [rows] = await pool.query(
          'SELECT id FROM jee_questions WHERE is_active = 1 ORDER BY RAND() LIMIT ?',
          [remainingCount]
        );
        revQ = rows;
      }
      questions = [...questions, ...revQ];
    }

    res.json({ success: true, data: { question_ids: questions.map(q => q.id), weak_chapters: errors, total: questions.length } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
