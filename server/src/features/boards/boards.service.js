const { generateText, generateJSON } = require('../../services/ai.service');

const BOARD_SYS = (cls, board) =>
  `You are an expert ${board} Class ${cls} school teacher with 15+ years experience. Generate content strictly aligned to the ${board} Class ${cls} syllabus. Language should be clear and appropriate for school students. Always return valid JSON only — no markdown fences, no extra text.`;

// ── STUDY NOTES ──────────────────────────────────────────────────────────────

exports.generateStudyNotes = async ({ subject, chapter, classLevel = 10, board = 'CBSE' }) => {
  const prompt = `${BOARD_SYS(classLevel, board)}

Generate comprehensive study notes for Class ${classLevel} ${subject}: "${chapter}"

Return this exact JSON structure (no extra keys):
{
  "overview": "2-3 paragraph chapter overview explaining what it's about and why it matters",
  "keyTopics": [
    { "topic": "Topic name", "explanation": "Clear 2-3 sentence explanation with a real example" }
  ],
  "formulas": [
    { "formula": "Formula or rule", "meaning": "What it means and when to apply it", "example": "Quick worked example" }
  ],
  "keyPoints": ["Bullet point 1 for quick revision", "Bullet point 2", "..."],
  "boardTips": ["CBSE exam tip 1 — what the board commonly asks", "Tip 2", "..."],
  "commonMistakes": ["Mistake students make 1", "Mistake 2", "..."]
}

Provide at least 4 keyTopics, 8 keyPoints, 4 boardTips. If the chapter has no formulas, return an empty array.`;

  return generateJSON(prompt, { task: 'education', temperature: 0.4 });
};

// ── PRACTICE QUESTIONS ───────────────────────────────────────────────────────

const Q_PROMPTS = {
  mcq: (subject, chapter, cls, count, difficulty) => `
Generate ${count} Multiple Choice Questions (MCQ) for Class ${cls} ${subject}: "${chapter}".
Difficulty: ${difficulty}. Each question must have exactly 4 options (a, b, c, d) with ONE correct answer.
These should match CBSE board exam style.

Return JSON array:
[
  {
    "type": "mcq",
    "marks": 1,
    "question": "Question text",
    "options": { "a": "Option A", "b": "Option B", "c": "Option C", "d": "Option D" },
    "answer": "a",
    "explanation": "Why this is correct and others are wrong"
  }
]`,

  assertion_reason: (subject, chapter, cls, count) => `
Generate ${count} Assertion-Reason questions for Class ${cls} ${subject}: "${chapter}" in CBSE format.

Options are always:
A) Both Assertion and Reason are true and Reason is the correct explanation
B) Both Assertion and Reason are true but Reason is NOT the correct explanation
C) Assertion is true but Reason is false
D) Assertion is false but Reason is true

Return JSON array:
[
  {
    "type": "assertion_reason",
    "marks": 1,
    "assertion": "Assertion statement",
    "reason": "Reason statement",
    "answer": "A",
    "explanation": "Brief explanation"
  }
]`,

  very_short: (subject, chapter, cls, count) => `
Generate ${count} Very Short Answer questions (1-2 marks each) for Class ${cls} ${subject}: "${chapter}".
These are 1-2 sentence answers typical of CBSE Section B.

Return JSON array:
[
  {
    "type": "very_short",
    "marks": 2,
    "question": "Question text",
    "answer": "Model answer in 1-2 sentences",
    "keywords": ["key word 1", "key word 2"]
  }
]`,

  short_answer: (subject, chapter, cls, count) => `
Generate ${count} Short Answer questions (3 marks each) for Class ${cls} ${subject}: "${chapter}".
These require 3-5 sentence answers, typical of CBSE Section C.

Return JSON array:
[
  {
    "type": "short_answer",
    "marks": 3,
    "question": "Question text",
    "answer": "Model answer in 3-5 sentences covering all marking points",
    "markingScheme": ["Point 1 (1 mark)", "Point 2 (1 mark)", "Point 3 (1 mark)"]
  }
]`,

  long_answer: (subject, chapter, cls, count) => `
Generate ${count} Long Answer / Essay questions (5 marks each) for Class ${cls} ${subject}: "${chapter}".
These require detailed answers with diagrams mentioned where applicable. Typical of CBSE Section D/E.

Return JSON array:
[
  {
    "type": "long_answer",
    "marks": 5,
    "question": "Question text",
    "answer": "Complete model answer",
    "markingScheme": ["Point 1 (1 mark)", "Point 2 (1 mark)", "Point 3 (1 mark)", "Point 4 (1 mark)", "Point 5 (1 mark)"],
    "diagramRequired": false
  }
]`,

  case_based: (subject, chapter, cls, count) => `
Generate ${count} Case-Based / Source-Based Question (CBQ) sets for Class ${cls} ${subject}: "${chapter}".
Each set has a passage/scenario followed by 4 sub-questions (3 MCQ of 1 mark + 1 short answer of 2 marks).

Return JSON array:
[
  {
    "type": "case_based",
    "marks": 5,
    "passage": "A descriptive passage or scenario related to the chapter (3-5 sentences)",
    "questions": [
      { "q": "Sub-question 1", "type": "mcq", "options": {"a":"","b":"","c":"","d":""}, "answer": "a", "marks": 1 },
      { "q": "Sub-question 2", "type": "mcq", "options": {"a":"","b":"","c":"","d":""}, "answer": "b", "marks": 1 },
      { "q": "Sub-question 3", "type": "mcq", "options": {"a":"","b":"","c":"","d":""}, "answer": "c", "marks": 1 },
      { "q": "Sub-question 4 (short answer)", "type": "short", "answer": "Model answer", "marks": 2 }
    ]
  }
]`,

  fill_blanks: (subject, chapter, cls, count) => `
Generate ${count} Fill-in-the-Blank questions for Class ${cls} ${subject}: "${chapter}".

Return JSON array:
[
  {
    "type": "fill_blanks",
    "marks": 1,
    "question": "The ______ is the powerhouse of the cell.",
    "answer": "mitochondria",
    "hint": "Optional hint"
  }
]`,

  match_following: (subject, chapter, cls, count) => `
Generate ${count} Match the Following question sets for Class ${cls} ${subject}: "${chapter}".
Each set has 5 items in Column A matched to 5 in Column B.

Return JSON array:
[
  {
    "type": "match_following",
    "marks": 5,
    "instruction": "Match Column A with Column B",
    "columnA": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
    "columnB": ["Match B", "Match A", "Match E", "Match C", "Match D"],
    "correctMatch": {"1":"ii","2":"i","3":"v","4":"iii","5":"iv"}
  }
]`,

  true_false: (subject, chapter, cls, count) => `
Generate ${count} True/False questions for Class ${cls} ${subject}: "${chapter}".
Include a correction for false statements.

Return JSON array:
[
  {
    "type": "true_false",
    "marks": 1,
    "question": "Statement",
    "answer": true,
    "correction": null
  }
]`,
};

exports.generatePracticeQuestions = async ({ subject, chapter, classLevel = 10, board = 'CBSE', questionType, count = 5, difficulty = 'medium' }) => {
  const buildPrompt = Q_PROMPTS[questionType];
  if (!buildPrompt) throw new Error(`Unknown question type: ${questionType}`);

  const prompt = `${BOARD_SYS(classLevel, board)}\n${buildPrompt(subject, chapter, classLevel, count, difficulty)}`;
  const questions = await generateJSON(prompt, { task: 'education', temperature: 0.6, maxTokens: 6000 });
  return Array.isArray(questions) ? questions : (questions.questions || []);
};

// ── TEST PAPER GENERATOR ─────────────────────────────────────────────────────

exports.generateTestPaper = async ({ classLevel = 10, board = 'CBSE', subject, chapters, duration = 180, totalMarks = 80, questionConfig }) => {
  const chaptersStr = chapters.join(', ');

  // Default CBSE-style question distribution if not provided
  const config = questionConfig || {
    mcq: { count: 20, marks: 1 },
    assertion_reason: { count: 5, marks: 1 },
    very_short: { count: 5, marks: 2 },
    short_answer: { count: 7, marks: 3 },
    long_answer: { count: 3, marks: 5 },
    case_based: { count: 2, marks: 5 },
  };

  const prompt = `${BOARD_SYS(classLevel, board)}

Generate a complete ${board} Class ${classLevel} ${subject} question paper.
Chapters covered: ${chaptersStr}
Total marks: ${totalMarks} | Duration: ${duration} minutes

Question distribution:
${JSON.stringify(config, null, 2)}

Return this exact JSON:
{
  "title": "${board} Class ${classLevel} ${subject} Test",
  "subject": "${subject}",
  "classLevel": ${classLevel},
  "board": "${board}",
  "totalMarks": ${totalMarks},
  "duration": ${duration},
  "generalInstructions": ["All questions are compulsory", "Read each question carefully before answering", "Marks for each question are indicated in brackets"],
  "sections": [
    {
      "sectionLabel": "Section A",
      "sectionTitle": "Multiple Choice Questions",
      "instructions": "Choose the correct option. Each question carries 1 mark.",
      "questions": [
        { "qNo": 1, "type": "mcq", "marks": 1, "question": "...", "options": {"a":"","b":"","c":"","d":""}, "answer": "a" }
      ]
    },
    {
      "sectionLabel": "Section B",
      "sectionTitle": "Assertion-Reason Questions",
      "instructions": "Select the correct option from (A) to (D).",
      "questions": [...]
    },
    {
      "sectionLabel": "Section C",
      "sectionTitle": "Very Short Answer",
      "instructions": "Answer in 1-2 sentences. Each carries 2 marks.",
      "questions": [...]
    },
    {
      "sectionLabel": "Section D",
      "sectionTitle": "Short Answer",
      "instructions": "Answer in 3-5 sentences. Each carries 3 marks.",
      "questions": [...]
    },
    {
      "sectionLabel": "Section E",
      "sectionTitle": "Long Answer",
      "instructions": "Detailed answers. Each carries 5 marks.",
      "questions": [...]
    },
    {
      "sectionLabel": "Section F",
      "sectionTitle": "Case-Based Questions",
      "instructions": "Read the passage carefully and answer. Each CBQ carries 5 marks.",
      "questions": [...]
    }
  ],
  "answerKey": {}
}

Make every question unique and directly based on CBSE Class ${classLevel} ${subject} (${chaptersStr}).`;

  return generateJSON(prompt, { task: 'education', temperature: 0.5, maxTokens: 12000 });
};

// ── ANSWER SHEET CHECKER ─────────────────────────────────────────────────────

exports.checkAnswerSheet = async ({ imageBase64, imageMime = 'image/jpeg', questionPaper, subject, classLevel = 10, board = 'CBSE' }) => {
  const sys = `You are a strict but fair ${board} examiner checking a student's handwritten answer sheet for Class ${classLevel} ${subject}. Award marks fairly based on content, not handwriting. Always return valid JSON only.`;

  let parts = [];
  if (imageBase64) {
    const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    parts.push({ inlineData: { mimeType: imageMime, data: base64 } });
  }

  const paperContext = questionPaper
    ? `\n\nQuestion Paper provided:\n${JSON.stringify(questionPaper).slice(0, 3000)}`
    : '';

  parts.push({ text: `${sys}${paperContext}

Look at the handwritten answer sheet in the image. Identify each answer written and evaluate it.

Return this JSON:
{
  "evaluation": [
    {
      "questionNo": 1,
      "questionText": "What was written/visible as the question (or best guess)",
      "studentAnswer": "What the student wrote",
      "marksAwarded": 2,
      "maxMarks": 3,
      "feedback": "What was correct, what was missing, what could be improved"
    }
  ],
  "totalAwarded": 0,
  "totalPossible": 0,
  "percentage": 0,
  "overallFeedback": "General comment on the student's performance",
  "strengthAreas": ["Area where student did well"],
  "improvementAreas": ["Area needing improvement"]
}` });

  const { generateText } = require('../../services/ai.service');
  const raw = await generateText(parts, { task: 'reasoning', maxTokens: 4000 });

  // Parse JSON from response
  let cleaned = raw.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return { error: 'Could not parse evaluation', raw };
  }
};
