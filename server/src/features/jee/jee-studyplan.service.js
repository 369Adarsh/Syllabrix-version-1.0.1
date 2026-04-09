const { pool } = require('../../database/connection');
const { getGeminiModel } = require('../../utils/gemini-utils');


exports.getToday = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [plans] = await pool.query(
      'SELECT * FROM jee_study_plans WHERE user_id=? AND plan_date=?',
      [req.user.id, today]
    );
    if (plans.length) {
      const plan = plans[0];
      if (typeof plan.tasks === 'string') {
        try { plan.tasks = JSON.parse(plan.tasks); } catch { plan.tasks = []; }
      }
      return res.json({ success: true, data: plan });
    }
    // Auto-generate if not exists
    req.body = { date: today };
    return exports.generate(req, res);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.generate = async (req, res) => {
  try {
    const { date } = req.body;
    const planDate = date || new Date().toISOString().split('T')[0];
    // Get user's progress and weak areas
    const [weakChapters] = await pool.query(
      `SELECT c.name, s.name AS subject_name, p.mastery_level, p.accuracy
       FROM jee_user_progress p JOIN jee_chapters c ON p.chapter_id = c.id JOIN jee_subjects s ON c.subject_id = s.id
       WHERE p.user_id = ? AND p.mastery_level IN ('not_started','beginner')
       ORDER BY p.accuracy ASC, p.last_studied_at ASC LIMIT 5`,
      [req.user.id]
    );
    const model = getGeminiModel();
    const prompt = `You are a JEE study planner. Create a daily study plan for ${planDate}.
Weak areas: ${JSON.stringify(weakChapters)}
Available study time: 6 hours (360 minutes)
Cover Physics, Chemistry, Mathematics.

Return JSON:
{
  "tasks": [
    {"subject": "Physics", "chapter": "Rotational Motion", "topic": "Moment of Inertia", "type": "theory", "duration_min": 45, "completed": false},
    {"subject": "Chemistry", "chapter": "Chemical Bonding", "topic": "Hybridization", "type": "practice", "duration_min": 60, "completed": false}
  ],
  "total_planned_minutes": 360
}
Types: theory, practice, revision, test, formula_revision
Only JSON, no markdown.`;
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const plan = JSON.parse(text);
    const [existing] = await pool.query('SELECT id FROM jee_study_plans WHERE user_id=? AND plan_date=?', [req.user.id, planDate]);
    let planId;
    if (existing.length) {
      await pool.query('UPDATE jee_study_plans SET tasks=?, total_planned_minutes=?, generated_by="ai" WHERE id=?',
        [JSON.stringify(plan.tasks), plan.total_planned_minutes, existing[0].id]);
      planId = existing[0].id;
    } else {
      const [r] = await pool.query(
        'INSERT INTO jee_study_plans (user_id, plan_date, tasks, total_planned_minutes, generated_by) VALUES (?,?,?,?,?)',
        [req.user.id, planDate, JSON.stringify(plan.tasks), plan.total_planned_minutes, 'ai']
      );
      planId = r.insertId;
    }
    res.json({ success: true, data: { id: planId, plan_date: planDate, tasks: plan.tasks, total_planned_minutes: plan.total_planned_minutes, total_completed_minutes: 0, generated_by: 'ai' } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { task_index } = req.body;
    const [plans] = await pool.query('SELECT * FROM jee_study_plans WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!plans.length) return res.status(404).json({ success: false, message: 'Plan not found' });
    const plan = plans[0];
    let tasks = plan.tasks;
    if (typeof tasks === 'string') {
      try { tasks = JSON.parse(tasks); } catch { tasks = []; }
    }
    if (tasks[task_index] !== undefined) {
      tasks[task_index].completed = true;
      const completedMin = tasks.filter(t => t.completed).reduce((s, t) => s + (t.duration_min || 0), 0);
      await pool.query('UPDATE jee_study_plans SET tasks=?, total_completed_minutes=? WHERE id=?',
        [JSON.stringify(tasks), completedMin, req.params.id]);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const [plans] = await pool.query(
      'SELECT id, plan_date, tasks, total_planned_minutes, total_completed_minutes, generated_by, created_at FROM jee_study_plans WHERE user_id=? ORDER BY plan_date DESC LIMIT 30',
      [req.user.id]
    );
    res.json({ success: true, data: plans });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
