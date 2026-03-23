const ai = require('../../services/ai.service');
const { pool } = require('../../database/connection');

/**
 * Auto-generate daily quiz from today's current affairs
 */
const generateDailyQuiz = async (date) => {
  const dateStr = date || new Date().toISOString().slice(0, 10);

  // Check if already exists
  const [existing] = await pool.query(
    `SELECT id FROM quizzes WHERE quiz_type = 'daily_current_affairs' AND date_for = ? AND is_daily = 1`,
    [dateStr]
  );
  if (existing.length > 0) {
    return { id: existing[0].id, already_exists: true };
  }

  // Get today's current affairs as context
  const [affairs] = await pool.query(
    `SELECT title, category, content_points, importance_level FROM current_affairs WHERE date = ? ORDER BY importance_level DESC LIMIT 15`,
    [dateStr]
  );

  let context = '';
  if (affairs.length > 0) {
    context = affairs.map(a => {
      const points = typeof a.content_points === 'string' ? JSON.parse(a.content_points) : (a.content_points || []);
      return `[${a.category}] ${a.title}: ${points.join('; ')}`;
    }).join('\n');
  }

  const prompt = `Generate a daily current affairs quiz for Indian competitive exam preparation.
Date: ${dateStr}
${context ? `\nToday's news context:\n${context}` : ''}

Return ONLY a JSON object:
{
  "title": "Daily Quiz — ${dateStr}",
  "questions": [
    {
      "question": "Clear exam-style question about a current event",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Why this is correct — with key fact",
      "category": "national|international|economy|science_tech|sports|environment",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Rules:
- Generate 10-15 questions
- Mix of easy (30%), medium (50%), hard (20%)
- Cover at least 4 different categories
- Questions should test factual knowledge (who, what, where, when)
- Include questions about: appointments, schemes, summits, awards, sports results, science discoveries
- Each option must be plausible (no obviously wrong answers)
- correct_answer is 0-based index
- Explanation should be 1-2 sentences
- Use REAL events, not made-up ones
- ONLY valid JSON`;

  const quizData = await ai.generateJSON(prompt, { temperature: 0.4 });
  const questions = quizData.questions || [];

  // Save to quizzes table
  const [result] = await pool.query(
    `INSERT INTO quizzes (title, quiz_type, questions, total_questions, difficulty, is_daily, date_for, is_published) VALUES (?, 'daily_current_affairs', ?, ?, 'mixed', 1, ?, 1)`,
    [quizData.title || `Daily Quiz — ${dateStr}`, JSON.stringify(questions), questions.length, dateStr]
  );

  return { id: result.insertId, title: quizData.title, question_count: questions.length };
};

/**
 * Generate a topic-specific quiz
 */
const generateTopicQuiz = async (topic, options = {}) => {
  const { difficulty = 'mixed', count = 10, exam, class_level, subject } = options;

  let context = '';
  if (class_level) context += `For class ${class_level} student. `;
  if (subject) context += `Subject: ${subject}. `;
  if (exam) context += `Exam: ${exam}. `;

  const prompt = `Generate a quiz on the topic: "${topic}"
${context}Difficulty: ${difficulty}

Return ONLY JSON:
{
  "title": "Quiz: ${topic}",
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "Why correct, with key fact",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Rules:
- Generate exactly ${count} questions
- ${difficulty === 'easy' ? 'All easy — direct recall' : difficulty === 'hard' ? 'All hard — application/analysis' : 'Mix: 30% easy, 50% medium, 20% hard'}
- Questions must be accurate and educational
- Include formulas/numbers where relevant
- Explanations are concise but helpful
- ONLY valid JSON`;

  const quizData = await ai.generateJSON(prompt, { temperature: 0.5 });
  const questions = quizData.questions || [];

  const [result] = await pool.query(
    `INSERT INTO quizzes (title, subject, topic, quiz_type, questions, total_questions, difficulty, is_published) VALUES (?, ?, ?, 'topic_practice', ?, ?, ?, 1)`,
    [quizData.title || `Quiz: ${topic}`, subject || null, topic, JSON.stringify(questions), questions.length, difficulty]
  );

  return { id: result.insertId, title: quizData.title, questions };
};

/**
 * Generate weekly challenge quiz
 */
const generateWeeklyChallenge = async () => {
  const endDate = new Date();
  const startDate = new Date(Date.now() - 7 * 86400000);
  const weekStr = `${startDate.toISOString().slice(5, 10)} to ${endDate.toISOString().slice(5, 10)}`;

  // Get week's current affairs
  const [affairs] = await pool.query(
    `SELECT title, category FROM current_affairs WHERE date BETWEEN ? AND ? ORDER BY importance_level DESC LIMIT 20`,
    [startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)]
  );

  const context = affairs.map(a => `[${a.category}] ${a.title}`).join('\n');

  const prompt = `Generate a Weekly Challenge Quiz covering the week: ${weekStr}

This week's major events:
${context || 'Generate from your knowledge of recent Indian/world events.'}

Return JSON with 20 challenging questions covering ALL categories. Mix difficulty: 20% easy, 50% medium, 30% hard.
Format same as daily quiz but with 20 questions. Title: "Weekly Challenge — ${weekStr}"
ONLY valid JSON.`;

  const quizData = await ai.generateJSON(prompt, { temperature: 0.4, maxTokens: 5000 });
  const questions = quizData.questions || [];

  const [result] = await pool.query(
    `INSERT INTO quizzes (title, quiz_type, questions, total_questions, difficulty, date_for, is_published, time_limit_seconds) VALUES (?, 'weekly_challenge', ?, ?, 'mixed', ?, 1, 1200)`,
    [quizData.title || `Weekly Challenge — ${weekStr}`, JSON.stringify(questions), questions.length, endDate.toISOString().slice(0, 10)]
  );

  return { id: result.insertId, title: quizData.title, question_count: questions.length };
};

module.exports = { generateDailyQuiz, generateTopicQuiz, generateWeeklyChallenge };
