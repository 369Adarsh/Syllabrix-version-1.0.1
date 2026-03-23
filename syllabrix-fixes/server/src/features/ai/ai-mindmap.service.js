const gemini = require('../../services/gemini.service');

/**
 * Generate a GOAL-ORIENTED mind map (not infinite expansion)
 * Asks for context: class, board, goal — then generates purposeful topics
 */
const generateMindMap = async (topic, options = {}) => {
  const { class_level, board, goal, depth = 2, parent_context } = options;

  // Build context-aware prompt
  let contextInfo = '';
  if (class_level) contextInfo += `Student is in ${class_level}. `;
  if (board) contextInfo += `Education board: ${board}. `;
  if (parent_context && parent_context !== topic) contextInfo += `Parent topic: ${parent_context}. `;

  const goalInstructions = {
    exam_prep: 'Focus on exam-relevant subtopics, important questions, and high-weightage areas.',
    deep_understanding: 'Cover fundamental concepts, real-world applications, and interconnections.',
    quick_revision: 'List only the most critical points needed for a fast review.',
    project_research: 'Explore creative angles, related fields, and research directions.',
  };

  const goalText = goalInstructions[goal] || goalInstructions.deep_understanding;

  const prompt = `You are an expert Indian education tutor creating a structured study mind map.

Topic: "${topic}"
${contextInfo}
Goal: ${goalText}

Generate a structured mind map with EXACTLY ${depth} levels deep. NOT more.

Return as JSON with this structure:
{
  "title": "${topic}",
  "summary": "1-line description of this topic",
  "children": [
    {
      "title": "Sub Topic 1",
      "summary": "Brief 1-line description",
      "children": [
        { "title": "Detail Point 1", "summary": "1-line description" },
        { "title": "Detail Point 2", "summary": "1-line description" }
      ]
    }
  ]
}

Rules:
- Generate 4-6 main branches maximum (not 10+)
- Each branch has 2-4 sub-items maximum
- Keep titles SHORT (2-5 words)
- Include a "summary" for each node (1 short sentence)
- Make topics SPECIFIC and actionable for ${class_level || 'students'}
- ${board ? `Follow ${board} syllabus pattern` : 'Follow standard Indian curriculum'}
- DO NOT expand infinitely — be concise and purposeful
- Every node should be something a student can click and learn from`;

  return gemini.generateJSON(prompt, { temperature: 0.5 });
};

/**
 * Generate STUDY NOTES for a specific topic node
 * This is what makes the mind map actually useful
 */
const generateTopicNotes = async (topic, options = {}) => {
  const { class_level, board, goal, parent_context } = options;

  let contextInfo = '';
  if (class_level) contextInfo += `Student is in ${class_level}. `;
  if (board) contextInfo += `Education board: ${board}. `;
  if (parent_context) contextInfo += `This is a subtopic of: ${parent_context}. `;

  const prompt = `You are an expert Indian education tutor. Generate comprehensive study notes for:

Topic: "${topic}"
${contextInfo}

Return as JSON:
{
  "summary": "3-4 sentence overview of this topic",
  "key_concepts": [
    { "title": "Concept Name", "explanation": "Clear 2-3 sentence explanation suitable for ${class_level || 'students'}" }
  ],
  "important_points": [
    "Important point 1 (exam-relevant)",
    "Important point 2",
    "Important point 3",
    "Important point 4",
    "Important point 5"
  ],
  "youtube_links": [
    { "title": "Video title", "url": "https://youtube.com/watch?v=REAL_ID", "channel": "Channel name" }
  ],
  "practice_questions": [
    "Question 1 that could appear in exam",
    "Question 2",
    "Question 3"
  ],
  "mnemonics_or_tricks": "Any memory trick or shortcut for remembering this topic (if applicable)"
}

Rules:
- Make notes SPECIFIC to ${class_level || 'the student level'} ${board ? `and ${board} pattern` : ''}
- Include 3-5 key concepts with clear explanations
- Include 5-8 important points that are exam-relevant
- Suggest 2-3 REAL YouTube educational channels/videos (use well-known Indian edu channels like Khan Academy India, Vedantu, Unacademy, Physics Wallah, etc.)
- Include 3-5 practice questions that could appear in exams
- Keep language simple and student-friendly
- Be accurate — don't make up facts`;

  return gemini.generateJSON(prompt, { temperature: 0.5 });
};

module.exports = { generateMindMap, generateTopicNotes };
