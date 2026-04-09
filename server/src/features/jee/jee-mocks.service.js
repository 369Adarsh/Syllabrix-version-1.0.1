const { pool } = require('../../database/connection');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// question_ids can be stored as JSON array "[1,2,3]" or comma-separated "1,2,3"
const parseQuestionIds = (raw) => {
  if (!raw) return [];
  const s = String(raw).trim();
  if (s.startsWith('[')) {
    try { return JSON.parse(s); } catch { return []; }
  }
  return s.split(',').map(Number).filter(Boolean);
};

exports.getMocks = async (req, res) => {
  try {
    const { type, exam, class: classLevel } = req.query;
    let q = `SELECT m.*,
      (SELECT COUNT(*) FROM jee_test_attempts a WHERE a.mock_test_id = m.id AND a.user_id = ? AND a.status = 'completed') AS attempts_by_user,
      (SELECT a.total_score FROM jee_test_attempts a WHERE a.mock_test_id = m.id AND a.user_id = ? AND a.status = 'completed' ORDER BY a.completed_at DESC LIMIT 1) AS last_score
      FROM jee_mock_tests m WHERE m.is_published = 1`;
    const params = [req.user.id, req.user.id];
    if (type) { q += ' AND m.test_type = ?'; params.push(type); }
    if (exam) { q += ' AND m.exam_type = ?'; params.push(exam); }
    if (classLevel) { q += ' AND (m.class_level = ? OR m.class_level IS NULL)'; params.push(parseInt(classLevel)); }
    q += ' ORDER BY m.created_at DESC';
    const [mocks] = await pool.query(q, params);
    res.json({ success: true, data: mocks });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getMock = async (req, res) => {
  try {
    const [mocks] = await pool.query('SELECT * FROM jee_mock_tests WHERE id = ?', [req.params.id]);
    if (!mocks.length) return res.status(404).json({ success: false, message: 'Test not found' });
    const mock = mocks[0];
    const questionIds = parseQuestionIds(mock.question_ids);
    if (questionIds.length) {
      const placeholders = questionIds.map(() => '?').join(',');
      const [questions] = await pool.query(
        `SELECT q.id, q.question_text, q.question_type, q.options, q.marks, q.negative_marks,
                q.estimated_time_seconds, q.question_image_url, q.difficulty,
                c.name AS chapter_name, s.name AS subject_name, s.slug AS subject_slug
         FROM jee_questions q
         JOIN jee_chapters c ON q.chapter_id = c.id
         JOIN jee_subjects s ON q.subject_id = s.id
         WHERE q.id IN (${placeholders})`,
        questionIds
      );
      // Restore original order
      const qMap = {};
      questions.forEach(q => { qMap[q.id] = q; });
      mock.questions = questionIds.map(id => qMap[id]).filter(Boolean);
    } else {
      mock.questions = [];
    }
    delete mock.question_ids;
    res.json({ success: true, data: mock });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.startAttempt = async (req, res) => {
  try {
    // Check for existing in-progress attempt
    const [existing] = await pool.query(
      "SELECT id FROM jee_test_attempts WHERE user_id = ? AND mock_test_id = ? AND status = 'in_progress'",
      [req.user.id, req.params.id]
    );
    if (existing.length) return res.json({ success: true, data: { attempt_id: existing[0].id, resumed: true } });
    const [mocks] = await pool.query('SELECT total_marks, total_questions FROM jee_mock_tests WHERE id = ?', [req.params.id]);
    if (!mocks.length) return res.status(404).json({ success: false, message: 'Test not found' });
    const [result] = await pool.query(
      "INSERT INTO jee_test_attempts (user_id, mock_test_id, answers, total_score, max_score, percentage, correct_count, wrong_count, unanswered_count, total_time_seconds, started_at) VALUES (?,?,?,0,?,0,0,0,?,0,NOW())",
      [req.user.id, req.params.id, '[]', mocks[0].total_marks, mocks[0].total_questions]
    );
    res.json({ success: true, data: { attempt_id: result.insertId, resumed: false } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.saveProgress = async (req, res) => {
  try {
    const { answers, time_per_subject, total_time_seconds } = req.body;
    await pool.query(
      "UPDATE jee_test_attempts SET answers=?, time_per_subject=?, total_time_seconds=? WHERE mock_test_id=? AND user_id=? AND status='in_progress'",
      [JSON.stringify(answers || []), JSON.stringify(time_per_subject || {}), total_time_seconds || 0, req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.submitAttempt = async (req, res) => {
  try {
    const { answers, total_time_seconds, time_per_subject } = req.body;
    // Get mock test config
    const [mocks] = await pool.query('SELECT * FROM jee_mock_tests WHERE id = ?', [req.params.id]);
    if (!mocks.length) return res.status(404).json({ success: false, message: 'Test not found' });
    const mock = mocks[0];
    const scheme = JSON.parse(mock.marking_scheme || '{"correct":4,"wrong":-1,"unanswered":0}');
    const questionIds = parseQuestionIds(mock.question_ids);
    // Get correct answers
    let questions = [];
    if (questionIds.length) {
      const placeholders = questionIds.map(() => '?').join(',');
      const [rows] = await pool.query(
        `SELECT id, correct_answer, subject_id FROM jee_questions WHERE id IN (${placeholders})`,
        questionIds
      );
      questions = rows;
    }
    const correctMap = {};
    questions.forEach(q => { correctMap[q.id] = { answer: q.correct_answer, subject_id: q.subject_id }; });
    // Get subjects for breakdown
    const [subjects] = await pool.query('SELECT id, slug FROM jee_subjects');
    const subjectMap = {};
    subjects.forEach(s => { subjectMap[s.id] = s.slug; });
    // Score calculation
    let totalScore = 0, correct = 0, wrong = 0, unanswered = 0;
    const subjectScores = {};
    const answersArr = answers || [];
    questionIds.forEach(qId => {
      const answer = answersArr.find(a => a.question_id === qId);
      const qData = correctMap[qId];
      if (!qData) return;
      const subSlug = subjectMap[qData.subject_id] || 'unknown';
      if (!subjectScores[subSlug]) subjectScores[subSlug] = { score: 0, correct: 0, wrong: 0, unanswered: 0 };
      if (!answer || answer.selected === null || answer.selected === undefined || answer.selected === '') {
        unanswered++;
        subjectScores[subSlug].unanswered++;
      } else if (String(answer.selected).toUpperCase() === String(qData.answer).toUpperCase()) {
        totalScore += scheme.correct || 4;
        correct++;
        subjectScores[subSlug].score += scheme.correct || 4;
        subjectScores[subSlug].correct++;
      } else {
        totalScore += scheme.wrong || -1;
        wrong++;
        subjectScores[subSlug].score += scheme.wrong || -1;
        subjectScores[subSlug].wrong++;
      }
    });
    const percentage = mock.total_marks > 0 ? (totalScore / mock.total_marks) * 100 : 0;
    // Percentile prediction (rough estimate)
    const predictedPercentile = Math.min(99.9, Math.max(0, (percentage / 100) * 95 + 5)).toFixed(2);
    // Update attempt
    await pool.query(
      `UPDATE jee_test_attempts SET answers=?, total_score=?, percentage=?, correct_count=?, wrong_count=?,
       unanswered_count=?, subject_scores=?, total_time_seconds=?, time_per_subject=?,
       predicted_percentile=?, status='completed', completed_at=NOW()
       WHERE mock_test_id=? AND user_id=? AND status='in_progress'`,
      [JSON.stringify(answersArr), totalScore, percentage.toFixed(2), correct, wrong, unanswered,
       JSON.stringify(subjectScores), total_time_seconds || 0, JSON.stringify(time_per_subject || {}),
       predictedPercentile, req.params.id, req.user.id]
    );
    // Update mock attempt count
    await pool.query('UPDATE jee_mock_tests SET attempt_count = attempt_count + 1 WHERE id = ?', [req.params.id]);
    // Log errors
    for (const answer of answersArr) {
      if (answer.selected && correctMap[answer.question_id] &&
          String(answer.selected).toUpperCase() !== String(correctMap[answer.question_id].answer).toUpperCase()) {
        await pool.query(
          "INSERT IGNORE INTO jee_error_log (user_id, question_id, selected_answer, correct_answer, source_type, source_id) VALUES (?,?,?,?,'mock_test',?)",
          [req.user.id, answer.question_id, answer.selected, correctMap[answer.question_id].answer, req.params.id]
        ).catch(() => {});
      }
    }
    res.json({ success: true, data: { total_score: totalScore, max_score: mock.total_marks, percentage, correct_count: correct, wrong_count: wrong, unanswered_count: unanswered, subject_scores: subjectScores, predicted_percentile: predictedPercentile } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getResult = async (req, res) => {
  try {
    const [attempts] = await pool.query(
      `SELECT a.*, m.title, m.exam_type, m.total_marks, m.total_questions, m.duration_minutes, m.marking_scheme, m.question_ids
       FROM jee_test_attempts a JOIN jee_mock_tests m ON a.mock_test_id = m.id
       WHERE a.mock_test_id = ? AND a.user_id = ? AND a.status = 'completed'
       ORDER BY a.completed_at DESC LIMIT 1`,
      [req.params.id, req.user.id]
    );
    if (!attempts.length) return res.status(404).json({ success: false, message: 'No completed attempt found' });
    const attempt = attempts[0];
    // Get full questions with answers for review
    const questionIds = parseQuestionIds(attempt.question_ids);
    const answersArr = JSON.parse(attempt.answers || '[]');
    if (questionIds.length) {
      const placeholders = questionIds.map(() => '?').join(',');
      const [qs] = await pool.query(
        `SELECT q.id, q.question_text, q.question_type, q.options, q.correct_answer,
                q.solution_text, q.quick_trick, q.difficulty, q.marks, q.negative_marks,
                q.question_image_url, q.solution_image_url,
                c.name AS chapter_name, s.name AS subject_name, s.slug AS subject_slug
         FROM jee_questions q JOIN jee_chapters c ON q.chapter_id = c.id JOIN jee_subjects s ON q.subject_id = s.id
         WHERE q.id IN (${placeholders})`,
        questionIds
      );
      const questions = qs;
      const answerMap = {};
      answersArr.forEach(a => { answerMap[a.question_id] = a; });
      attempt.question_review = questions.map(q => ({
        ...q,
        your_answer: answerMap[q.id]?.selected || null,
        time_spent: answerMap[q.id]?.time_spent || 0,
        flagged: answerMap[q.id]?.flagged || false,
      }));
    }
    delete attempt.question_ids;
    res.json({ success: true, data: attempt });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.generateMock = async (req, res) => {
  try {
    const { exam_type = 'main', class_level, subject_id, test_type = 'full_mock', chapter_id } = req.body;
    let q = 'SELECT id FROM jee_questions WHERE is_active = 1';
    const params = [];
    if (subject_id) { q += ' AND subject_id = ?'; params.push(subject_id); }
    if (chapter_id) { q += ' AND chapter_id = ?'; params.push(chapter_id); }
    if (class_level) { q += ' AND chapter_id IN (SELECT id FROM jee_chapters WHERE class_level = ?)'; params.push(class_level); }

    const targetCount = test_type === 'full_mock' ? 90 : test_type === 'chapter_test' ? 30 : 20;
    q += ` ORDER BY RAND() LIMIT ${targetCount}`;
    const [questions] = await pool.query(q, params);

    if (questions.length < 5) {
      return res.status(400).json({
        success: false,
        message: `Not enough questions in the database (found ${questions.length}, need at least 5). Use "Generate Practice Questions" from a chapter page to add questions, then try again.`
      });
    }

    const ids = questions.map(q => q.id);
    const examLabel = exam_type === 'main' ? 'JEE Main' : 'JEE Advanced';
    const typeLabel = test_type === 'full_mock' ? 'Full Mock' : test_type === 'chapter_test' ? 'Chapter Test' : 'Practice Test';
    const title = `${examLabel} ${typeLabel} #${Date.now().toString().slice(-4)}`;
    const totalMarks = ids.length * 4;
    const duration = test_type === 'full_mock' ? 180 : test_type === 'chapter_test' ? 60 : 30;

    const [result] = await pool.query(
      `INSERT INTO jee_mock_tests (title, exam_type, class_level, test_type, subject_id, chapter_id, duration_minutes, total_questions, total_marks, question_ids, marking_scheme, difficulty_label, is_published)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,'Moderate',1)`,
      [title, exam_type, class_level || null, test_type, subject_id || null, chapter_id || null,
       duration, ids.length, totalMarks, JSON.stringify(ids),
       JSON.stringify({ correct: 4, wrong: -1, unanswered: 0 })]
    );
    res.json({ success: true, data: { id: result.insertId, title, total_questions: ids.length, total_marks: totalMarks, duration_minutes: duration } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
