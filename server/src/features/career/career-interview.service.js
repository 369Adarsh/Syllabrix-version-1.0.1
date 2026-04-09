const { pool } = require('../../database/connection');
const successResponse = (data) => ({ success: true, data });
const { generateJSON, generateText } = require('../../services/ai.service');

const callGeminiJSON = (prompt) => generateJSON(prompt, { task: 'json', temperature: 0.7, maxTokens: 4096 });

exports.startInterview = async (req, res) => {
  const userId = req.user.id;
  const { target_company, target_role, interview_type = 'technical' } = req.body;

  if (!target_role) return res.status(400).json({ success: false, message: 'target_role is required' });

  const [[cp]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
  const [[sp]] = await pool.query('SELECT skills_detected FROM career_skill_profiles WHERE user_id = ?', [userId]);
  const skills = sp?.skills_detected ? JSON.parse(sp.skills_detected).slice(0, 8).map(s => s.name) : [];

  const prompt = `You are a ${target_company || 'top tech company'} interviewer conducting a ${interview_type} interview for a ${target_role} position.

Candidate background:
- Experience: ${cp?.experience_years || 0} years
- Skills: ${skills.join(', ') || 'Technology professional'}

Generate 8 interview questions appropriate for ${interview_type} round.

Return ONLY valid JSON (no markdown):
{
  "questions": [
    {
      "id": 1,
      "question": "Can you walk me through your experience with SAP BTP?",
      "category": "experience",
      "difficulty": "medium",
      "expected_duration_seconds": 120
    }
  ]
}

Question types for ${interview_type}:
- technical: coding problems, system design, technical concepts
- behavioral: STAR-format situations, leadership, conflict resolution
- hr: motivation, salary, career goals, culture fit
- case_study: business problems, analysis, recommendations`;

  const data = await callGeminiJSON(prompt);

  const [result] = await pool.query(
    `INSERT INTO career_mock_interviews
       (user_id, target_company, target_role, interview_type, questions, status)
     VALUES (?, ?, ?, ?, ?, 'in_progress')`,
    [userId, target_company || '', target_role, interview_type, JSON.stringify(data.questions || [])]
  );

  return res.json(successResponse({
    interview_id: result.insertId,
    questions: data.questions || [],
    current_question_index: 0,
  }));
};

exports.submitAnswer = async (req, res) => {
  const userId = req.user.id;
  const { interview_id, question_id, answer_text, time_seconds } = req.body;

  const [[interview]] = await pool.query(
    'SELECT * FROM career_mock_interviews WHERE id = ? AND user_id = ? AND status = ?',
    [interview_id, userId, 'in_progress']
  );
  if (!interview) return res.status(404).json({ success: false, message: 'Active interview not found' });

  const questions = JSON.parse(interview.questions || '[]');
  const answers = JSON.parse(interview.answers || '[]');
  const question = questions.find(q => q.id === question_id);

  if (!question) return res.status(400).json({ success: false, message: 'Question not found in this interview' });

  // Quick AI feedback on this answer
  const quickFeedback = (await generateText(
    `Interview question: "${question.question}"\nCandidate answer: "${answer_text}"\n\nGive a brief 2-sentence feedback on this answer. Be constructive. Plain text, no JSON.`,
    { task: 'fast', temperature: 0.5, maxTokens: 200 }
  )).trim();

  answers.push({ question_id, answer_text, time_seconds: time_seconds || 0, quick_feedback: quickFeedback });
  await pool.query('UPDATE career_mock_interviews SET answers = ? WHERE id = ?', [JSON.stringify(answers), interview_id]);

  // Find next question
  const answeredIds = answers.map(a => a.question_id);
  const nextQuestion = questions.find(q => !answeredIds.includes(q.id));

  return res.json(successResponse({
    quick_feedback: quickFeedback,
    next_question: nextQuestion || null,
    is_complete: !nextQuestion,
  }));
};

exports.evaluateInterview = async (req, res) => {
  const userId = req.user.id;
  const { interview_id } = req.body;

  const [[interview]] = await pool.query(
    'SELECT * FROM career_mock_interviews WHERE id = ? AND user_id = ?',
    [interview_id, userId]
  );
  if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

  const questions = JSON.parse(interview.questions || '[]');
  const answers = JSON.parse(interview.answers || '[]');

  const qaText = questions.map(q => {
    const a = answers.find(ans => ans.question_id === q.id);
    return `Q: ${q.question}\nA: ${a?.answer_text || '(no answer)'}`;
  }).join('\n\n');

  const prompt = `You are a senior hiring manager evaluating a mock interview.

Role: ${interview.target_role} at ${interview.target_company || 'company'}
Interview type: ${interview.interview_type}

Questions and Answers:
${qaText}

Provide a comprehensive evaluation.

Return ONLY valid JSON (no markdown):
{
  "overall_score": 72,
  "question_scores": [
    {"question_id": 1, "score": 80, "feedback": "Good answer but lacked specific metrics", "model_answer": "Ideal answer would include..."}
  ],
  "strengths": ["Clear communication", "Technical depth on BTP"],
  "improvements": ["Quantify achievements with metrics", "Be more concise on behavioral questions"],
  "hiring_recommendation": "Strong candidate with minor gaps",
  "next_steps": ["Practice STAR format answers", "Review system design basics"]
}`;

  const evaluation = await callGeminiJSON(prompt);

  await pool.query(
    `UPDATE career_mock_interviews SET
       overall_score = ?, question_scores = ?, strengths = ?, improvements = ?,
       status = 'completed', completed_at = NOW()
     WHERE id = ?`,
    [
      evaluation.overall_score || 0,
      JSON.stringify(evaluation.question_scores || []),
      JSON.stringify(evaluation.strengths || []),
      JSON.stringify(evaluation.improvements || []),
      interview_id,
    ]
  );

  return res.json(successResponse(evaluation));
};

exports.getHistory = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, target_company, target_role, interview_type, overall_score, status, started_at, completed_at
     FROM career_mock_interviews WHERE user_id = ? ORDER BY started_at DESC LIMIT 20`,
    [req.user.id]
  );
  return res.json(successResponse(rows));
};

exports.getInterview = async (req, res) => {
  const [[row]] = await pool.query(
    'SELECT * FROM career_mock_interviews WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!row) return res.status(404).json({ success: false, message: 'Interview not found' });
  return res.json(successResponse(row));
};
