const ai = require('../../services/ai.service');

/**
 * Available lab subjects and their experiment categories
 */
const LAB_SUBJECTS = {
  chemistry: {
    name: 'Chemistry Lab', emoji: '🧪', color: '#7C3AED',
    categories: ['Acid-Base Reactions', 'Titration', 'pH Testing', 'Electrolysis', 'Precipitation', 'Gas Collection', 'Organic Chemistry', 'Salt Analysis'],
  },
  physics: {
    name: 'Physics Lab', emoji: '⚡', color: '#2563EB',
    categories: ['Circuit Builder', 'Pendulum', 'Projectile Motion', "Ohm's Law", 'Lenses & Mirrors', 'Magnetism', 'Wave Motion', 'Friction'],
  },
  biology: {
    name: 'Biology Lab', emoji: '🧬', color: '#059669',
    categories: ['Virtual Microscope', 'DNA Structure', 'Human Body Explorer', 'Plant Cell', 'Animal Cell', 'Photosynthesis', 'Blood Typing', 'Ecosystem'],
  },
  math: {
    name: 'Math Lab', emoji: '📐', color: '#D97706',
    categories: ['Graph Plotter', 'Geometry Sandbox', 'Algebra Visualizer', 'Trigonometry', 'Probability', 'Statistics', 'Calculus Basics', 'Number Theory'],
  },
};

/**
 * Generate an interactive experiment
 */
const generateExperiment = async (subject, experiment, options = {}) => {
  const { class_level, difficulty = 'medium' } = options;

  const prompt = `You are a virtual science/math lab instructor for Indian students.

Generate a detailed interactive experiment simulation:
Subject: ${subject}
Experiment: ${experiment}
${class_level ? `Class Level: ${class_level}` : ''}
Difficulty: ${difficulty}

Return ONLY JSON:
{
  "title": "${experiment}",
  "subject": "${subject}",
  "objective": "What the student will learn (1-2 sentences)",
  "theory": "Brief theory explanation (3-4 sentences, simple language for students)",
  "materials": ["Material 1", "Material 2", "Material 3"],
  "safety_notes": ["Safety precaution 1", "Safety precaution 2"],
  "steps": [
    {
      "step_number": 1,
      "instruction": "Clear instruction for this step",
      "action": "What physically happens (for animation hint)",
      "observation": "What the student should observe",
      "explanation": "Why this happens (scientific reason)"
    }
  ],
  "interactive_elements": [
    {
      "type": "slider|dropdown|input|toggle",
      "label": "Variable to control (e.g. Temperature, Concentration)",
      "min": 0, "max": 100, "default": 50, "unit": "°C",
      "effect": "How changing this affects the experiment"
    }
  ],
  "expected_results": {
    "observation": "What the final result looks like",
    "measurement": "Expected numerical value/range",
    "conclusion": "Scientific conclusion from this experiment"
  },
  "formula": "Relevant formula (if any, in plain text)",
  "diagram_hint": {
    "type": "apparatus|graph|molecule|circuit",
    "elements": ["Element 1", "Element 2"],
    "connections": "How elements connect"
  },
  "quiz_questions": [
    { "question": "Test question about this experiment", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why" }
  ],
  "real_world_application": "Where is this concept used in real life? (1-2 sentences)",
  "ncert_reference": "Which NCERT chapter/class this relates to",
  "difficulty": "${difficulty}",
  "estimated_time_minutes": 10
}

Be scientifically accurate. Steps should feel like a real lab experience. Include 4-6 steps and 2-3 interactive elements. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.4, maxTokens: 4000 });
};

/**
 * Get list of experiments for a subject
 */
const getExperiments = async (subject, classLevel) => {
  const subj = LAB_SUBJECTS[subject];
  if (!subj) throw new Error('Invalid subject');

  const prompt = `List 8-10 interesting ${subj.name} experiments suitable for ${classLevel ? `Class ${classLevel}` : 'high school'} Indian students.

Return ONLY JSON array:
[
  {
    "name": "Experiment Name",
    "description": "1-line what students will do",
    "category": "${subj.categories.slice(0, 4).join('|')}",
    "difficulty": "easy|medium|hard",
    "class_range": "8-10|11-12|all",
    "key_concept": "Main concept covered",
    "estimated_minutes": 10
  }
]

Include experiments from NCERT syllabus. Make them practical and engaging. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.5 });
};

/**
 * Generate a quick experiment visualization description
 */
const getVisualization = async (experiment, step) => {
  const prompt = `Describe a simple SVG/canvas visualization for this experiment step:
Experiment: ${experiment}
Step: ${step}

Return ONLY JSON:
{
  "svg_elements": [
    { "type": "rect|circle|line|text|path", "props": { "x": 0, "y": 0, "width": 100, "height": 50, "fill": "#color" }, "label": "What this represents" }
  ],
  "animation": "Brief description of what should animate",
  "color_scheme": ["#color1", "#color2", "#color3"]
}
ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.4 });
};

module.exports = { LAB_SUBJECTS, generateExperiment, getExperiments, getVisualization };
