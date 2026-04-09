const { pool } = require('../../database/connection');

exports.getOverview = async (req, res) => {
  try {
    const uid = req.user.id;
    const [[chaptersTotal]] = await pool.query('SELECT COUNT(*) AS total FROM jee_chapters WHERE is_active=1');
    const [[chaptersStudied]] = await pool.query("SELECT COUNT(*) AS total FROM jee_user_progress WHERE user_id=? AND mastery_level != 'not_started'", [uid]);
    const [[pyqStats]] = await pool.query('SELECT COUNT(DISTINCT el.question_id) AS attempted FROM jee_error_log el WHERE el.user_id=?', [uid]);
    const [[mockStats]] = await pool.query("SELECT COUNT(*) AS total, AVG(percentage) AS avg_score, MAX(total_score) AS best_score FROM jee_test_attempts WHERE user_id=? AND status='completed'", [uid]);
    const [[streakData]] = await pool.query('SELECT current_streak FROM user_streaks WHERE user_id=? LIMIT 1', [uid]).catch(() => [[{ current_streak: 0 }]]);
    res.json({ success: true, data: {
      chapters_total: chaptersTotal.total,
      chapters_studied: chaptersStudied.total,
      syllabus_percent: chaptersTotal.total > 0 ? Math.round((chaptersStudied.total / chaptersTotal.total) * 100) : 0,
      pyq_attempted: pyqStats.attempted || 0,
      mock_tests_taken: mockStats.total || 0,
      mock_avg_score: mockStats.avg_score ? parseFloat(mockStats.avg_score).toFixed(1) : 0,
      mock_best_score: mockStats.best_score || 0,
      streak: streakData?.current_streak || 0,
    }});
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getSubjectAnalytics = async (req, res) => {
  try {
    const { slug } = req.params;
    const [chapters] = await pool.query(
      `SELECT c.id, c.name, c.slug, c.class_level, c.chapter_number, c.jee_main_weightage,
              p.mastery_level, p.questions_attempted, p.questions_correct, p.accuracy, p.last_studied_at
       FROM jee_chapters c
       JOIN jee_subjects s ON c.subject_id = s.id
       LEFT JOIN jee_user_progress p ON p.chapter_id = c.id AND p.user_id = ?
       WHERE s.slug = ? AND c.is_active = 1
       ORDER BY c.class_level, c.chapter_number`,
      [req.user.id, slug]
    );
    res.json({ success: true, data: chapters });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getChapterAnalytics = async (req, res) => {
  try {
    const [errors] = await pool.query(
      `SELECT el.error_type, COUNT(*) AS count
       FROM jee_error_log el JOIN jee_questions q ON el.question_id = q.id
       WHERE el.user_id = ? AND q.chapter_id = ?
       GROUP BY el.error_type`,
      [req.user.id, req.params.id]
    );
    const [progress] = await pool.query(
      'SELECT * FROM jee_user_progress WHERE user_id=? AND chapter_id=?',
      [req.user.id, req.params.id]
    );
    res.json({ success: true, data: { progress: progress[0] || null, error_breakdown: errors } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getMockTrends = async (req, res) => {
  try {
    const [trends] = await pool.query(
      `SELECT a.completed_at, a.total_score, a.max_score, a.percentage, a.correct_count, a.wrong_count, m.title, m.exam_type
       FROM jee_test_attempts a JOIN jee_mock_tests m ON a.mock_test_id = m.id
       WHERE a.user_id = ? AND a.status = 'completed'
       ORDER BY a.completed_at ASC LIMIT 20`,
      [req.user.id]
    );
    res.json({ success: true, data: trends });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getErrorPatterns = async (req, res) => {
  try {
    const [patterns] = await pool.query(
      `SELECT el.error_type, COUNT(*) AS count,
              COUNT(CASE WHEN el.reviewed = 1 THEN 1 END) AS reviewed
       FROM jee_error_log el WHERE el.user_id = ?
       GROUP BY el.error_type ORDER BY count DESC`,
      [req.user.id]
    );
    const [topErrors] = await pool.query(
      `SELECT q.question_text, q.id AS question_id, c.name AS chapter_name, s.name AS subject_name, el.error_type, el.id
       FROM jee_error_log el
       JOIN jee_questions q ON el.question_id = q.id
       JOIN jee_chapters c ON q.chapter_id = c.id
       JOIN jee_subjects s ON c.subject_id = s.id
       WHERE el.user_id = ? AND el.reviewed = 0
       ORDER BY el.created_at DESC LIMIT 10`,
      [req.user.id]
    );
    res.json({ success: true, data: { patterns, recent_errors: topErrors } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getRankPrediction = async (req, res) => {
  try {
    const [[latest]] = await pool.query(
      "SELECT total_score, max_score, percentage, predicted_percentile FROM jee_test_attempts WHERE user_id=? AND status='completed' ORDER BY completed_at DESC LIMIT 1",
      [req.user.id]
    );
    if (!latest) return res.json({ success: true, data: null });
    const percentile = parseFloat(latest.predicted_percentile || 0);
    // Rough rank prediction based on 2024 JEE Main data (~1.1M candidates)
    const totalCandidates = 1100000;
    const rankMin = Math.round(totalCandidates * (1 - percentile / 100));
    const rankMax = Math.round(rankMin * 1.15);
    res.json({ success: true, data: {
      latest_score: latest.total_score,
      max_score: latest.max_score,
      percentage: latest.percentage,
      predicted_percentile: percentile,
      predicted_rank_min: rankMin,
      predicted_rank_max: rankMax,
      rank_range: `${rankMin.toLocaleString()}–${rankMax.toLocaleString()}`,
    }});
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
