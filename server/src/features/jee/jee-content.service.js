const { pool } = require('../../database/connection');
const { generateJSON } = require('../../services/ai.service');

exports.getNCERTChapters = async (req, res) => {
  try {
    const { subject, class: classLevel, type = 'textbook' } = req.query;
    if (!subject || !classLevel) return res.status(400).json({ success: false, message: 'Missing parameters' });

    const [rows] = await pool.query(
      `SELECT DISTINCT chapter_number, chapter_name 
       FROM jee_ncert_solutions 
       WHERE subject_id = (SELECT id FROM jee_subjects WHERE slug = ?) 
       AND class_level = ? AND book_type = ?
       ORDER BY chapter_number`,
      [subject, parseInt(classLevel), type]
    );

    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getNCERTExercises = async (req, res) => {
  try {
    const { subject, class: classLevel, chapter, type = 'textbook' } = req.params;
    
    const [rows] = await pool.query(
      `SELECT * FROM jee_ncert_solutions 
       WHERE subject_id = (SELECT id FROM jee_subjects WHERE slug = ?)
       AND class_level = ? AND chapter_number = ? AND book_type = ?
       ORDER BY id`,
      [subject, parseInt(classLevel), parseInt(chapter), type]
    );

    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM jee_ncert_solutions WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Solution not found' });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.generateNCERTChapter = async (req, res) => {
  try {
    const { subject, class: classLevel, chapter, chapter_name, type = 'textbook' } = req.body;
    
    const prompt = `You are an expert JEE teacher. Generate detailed step-by-step NCERT solutions for Class ${classLevel} ${subject}, Chapter ${chapter}: "${chapter_name}".
    
    Return a JSON array of questions for this chapter.
    Each item must have:
    - exercise_name (e.g. 'Exercise 1.1', 'Miscellaneous')
    - question_number (e.g. '1', '2')
    - question_text (Markdown + KaTeX)
    - solution_text (Detailed Step-by-Step, Markdown + KaTeX)
    - difficulty (easy, medium, hard)
    - key_concept
    
    Format: [{"exercise_name":"...","question_number":"...","question_text":"...","solution_text":"...","difficulty":"...","key_concept":"..."}]
    Generate at least 15-20 common questions if it's a large chapter.`;

    const questions = await generateJSON(prompt, { task: 'json' });
    
    const [subjRows] = await pool.query('SELECT id FROM jee_subjects WHERE slug = ?', [subject]);
    if (!subjRows.length) throw new Error('Subject not found');
    const subject_id = subjRows[0].id;

    for (const q of questions) {
      await pool.query(
        `INSERT IGNORE INTO jee_ncert_solutions 
         (subject_id, class_level, book_type, chapter_number, chapter_name, exercise_name, question_number, question_text, solution_text, key_concept, difficulty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [subject_id, parseInt(classLevel), type, parseInt(chapter), chapter_name, q.exercise_name, q.question_number, q.question_text, q.solution_text, q.key_concept, q.difficulty]
      );
    }

    res.json({ success: true, message: `Generated ${questions.length} solutions` });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Books (HC Verma, etc)
exports.getBooks = async (req, res) => {
  res.json({
    success: true,
    data: [
      { slug: 'hc-verma-vol1', name: 'HC Verma - Concepts of Physics Vol 1', subject: 'physics', premium: true },
      { slug: 'hc-verma-vol2', name: 'HC Verma - Concepts of Physics Vol 2', subject: 'physics', premium: true },
      { slug: 'dc-pandey-mechanics', name: 'DC Pandey - Mechanics', subject: 'physics', premium: true }
    ]
  });
};

exports.getBookChapters = async (req, res) => {
  try {
    const { bookSlug } = req.params;
    const [rows] = await pool.query(
      'SELECT DISTINCT chapter_number, chapter_name FROM jee_book_solutions WHERE book_slug = ? ORDER BY chapter_number',
      [bookSlug]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getBookSolutions = async (req, res) => {
  try {
    const { bookSlug, chapter } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM jee_book_solutions WHERE book_slug = ? AND chapter_number = ? ORDER BY id',
      [bookSlug, parseInt(chapter)]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.escalateToTeacher = async (req, res) => {
  try {
    const { doubt_text, ai_answer, subject, chapter, image_url } = req.body;
    const userId = req.user.id;

    // Check if user is Elite
    const [userRows] = await pool.query('SELECT subscription_tier FROM users WHERE id = ?', [userId]);
    const tier = userRows[0]?.subscription_tier || 'free';
    if (tier !== 'elite' && tier !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only Elite users can escalate doubts to human teachers.' });
    }

    const [result] = await pool.query(
      `INSERT INTO jee_teacher_doubts 
       (student_id, subject, chapter, question_text, question_image_url, ai_answer, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [userId, subject || 'General', chapter || 'General', doubt_text, image_url || null, ai_answer]
    );

    res.json({ success: true, data: { id: result.insertId }, message: 'Doubt escalated to expert teachers manually.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
