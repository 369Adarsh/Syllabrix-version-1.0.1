const ai = require('../../services/ai.service');

const INTERVIEW_TYPES = {
  upsc: { name: 'UPSC Civil Services', emoji: '🏛️', desc: 'IAS/IPS personality test preparation', duration: 30 },
  banking: { name: 'Banking & SSC', emoji: '🏦', desc: 'IBPS, SBI, SSC interview prep', duration: 15 },
  campus: { name: 'Campus Placement', emoji: '💼', desc: 'IT/Engineering company interviews', duration: 20 },
  ssb: { name: 'NDA/SSB', emoji: '🎖️', desc: 'Defence services selection board', duration: 25 },
  scholarship: { name: 'Scholarship', emoji: '🎓', desc: 'Scholarship and college admission interviews', duration: 15 },
  school_admission: { name: 'School Admission', emoji: '🏫', desc: 'Private school admission for younger students', duration: 10 },
};

/**
 * Start a mock interview — generates initial questions
 */
const startInterview = async (type, options = {}) => {
  const { name, background, career_goal, class_level } = options;
  const interviewType = INTERVIEW_TYPES[type];
  if (!interviewType) throw new Error('Invalid interview type');

  const prompt = `You are a panel interviewer for: ${interviewType.name}
${name ? `Candidate name: ${name}` : ''}
${background ? `Background: ${background}` : ''}
${career_goal ? `Career goal: ${career_goal}` : ''}
${class_level ? `Class: ${class_level}` : ''}

Generate the first 5 interview questions. Start with an ice-breaker, then progress to harder questions.

Return ONLY JSON:
{
  "interview_type": "${type}",
  "greeting": "Brief, professional greeting to set the tone (2 sentences)",
  "questions": [
    {
      "id": 1,
      "question": "Interview question",
      "category": "introduction|current_affairs|domain|situational|opinion|technical",
      "difficulty": "easy|medium|hard",
      "expected_duration_seconds": 60,
      "follow_up_hint": "What the interviewer might ask next based on the answer",
      "ideal_answer_points": ["Key point 1 to cover", "Key point 2", "Key point 3"]
    }
  ],
  "tips_before_start": [
    "Quick tip 1 for this interview type",
    "Quick tip 2"
  ]
}

Make questions realistic for Indian ${interviewType.name} interviews. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.6 });
};

/**
 * Evaluate an answer and generate follow-up
 */
const evaluateAnswer = async (type, question, answer, questionHistory = []) => {
  const interviewType = INTERVIEW_TYPES[type];

  const historyText = questionHistory.length > 0
    ? `\nPrevious Q&A:\n${questionHistory.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n')}`
    : '';

  const prompt = `You are an interview evaluator for: ${interviewType?.name || type}

Current question: "${question}"
Candidate's answer: "${answer}"
${historyText}

Evaluate the answer and generate a follow-up question.

Return ONLY JSON:
{
  "score": 1-10,
  "feedback": {
    "strengths": ["What was good about this answer (1-2 points)"],
    "improvements": ["What could be better (1-2 points)"],
    "ideal_answer_summary": "What an ideal answer would include (2-3 sentences)"
  },
  "body_language_tip": "A body language or communication tip",
  "follow_up_question": {
    "question": "Natural follow-up based on their answer",
    "category": "follow_up",
    "difficulty": "medium|hard",
    "ideal_answer_points": ["Point 1", "Point 2"]
  },
  "is_interview_complete": false
}

Be encouraging but honest. Score fairly. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.5 });
};

/**
 * Generate final interview report
 */
const generateReport = async (type, questionHistory) => {
  const interviewType = INTERVIEW_TYPES[type];

  const qaSummary = questionHistory.map((h, i) =>
    `Q${i + 1}: ${h.question}\nA: ${h.answer}\nScore: ${h.score || 'N/A'}/10`
  ).join('\n\n');

  const prompt = `Generate a detailed mock interview performance report.

Interview type: ${interviewType?.name || type}

Questions and Answers:
${qaSummary}

Return ONLY JSON:
{
  "overall_score": 1-100,
  "grade": "A+|A|B+|B|C+|C|D",
  "summary": "2-3 sentence overall assessment",
  "category_scores": {
    "communication": 1-10,
    "knowledge": 1-10,
    "confidence": 1-10,
    "structure": 1-10,
    "relevance": 1-10
  },
  "top_strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areas_to_improve": ["Area 1 with specific advice", "Area 2", "Area 3"],
  "recommended_topics_to_study": ["Topic 1", "Topic 2", "Topic 3"],
  "books_resources": ["Resource 1", "Resource 2"],
  "next_steps": ["Action 1", "Action 2", "Action 3"],
  "motivational_note": "Encouraging closing message (2 sentences)"
}

Be constructive, specific, India-focused. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.4 });
};

module.exports = { INTERVIEW_TYPES, startInterview, evaluateAnswer, generateReport };
