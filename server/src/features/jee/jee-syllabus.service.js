const { pool } = require('../../database/connection');
const { getGeminiModel } = require('../../utils/gemini-utils');

const getModel = () => getGeminiModel();


const parseJSON = (text) => {
  try {
    let cleaned = text.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '').trim();
    // Repair common AI JSON errors
    cleaned = cleaned
      .replace(/\\(?!["\\\/bfnrtu])/g, '\\\\') // Escape lone backslashes
      .replace(/[\u0000-\u001F]+/g, ' ');      // Remove control chars
    return JSON.parse(cleaned);
  } catch (err) {
    // Advanced recovery: Try finding the first { and last }
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in response");
    let inner = match[0];
    try { return JSON.parse(inner); }
    catch {
       // Last ditch effort: basic repair before failure
       inner = inner.replace(/\\/g, '\\\\').replace(/\\\\"/g, '\\"');
       return JSON.parse(inner);
    }
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const [subjects] = await pool.query('SELECT * FROM jee_subjects ORDER BY display_order');
    res.json({ success: true, data: subjects });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getChapters = async (req, res) => {
  try {
    const { subject, class: classLevel } = req.query;
    let q = `
      SELECT c.*, s.name AS subject_name, s.slug AS subject_slug, s.icon_color,
        (SELECT p.mastery_level FROM jee_user_progress p WHERE p.chapter_id = c.id AND p.user_id = ?) AS mastery_level,
        (SELECT p.questions_attempted FROM jee_user_progress p WHERE p.chapter_id = c.id AND p.user_id = ?) AS questions_attempted
      FROM jee_chapters c
      JOIN jee_subjects s ON c.subject_id = s.id
      WHERE c.is_active = 1
    `;
    const params = [req.user.id, req.user.id];
    if (subject) { q += ' AND s.slug = ?'; params.push(subject); }
    if (classLevel) { q += ' AND c.class_level = ?'; params.push(parseInt(classLevel)); }
    q += ' ORDER BY c.class_level, c.chapter_number';
    const [chapters] = await pool.query(q, params);
    res.json({ success: true, data: chapters });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getChapter = async (req, res) => {
  try {
    const { subjectSlug, chapterSlug } = req.params;
    const { class: classLevel } = req.query;
    let q = `
      SELECT c.*, s.name AS subject_name, s.slug AS subject_slug, s.icon_color,
        (SELECT p.mastery_level FROM jee_user_progress p WHERE p.chapter_id = c.id AND p.user_id = ?) AS mastery_level
      FROM jee_chapters c JOIN jee_subjects s ON c.subject_id = s.id
      WHERE c.slug = ? AND s.slug = ? AND c.is_active = 1
    `;
    const params = [req.user.id, chapterSlug, subjectSlug];
    if (classLevel) { q += ' AND c.class_level = ?'; params.push(parseInt(classLevel)); }
    const [chapters] = await pool.query(q, params);
    if (!chapters.length) return res.status(404).json({ success: false, message: 'Chapter not found' });
    const chapter = chapters[0];
    const [topics] = await pool.query(
      `SELECT id, name, slug, display_order, difficulty,
              theory_content, key_formulas, key_concepts, common_mistakes, jee_tips, solved_examples
       FROM jee_topics WHERE chapter_id = ? ORDER BY display_order`,
      [chapter.id]
    );
    chapter.topics = topics;
    res.json({ success: true, data: chapter });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getTopic = async (req, res) => {
  try {
    const [topics] = await pool.query(
      `SELECT t.*, c.name AS chapter_name, c.slug AS chapter_slug, s.name AS subject_name, s.slug AS subject_slug
       FROM jee_topics t
       JOIN jee_chapters c ON t.chapter_id = c.id
       JOIN jee_subjects s ON c.subject_id = s.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (!topics.length) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.json({ success: true, data: topics[0] });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.generateNotes = async (req, res) => {
  try {
    const [topics] = await pool.query(
      `SELECT t.*, c.name AS chapter_name, s.name AS subject_name, s.slug AS subject_slug
       FROM jee_topics t JOIN jee_chapters c ON t.chapter_id = c.id JOIN jee_subjects s ON c.subject_id = s.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (!topics.length) return res.status(404).json({ success: false, message: 'Topic not found' });
    const topic = topics[0];
    const model = getModel();

    const bookRefs = {
      physics: "NCERT (foundation), H.C. Verma (concepts), I.E. Irodov/D.C. Pandey (advanced), Halliday/Resnick/Walker (fundamentals)",
      chemistry: "NCERT (mandatory), O.P. Tandon (physical), Morrison & Boyd/M.S. Chauhan (organic), P. Bahadur (numerical)",
      mathematics: "R.D. Sharma (basics), S.L. Loney (trigonometry/coordinate), Hall & Knight (algebra), Arihant/Cengage (advanced)"
    };
    const ref = bookRefs[topic.subject_slug] || bookRefs.physics;

    const prompt = `You are an elite JEE Professor. Generate COMPREHENSIVE, EXAM-READY study notes for JEE Main + Advanced.
No shortcuts accepted. Use the depth and style of these reference books: ${ref}.

Topic: ${topic.name}
Chapter: ${topic.chapter_name}
Subject: ${topic.subject_name}
Level: JEE Main + JEE Advanced

Return ONLY valid JSON (no markdown wrapping):
{
  "theory_content": "# ${topic.name}\\n\\n## Introduction\\n[Detailed build-up. Use analogies.]\\n\\n## Core Theory\\n[Mathematical rigor. Full derivations as per standard books like ${ref.split(',')[1]}. Use LaTeX: $formula$ and $$formula$$.]\\n\\n## Advanced Insights & JEE Patterns\\n[Analyze previous years' patterns. Deep insights.]",
  "key_formulas": [
    {"formula": "LaTeX string (use double backslash \\\\)", "name": "Name", "description": "Intuition", "conditions": "When it fails"}
  ],
  "key_concepts": ["Concept 1 — Deep detail", "Concept 2 — Exam application"],
  "common_mistakes": ["Specific mistake and its conceptual correction"],
  "solved_examples": [
    {"problem": "JEE Advanced level problem", "solution": "Detailed step-by-step with steps shown", "key_insight": "The core trick"}
  ],
  "jee_tips": "Shortcuts, time management, and visual memory patterns."
}

CRITICAL: 
- theory_content MUST be 500-800 words.
- All backslashes in JSON strings MUST be escaped (e.g. \\\\frac for \\frac).
- Do not use single quotes in JSON keys/values.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.3 }
    });
    let text = result.response.text();

    let notes;
    try {
      notes = parseJSON(text);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { notes = JSON.parse(jsonMatch[0]); }
        catch { return res.status(500).json({ success: false, message: 'AI returned malformed response. Please try again.' }); }
      } else {
        return res.status(500).json({ success: false, message: 'AI returned malformed response. Please try again.' });
      }
    }

    await pool.query(
      `UPDATE jee_topics SET
        theory_content = ?,
        key_formulas = ?,
        key_concepts = ?,
        common_mistakes = ?,
        solved_examples = ?,
        jee_tips = ?
       WHERE id = ?`,
      [
        notes.theory_content || '',
        JSON.stringify(notes.key_formulas || []),
        JSON.stringify(notes.key_concepts || []),
        JSON.stringify(notes.common_mistakes || []),
        JSON.stringify(notes.solved_examples || []),
        notes.jee_tips || '',
        req.params.id
      ]
    );

    res.json({ success: true, data: { ...topic, ...notes } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getFormulas = async (req, res) => {
  try {
    const { subjectSlug } = req.params;
    const [chapters] = await pool.query(
      `SELECT c.id, c.name AS chapter_name, c.slug AS chapter_slug, c.chapter_number, c.class_level
       FROM jee_chapters c JOIN jee_subjects s ON c.subject_id = s.id
       WHERE s.slug = ? AND c.is_active = 1
       ORDER BY c.class_level, c.chapter_number`,
      [subjectSlug]
    );
    const result = [];
    for (const ch of chapters) {
      let [topics] = await pool.query(
        `SELECT key_formulas FROM jee_topics WHERE chapter_id = ? AND key_formulas IS NOT NULL AND key_formulas != 'null' AND key_formulas != '[]'`,
        [ch.id]
      );
      
      let formulas = topics.flatMap(t => {
        try { return typeof t.key_formulas === 'string' ? JSON.parse(t.key_formulas) : (t.key_formulas || []); }
        catch { return []; }
      });

      // DYNAMIC GENERATION: If no formulas found, generate them once
      if (formulas.length === 0) {
        console.log(`[JEE-Syllabus] Formulas missing for chapter ${ch.id}. Generating dynamically...`);
        try {
          const freshFormulas = await generateChapterFormulasAI(ch.chapter_name, subjectSlug);
          if (freshFormulas && freshFormulas.length > 0) {
            // Save to the first topic of the chapter (or current existing topics)
            const [firstTopic] = await pool.query('SELECT id FROM jee_topics WHERE chapter_id = ? LIMIT 1', [ch.id]);
            if (firstTopic[0]) {
              await pool.query('UPDATE jee_topics SET key_formulas = ? WHERE id = ?', [JSON.stringify(freshFormulas), firstTopic[0].id]);
            }
            formulas = freshFormulas;
          }
        } catch (err) {
          console.error(`[JEE-Syllabus] Formula generation failed for ${ch.chapter_name}:`, err.message);
        }
      }

      if (formulas.length > 0) {
        result.push({ ...ch, formulas: JSON.stringify(formulas) });
      }
    }
    res.json({ success: true, data: result });

  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getChapterFormulas = async (req, res) => {
  try {
    const { subjectSlug, chapterSlug } = req.params;
    const [rows] = await pool.query(
      `SELECT t.name AS topic_name, t.key_formulas
       FROM jee_topics t
       JOIN jee_chapters c ON t.chapter_id = c.id
       JOIN jee_subjects s ON c.subject_id = s.id
       WHERE s.slug = ? AND c.slug = ? AND t.key_formulas IS NOT NULL
       ORDER BY t.display_order`,
      [subjectSlug, chapterSlug]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
 
async function generateChapterFormulasAI(chapterName, subject) {
  const model = getModel();
  const prompt = `You are a JEE Physics/Chemistry/Maths expert. Generate a list of all ESSENTIAL formulas for the JEE chapter: "${chapterName}" in "${subject}".
  
Return ONLY valid JSON (no markdown wrapping):
[
  {"formula": "LaTeX string", "name": "Formula Name", "description": "1-sentence usage", "conditions": "When to apply"}
]
Include at least 8-12 major formulas. Use valid KaTeX/LaTeX formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    let cleaned = text.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '').trim();
    
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("[AI-Formula] Generation error:", e.message);
    return [];
  }
}
