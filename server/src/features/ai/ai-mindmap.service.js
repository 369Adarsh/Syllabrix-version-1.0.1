const ai = require('../../services/ai.service');
const { pool } = require('../../database/connection');

// ═══════════════════════════════════════════════════════════
//  SUBJECT LISTS — real Indian curriculum structure
// ═══════════════════════════════════════════════════════════
const SUBJECTS_BY_CLASS = {
  '6': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Computer Science'],
  '7': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Computer Science'],
  '8': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Computer Science'],
  '9': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Information Technology'],
  '10': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Information Technology'],
  '11': ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Geography', 'Political Science', 'English', 'Psychology', 'Sociology'],
  '12': ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Geography', 'Political Science', 'English', 'Psychology', 'Sociology'],
};

/**
 * Get subjects for a class
 */
const getSubjects = (classLevel) => {
  return SUBJECTS_BY_CLASS[classLevel] || SUBJECTS_BY_CLASS['10'];
};

/**
 * Get chapters for a class + board + subject — AI generates real curriculum
 * Cached in ai_content_cache table for 30 days
 */
const getChapters = async (classLevel, board, subject) => {
  const cacheKey = `chapters|${classLevel}|${board}|${subject}`;

  // Check cache
  try {
    const [cached] = await pool.query(
      `SELECT content_json FROM ai_content_cache WHERE cache_key = ? AND expires_at > NOW() LIMIT 1`,
      [cacheKey]
    );
    if (cached.length > 0) {
      return typeof cached[0].content_json === 'string'
        ? JSON.parse(cached[0].content_json)
        : cached[0].content_json;
    }
  } catch (e) {
    console.log('[Curriculum] Cache miss for chapters');
  }

  const prompt = `List ALL chapters from the LATEST ${board || 'CBSE'} curriculum for Class ${classLevel} ${subject}.

Return ONLY a JSON array of objects:
[
  { "number": 1, "name": "Chapter Name", "description": "One line summary" },
  { "number": 2, "name": "Chapter Name", "description": "One line summary" }
]

Rules:
- Use the REAL, CURRENT ${board || 'CBSE'} ${new Date().getFullYear()} syllabus — not outdated or made-up chapters
- Include ALL chapters from the official textbook (NCERT for CBSE)
- Chapter names must match the official textbook exactly
- "description" should be 1 sentence summarizing what the chapter covers
- Order by chapter number as they appear in the textbook
- ONLY valid JSON array, no text before/after`;

  const chapters = await ai.generateJSON(prompt, { temperature: 0.2 });

  // Cache for 30 days
  try {
    await pool.query(
      `INSERT INTO ai_content_cache (cache_key, content_json, content_type, expires_at) VALUES (?, ?, 'curriculum_chapters', DATE_ADD(NOW(), INTERVAL 30 DAY)) ON DUPLICATE KEY UPDATE content_json = VALUES(content_json), expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY)`,
      [cacheKey, JSON.stringify(chapters)]
    );
  } catch (e) {
    console.log('[Curriculum] Failed to cache chapters:', e.message);
  }

  return chapters;
};

/**
 * Get topics for a specific chapter — AI extracts topic list
 * Cached in ai_content_cache for 30 days
 */
const getTopics = async (classLevel, board, subject, chapter) => {
  const cacheKey = `topics|${classLevel}|${board}|${subject}|${chapter}`;

  // Check cache
  try {
    const [cached] = await pool.query(
      `SELECT content_json FROM ai_content_cache WHERE cache_key = ? AND expires_at > NOW() LIMIT 1`,
      [cacheKey]
    );
    if (cached.length > 0) {
      return typeof cached[0].content_json === 'string'
        ? JSON.parse(cached[0].content_json)
        : cached[0].content_json;
    }
  } catch (e) {
    console.log('[Curriculum] Cache miss for topics');
  }

  const prompt = `List ALL topics and subtopics covered in "${chapter}" from ${board || 'CBSE'} Class ${classLevel} ${subject}.

Return ONLY a JSON array:
[
  { "name": "Topic Name", "description": "What this topic covers", "difficulty": "easy|medium|hard", "exam_weight": "low|medium|high" },
  { "name": "Sub Topic Name", "description": "What this covers", "difficulty": "medium", "exam_weight": "high" }
]

Rules:
- Use the REAL content from the NCERT/${board} textbook for this chapter
- Include every topic and sub-topic students need to study
- "difficulty" rates how hard students typically find this topic
- "exam_weight" rates how frequently this appears in exams
- Order from first topic in chapter to last
- Be thorough — miss nothing that could appear in an exam
- ONLY valid JSON`;

  const topics = await ai.generateJSON(prompt, { temperature: 0.2 });

  // Cache for 30 days
  try {
    await pool.query(
      `INSERT INTO ai_content_cache (cache_key, content_json, content_type, expires_at) VALUES (?, ?, 'curriculum_topics', DATE_ADD(NOW(), INTERVAL 30 DAY)) ON DUPLICATE KEY UPDATE content_json = VALUES(content_json), expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY)`,
      [cacheKey, JSON.stringify(topics)]
    );
  } catch (e) {
    console.log('[Curriculum] Failed to cache topics:', e.message);
  }

  return topics;
};

/**
 * Generate a FLOWCHART — step-by-step concept understanding
 * Returns linear nodes with connections for top-to-bottom rendering
 */
const generateFlowchart = async (topic, options = {}) => {
  const { class_level, board, subject, goal } = options;

  let context = '';
  if (class_level) context += `For class ${class_level} student. `;
  if (board) context += `${board} board. `;
  if (subject) context += `Subject: ${subject}. `;
  if (goal === 'exam') context += 'Focus on exam-important flow. ';

  const prompt = `Create a FLOWCHART that explains the concept: "${topic}" step by step.
${context}

Return ONLY a JSON object:
{
  "title": "${topic}",
  "description": "One line about what this flowchart explains",
  "nodes": [
    {
      "id": "1",
      "type": "start",
      "label": "Starting Point / Prerequisites",
      "detail": "Brief explanation of what you need to know before this",
      "color": "#3B82F6"
    },
    {
      "id": "2",
      "type": "process",
      "label": "Step or Concept Name",
      "detail": "Clear 1-2 sentence explanation",
      "color": "#8B5CF6"
    },
    {
      "id": "3",
      "type": "decision",
      "label": "Decision or Branch Point",
      "detail": "When does this split?",
      "color": "#F59E0B",
      "branches": [
        { "label": "Yes / Path A", "target": "4" },
        { "label": "No / Path B", "target": "5" }
      ]
    },
    {
      "id": "4",
      "type": "process",
      "label": "Next step",
      "detail": "Explanation",
      "color": "#10B981"
    },
    {
      "id": "5",
      "type": "end",
      "label": "Final Result / Summary",
      "detail": "What the student should now understand",
      "color": "#EF4444"
    }
  ],
  "connections": [
    { "from": "1", "to": "2", "label": "" },
    { "from": "2", "to": "3", "label": "" },
    { "from": "3", "to": "4", "label": "Yes" },
    { "from": "3", "to": "5", "label": "No" }
  ],
  "key_insight": "One memorable takeaway from this flowchart"
}

Rules:
- 6-12 nodes (not too few, not too many)
- Node types: "start", "process", "decision", "end", "formula", "example"
- Include at least 1 decision node if the concept has branching logic
- "detail" should be educational — explain WHY, not just WHAT
- Use DIFFERENT colors for different node types
- Connections define the flow — must be sequential and logical
- Include formulas/equations where relevant (use plain text, not LaTeX)
- ONLY valid JSON`;

  return ai.generateJSON(prompt, { temperature: 0.5 });
};

/**
 * Explain a doubt with a diagram — for the "Ask a Doubt" feature
 * Returns explanation + diagram data (nodes/edges for visual rendering)
 */
const explainWithDiagram = async (question, options = {}) => {
  const { class_level, board, subject, chapter } = options;

  let context = '';
  if (class_level) context += `Student is in class ${class_level}. `;
  if (board) context += `${board} board curriculum. `;
  if (subject) context += `Subject: ${subject}. `;
  if (chapter) context += `Chapter: ${chapter}. `;

  const prompt = `A student asks: "${question}"
${context}

Provide a CLEAR explanation WITH a concept diagram to help them understand visually.

Return ONLY a JSON object:
{
  "answer": "Clear, student-friendly explanation in 3-5 sentences. Use simple language.",
  "steps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "diagram": {
    "type": "concept",
    "title": "Visual: ${question}",
    "elements": [
      { "id": "1", "label": "Central Concept", "type": "box", "color": "#4F46E5", "x": 0, "y": 0 },
      { "id": "2", "label": "Related Part 1", "type": "box", "color": "#8B5CF6", "x": -1, "y": 1 },
      { "id": "3", "label": "Related Part 2", "type": "box", "color": "#EC4899", "x": 1, "y": 1 },
      { "id": "4", "label": "Detail", "type": "circle", "color": "#10B981", "x": -1, "y": 2 }
    ],
    "arrows": [
      { "from": "1", "to": "2", "label": "leads to" },
      { "from": "1", "to": "3", "label": "causes" },
      { "from": "2", "to": "4", "label": "results in" }
    ]
  },
  "formula": "Any relevant formula (null if none)",
  "real_world_example": "A relatable real-life example to make it click",
  "exam_tip": "Quick tip for remembering this in exams"
}

Rules:
- Explanation must be accurate and age-appropriate
- Diagram should have 4-8 elements — enough to show relationships, not overwhelming
- Element positions (x, y) use a grid: x from -2 to 2, y from 0 to 4 (top to bottom)
- Arrow labels should describe the RELATIONSHIP between elements
- Include a formula only if relevant (math/science)
- Real-world example must be relatable to Indian students
- ONLY valid JSON`;

  return ai.generateJSON(prompt, { temperature: 0.5 });
};

/**
 * Generate a mind map — checks cache first, then AI generates + saves
 */
const generateMindMap = async (topic, depth = 3, options = {}) => {
  const { class_level, board, goal, subject, chapter, userId } = options;

  // Check cache first (same topic + class + board within 24h)
  try {
    const [cached] = await pool.query(
      `SELECT * FROM ai_mind_maps WHERE topic = ? AND IFNULL(class_level,'') = ? AND IFNULL(board,'') = ? AND IFNULL(goal,'understand') = ? AND generated_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) ORDER BY generated_at DESC LIMIT 1`,
      [topic, class_level || '', board || '', goal || 'understand']
    );
    if (cached.length > 0) {
      await pool.query('UPDATE ai_mind_maps SET access_count = access_count + 1, last_accessed_at = NOW() WHERE id = ?', [cached[0].id]);
      return {
        tree: typeof cached[0].tree_json === 'string' ? JSON.parse(cached[0].tree_json) : cached[0].tree_json,
        cached: true,
      };
    }
  } catch (e) {
    console.log('[MindMap] Cache miss, generating fresh');
  }

  // Build context-aware prompt
  let contextLine = '';
  if (class_level) contextLine += `For class ${class_level} student. `;
  if (board) contextLine += `Following ${board} board curriculum. `;
  if (subject) contextLine += `Subject: ${subject}. `;
  if (chapter) contextLine += `Chapter: ${chapter}. `;
  if (goal === 'exam') contextLine += 'Focus on exam-relevant points, important for questions. ';
  else if (goal === 'revision') contextLine += 'Focus on key facts for quick revision. Keep it concise. ';
  else if (goal === 'project') contextLine += 'Focus on practical/research aspects useful for a project. ';
  else contextLine += 'Focus on deep conceptual understanding. ';

  const prompt = `Create a detailed mind map for: "${topic}"
${contextLine}

Return ONLY a JSON object with this structure:
{
  "title": "${topic}",
  "color": "#4F46E5",
  "description": "Brief one-line description of the topic",
  "children": [
    {
      "title": "Sub Topic 1",
      "color": "#7C3AED",
      "description": "Brief description",
      "children": [
        { "title": "Detail 1a", "color": "#EC4899", "description": "Explanation" },
        { "title": "Detail 1b", "color": "#EC4899", "description": "Explanation" }
      ]
    }
  ]
}

Rules:
- Maximum ${Math.min(depth, 3)} levels deep (NOT more)
- 4-6 main branches from center
- Each branch has 2-4 sub-items
- Use DIFFERENT vibrant hex colors for each main branch
- Keep titles SHORT (2-5 words)
- Add brief "description" for each node (1 sentence)
- Make it educational, accurate, and ${goal === 'exam' ? 'exam-focused' : 'comprehensive'}
- ONLY valid JSON, no markdown, no backticks`;

  const tree = await ai.generateJSON(prompt, { temperature: 0.5 });

  // Save to database for caching
  try {
    await pool.query(
      `INSERT INTO ai_mind_maps (user_id, topic, class_level, board, goal, tree_json) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, topic, class_level || null, board || null, goal || 'understand', JSON.stringify(tree)]
    );
  } catch (e) {
    console.log('[MindMap] Failed to cache:', e.message);
  }

  return { tree };
};

/**
 * Generate study notes for a specific mind map node/topic
 */
const generateTopicNotes = async (topic, options = {}) => {
  const { class_level, board, parent_topic, subject } = options;

  let context = '';
  if (parent_topic) context += `This is a subtopic of "${parent_topic}". `;
  if (class_level) context += `For class ${class_level} student. `;
  if (board) context += `${board} board curriculum. `;
  if (subject) context += `Subject: ${subject}. `;

  const prompt = `Generate concise study notes for the topic: "${topic}"
${context}

Return ONLY a JSON object:
{
  "summary": "2-3 sentence overview of this topic",
  "points": [
    "Key point 1 — clear and exam-ready",
    "Key point 2 — with example if possible",
    "Key point 3",
    "Key point 4",
    "Key point 5"
  ],
  "key_terms": [
    { "term": "Important Term", "definition": "Clear definition" }
  ],
  "diagram_hint": "A brief description of a diagram that would help visualize this concept (e.g. 'Draw a cell with nucleus, mitochondria, etc.')",
  "formulas": [
    { "name": "Formula Name", "formula": "F = ma", "when_to_use": "When you know mass and acceleration" }
  ],
  "questions": [
    "Practice question 1?",
    "Practice question 2?",
    "Practice question 3?"
  ],
  "tip": "One helpful exam tip or memory trick"
}

Rules:
- 5-8 key points, each clear and concise
- 2-4 key terms with definitions
- Include formulas ONLY if the topic involves math/science (empty array otherwise)
- diagram_hint: describe what diagram a student should draw to remember this
- 3 practice questions (mix of easy and hard)
- Keep language simple for students
- Include Indian context/examples where relevant
- ONLY valid JSON`;

  return ai.generateJSON(prompt, { temperature: 0.5 });
};

module.exports = {
  getSubjects,
  getChapters,
  getTopics,
  generateMindMap,
  generateTopicNotes,
  generateFlowchart,
  explainWithDiagram,
};
