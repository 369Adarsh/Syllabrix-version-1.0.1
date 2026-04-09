const { pool } = require('../../database/connection');

exports.getOverview = async (req, res) => {
  try {
    // Return ALL chapters with progress data (NULL if not started) so UI can render heatmap
    const [progress] = await pool.query(
      `SELECT c.id, c.name AS chapter_name, c.slug, c.class_level, c.chapter_number,
              s.name AS subject_name, s.slug AS subject_slug, s.icon_color,
              COALESCE(p.mastery_level, 'not_started') AS mastery_level,
              COALESCE(p.questions_attempted, 0) AS questions_attempted,
              COALESCE(p.questions_correct, 0) AS questions_correct,
              COALESCE(p.accuracy, 0) AS accuracy,
              p.last_studied_at
       FROM jee_chapters c
       JOIN jee_subjects s ON c.subject_id = s.id
       LEFT JOIN jee_user_progress p ON p.chapter_id = c.id AND p.user_id = ?
       WHERE c.is_active = 1
       ORDER BY s.display_order, c.class_level, c.chapter_number`,
      [req.user.id]
    );
    res.json({ success: true, data: progress });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getChapterProgress = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM jee_user_progress WHERE user_id=? AND chapter_id=?',
      [req.user.id, req.params.id]
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { theory_completed, formulas_reviewed, questions_attempted, questions_correct, mastery_level } = req.body;
    await pool.query(
      `INSERT INTO jee_user_progress (user_id, chapter_id, theory_completed, formulas_reviewed, questions_attempted, questions_correct, mastery_level, last_studied_at)
       VALUES (?,?,?,?,?,?,?,NOW())
       ON DUPLICATE KEY UPDATE
         theory_completed = COALESCE(?, theory_completed),
         formulas_reviewed = COALESCE(?, formulas_reviewed),
         questions_attempted = COALESCE(?, questions_attempted),
         questions_correct = COALESCE(?, questions_correct),
         mastery_level = COALESCE(?, mastery_level),
         accuracy = IF(COALESCE(?, questions_attempted) > 0, (COALESCE(?, questions_correct) / COALESCE(?, questions_attempted)) * 100, accuracy),
         last_studied_at = NOW()`,
      [req.user.id, req.params.id,
       theory_completed ?? 0, formulas_reviewed ?? 0, questions_attempted ?? 0, questions_correct ?? 0, mastery_level || 'beginner',
       theory_completed, formulas_reviewed, questions_attempted, questions_correct, mastery_level,
       questions_attempted, questions_correct, questions_attempted]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.addBookmark = async (req, res) => {
  try {
    const { bookmark_type, reference_id, folder, notes } = req.body;
    const [result] = await pool.query(
      'INSERT IGNORE INTO jee_bookmarks (user_id, bookmark_type, reference_id, folder, notes) VALUES (?,?,?,?,?)',
      [req.user.id, bookmark_type, reference_id, folder || 'default', notes || null]
    );
    res.json({ success: true, data: { id: result.insertId } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const { type } = req.query;
    let q = 'SELECT * FROM jee_bookmarks WHERE user_id = ?';
    const params = [req.user.id];
    if (type) { q += ' AND bookmark_type = ?'; params.push(type); }
    q += ' ORDER BY created_at DESC';
    const [bookmarks] = await pool.query(q, params);
    res.json({ success: true, data: bookmarks });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    await pool.query('DELETE FROM jee_bookmarks WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getErrors = async (req, res) => {
  try {
    const { error_type, reviewed, page = 1, limit = 20 } = req.query;
    let q = `SELECT el.*, q.question_text, c.name AS chapter_name, s.name AS subject_name
             FROM jee_error_log el
             JOIN jee_questions q ON el.question_id = q.id
             JOIN jee_chapters c ON q.chapter_id = c.id
             JOIN jee_subjects s ON c.subject_id = s.id
             WHERE el.user_id = ?`;
    const params = [req.user.id];
    if (error_type) { q += ' AND el.error_type = ?'; params.push(error_type); }
    if (reviewed !== undefined) { q += ' AND el.reviewed = ?'; params.push(reviewed === 'true' ? 1 : 0); }
    q += ' ORDER BY el.created_at DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    q += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    const [errors] = await pool.query(q, params);
    res.json({ success: true, data: errors });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.reviewError = async (req, res) => {
  try {
    const { notes } = req.body;
    await pool.query(
      'UPDATE jee_error_log SET reviewed=1, notes=? WHERE id=? AND user_id=?',
      [notes || null, req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
