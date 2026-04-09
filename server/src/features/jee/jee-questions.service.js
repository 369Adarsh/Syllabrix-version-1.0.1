const { pool } = require('../../database/connection');

exports.getPYQs = async (req, res) => {
  try {
    const { subject, chapter, year, type, difficulty, page = 1, limit = 20 } = req.query;
    let q = `
      SELECT q.id, q.question_text, q.question_type, q.options, q.difficulty,
             q.marks, q.negative_marks, q.estimated_time_seconds,
             q.source_type, q.source_year, q.source_session, q.source_paper,
             q.concept_tags, q.question_image_url,
             c.name AS chapter_name, c.slug AS chapter_slug,
             s.name AS subject_name, s.slug AS subject_slug, s.icon_color,
             -- Hide correct_answer and solution for free tier (handled client-side via subscription)
             q.correct_answer, q.solution_text, q.quick_trick
      FROM jee_questions q
      JOIN jee_chapters c ON q.chapter_id = c.id
      JOIN jee_subjects s ON q.subject_id = s.id
      WHERE q.is_active = 1 AND q.source_type IN ('pyq_main','pyq_advanced')
    `;
    const params = [];
    if (subject) { q += ' AND s.slug = ?'; params.push(subject); }
    if (chapter) { q += ' AND c.slug = ?'; params.push(chapter); }
    if (year) { q += ' AND q.source_year = ?'; params.push(parseInt(year)); }
    if (type === 'main') { q += " AND q.source_type = 'pyq_main'"; }
    else if (type === 'advanced') { q += " AND q.source_type = 'pyq_advanced'"; }
    if (difficulty) { q += ' AND q.difficulty = ?'; params.push(difficulty); }
    q += ' ORDER BY q.source_year DESC, q.id DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    q += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    const [questions] = await pool.query(q, params);
    res.json({ success: true, data: questions });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getPYQ = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT q.*, c.name AS chapter_name, c.slug AS chapter_slug,
              s.name AS subject_name, s.slug AS subject_slug, s.icon_color
       FROM jee_questions q
       JOIN jee_chapters c ON q.chapter_id = c.id
       JOIN jee_subjects s ON q.subject_id = s.id
       WHERE q.id = ? AND q.is_active = 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getWeightage = async (req, res) => {
  try {
    const { subject } = req.query;
    const params = [];
    let q = `
      SELECT c.name, c.slug, c.class_level, c.jee_main_weightage, c.jee_advanced_weightage,
             COUNT(q.id) AS total_questions,
             SUM(CASE WHEN q.source_type = 'pyq_main' THEN 1 ELSE 0 END) AS main_questions,
             SUM(CASE WHEN q.source_type = 'pyq_advanced' THEN 1 ELSE 0 END) AS advanced_questions
      FROM jee_chapters c
      LEFT JOIN jee_questions q ON q.chapter_id = c.id AND q.is_active = 1
      JOIN jee_subjects s ON c.subject_id = s.id
      WHERE c.is_active = 1
    `;
    if (subject) { q += ' AND s.slug = ?'; params.push(subject); }
    q += ' GROUP BY c.id ORDER BY c.class_level, c.chapter_number';
    const [rows] = await pool.query(q, params);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const { chapter } = req.query;
    const [rows] = await pool.query(
      `SELECT q.source_year, q.source_type, COUNT(*) AS count
       FROM jee_questions q JOIN jee_chapters c ON q.chapter_id = c.id
       WHERE c.slug = ? AND q.source_year IS NOT NULL
       GROUP BY q.source_year, q.source_type ORDER BY q.source_year`,
      [chapter]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
