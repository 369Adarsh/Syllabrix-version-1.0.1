const ai = require('../../services/ai.service');

const DEBATE_CATEGORIES = [
  { id: 'current_affairs', name: 'Current Affairs', emoji: '📰', desc: 'Debate today\'s hot topics' },
  { id: 'technology', name: 'Technology', emoji: '💻', desc: 'AI, social media, privacy' },
  { id: 'education', name: 'Education', emoji: '📚', desc: 'NEP, online learning, exams' },
  { id: 'environment', name: 'Environment', emoji: '🌍', desc: 'Climate, sustainability' },
  { id: 'society', name: 'Society & Ethics', emoji: '⚖️', desc: 'Social issues, culture' },
  { id: 'economics', name: 'Economics', emoji: '💹', desc: 'Policy, trade, employment' },
  { id: 'science', name: 'Science & Health', emoji: '🔬', desc: 'Medical, research ethics' },
  { id: 'gd_practice', name: 'GD Topics', emoji: '🗣️', desc: 'Group discussion practice' },
];

/**
 * Generate a debate topic with both sides
 */
const generateTopic = async (category, options = {}) => {
  const { class_level, difficulty = 'medium' } = options;

  const prompt = `Generate a thought-provoking debate topic for Indian students.
Category: ${category || 'current_affairs'}
${class_level ? `Class: ${class_level}` : ''}
Difficulty: ${difficulty}

Return ONLY JSON:
{
  "topic": "Clear, debatable statement (e.g. 'Should AI replace teachers in classrooms?')",
  "category": "${category}",
  "context": "2-3 sentences of background to understand the topic",
  "side_for": {
    "label": "For / Yes / Agree",
    "key_arguments": [
      { "point": "Strong argument 1", "evidence": "Supporting fact or example", "counter_to_anticipate": "What the other side might say" },
      { "point": "Strong argument 2", "evidence": "...", "counter_to_anticipate": "..." },
      { "point": "Strong argument 3", "evidence": "...", "counter_to_anticipate": "..." }
    ],
    "opening_statement_hint": "How to start your argument (1 sentence template)"
  },
  "side_against": {
    "label": "Against / No / Disagree",
    "key_arguments": [
      { "point": "Strong argument 1", "evidence": "...", "counter_to_anticipate": "..." },
      { "point": "Strong argument 2", "evidence": "...", "counter_to_anticipate": "..." },
      { "point": "Strong argument 3", "evidence": "...", "counter_to_anticipate": "..." }
    ],
    "opening_statement_hint": "..."
  },
  "key_terms": ["Important term 1", "Term 2", "Term 3"],
  "related_topics": ["Related debate topic 1", "Related 2"],
  "difficulty": "${difficulty}",
  "exam_relevance": "Which exams test this topic (UPSC, GD, etc.)"
}

Use current Indian context. Be balanced — both sides should be equally strong. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.6 });
};

/**
 * AI debates against the student — responds to their argument
 */
const debateRespond = async (topic, studentSide, studentArgument, debateHistory = []) => {
  const aiSide = studentSide === 'for' ? 'against' : 'for';

  const historyText = debateHistory.length > 0
    ? `\nDebate so far:\n${debateHistory.map(h => `[${h.speaker}]: ${h.text}`).join('\n')}`
    : '';

  const prompt = `You are debating ${aiSide === 'for' ? 'FOR' : 'AGAINST'} the topic: "${topic}"

The student argues ${studentSide === 'for' ? 'FOR' : 'AGAINST'}: "${studentArgument}"
${historyText}

Respond with a counter-argument. Be respectful but firm.

Return ONLY JSON:
{
  "response": "Your 2-3 sentence counter-argument with evidence",
  "technique_used": "Rebuttal|Counter-example|Statistics|Analogy|Question",
  "strength_of_student_argument": 1-10,
  "feedback_on_student": "1 sentence of constructive feedback on their argument style",
  "suggested_comeback": "What the student could say to counter your point (coaching hint)",
  "round_complete": false
}

Be a fair debater. Acknowledge good points. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.6 });
};

/**
 * Evaluate entire debate and generate score
 */
const evaluateDebate = async (topic, studentSide, debateHistory) => {
  const summary = debateHistory.map(h => `[${h.speaker}]: ${h.text}`).join('\n');

  const prompt = `Evaluate this debate performance:

Topic: "${topic}"
Student's side: ${studentSide}

Debate transcript:
${summary}

Return ONLY JSON:
{
  "overall_score": 1-100,
  "grade": "A+|A|B+|B|C+|C|D",
  "scores": {
    "argument_quality": 1-10,
    "evidence_usage": 1-10,
    "rebuttal_skill": 1-10,
    "communication": 1-10,
    "critical_thinking": 1-10
  },
  "best_argument": "The student's strongest point in the debate",
  "weakest_point": "Where the student could have been stronger",
  "debate_tips": [
    "Specific improvement tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "vocabulary_suggestions": ["Word/phrase to use in future debates", "Another phrase"],
  "summary": "2-3 sentence overall assessment",
  "gd_readiness": "How ready is this student for a Group Discussion? (1 sentence)"
}

Be encouraging and constructive. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.4 });
};

/**
 * Get trending debate topics
 */
const getTrendingTopics = async () => {
  const prompt = `List 6 trending debate topics relevant to Indian students RIGHT NOW (March 2026).

Return ONLY JSON array:
[
  { "topic": "Debatable statement", "category": "current_affairs|technology|education|environment|society|economics", "hot": true, "exam_relevant": "UPSC|GD|Both" }
]
ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.6 });
};

module.exports = { DEBATE_CATEGORIES, generateTopic, debateRespond, evaluateDebate, getTrendingTopics };
