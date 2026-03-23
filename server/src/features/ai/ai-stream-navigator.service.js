const ai = require('../../services/ai.service');
const { pool } = require('../../database/connection');

/**
 * Run aptitude assessment — AI analyzes interests and suggests streams
 */
const runAptitudeAssessment = async (answers, options = {}) => {
  const { class_level, board } = options;

  const prompt = `You are an expert Indian career counselor conducting an aptitude assessment.

Student Profile:
- Class: ${class_level || 'Not specified'}
- Board: ${board || 'Not specified'}
- Assessment Answers: ${JSON.stringify(answers)}

Based on these responses, provide a comprehensive assessment:

Return ONLY JSON:
{
  "personality_type": "Analytical|Creative|Social|Practical|Investigative|Enterprising",
  "top_strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "recommended_streams": [
    {
      "stream": "PCM / PCB / Commerce / Arts / Vocational",
      "match_score": 85,
      "why": "2-3 sentences explaining why this matches",
      "top_careers": ["Career 1", "Career 2", "Career 3"],
      "key_exam": "JEE / NEET / CA / CLAT / NID / etc."
    }
  ],
  "interest_map": {
    "science": 0-100,
    "mathematics": 0-100,
    "languages": 0-100,
    "social_studies": 0-100,
    "arts_creative": 0-100,
    "technology": 0-100,
    "business": 0-100,
    "healthcare": 0-100
  },
  "learning_style": "Visual|Auditory|Reading|Kinesthetic",
  "advice": "3-4 sentences of personalized advice",
  "next_steps": ["Actionable step 1", "Step 2", "Step 3"]
}

Be specific to Indian education system. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.5 });
};

/**
 * Get aptitude questions
 */
const getAptitudeQuestions = () => {
  return [
    {
      id: 1,
      question: "When you have free time, you usually prefer to:",
      options: [
        { value: "experiment", label: "Conduct experiments or build something" },
        { value: "read", label: "Read books, articles or watch documentaries" },
        { value: "create", label: "Draw, write stories, or make music" },
        { value: "socialize", label: "Help others or organize activities" },
        { value: "calculate", label: "Solve puzzles, play chess, or code" },
      ],
    },
    {
      id: 2,
      question: "Which school subject do you enjoy the most?",
      options: [
        { value: "math", label: "Mathematics" },
        { value: "science", label: "Science (Physics/Chemistry/Biology)" },
        { value: "english", label: "English / Languages" },
        { value: "social", label: "History / Geography / Civics" },
        { value: "computer", label: "Computer Science / IT" },
        { value: "arts", label: "Art / Music / Physical Education" },
      ],
    },
    {
      id: 3,
      question: "If you could shadow any professional for a day, who would it be?",
      options: [
        { value: "doctor", label: "Doctor or Surgeon" },
        { value: "engineer", label: "Engineer or Scientist" },
        { value: "business", label: "CEO or Entrepreneur" },
        { value: "lawyer", label: "Lawyer or Judge" },
        { value: "artist", label: "Film Director, Designer, or Author" },
        { value: "teacher", label: "Professor or Researcher" },
      ],
    },
    {
      id: 4,
      question: "How do you prefer to learn new things?",
      options: [
        { value: "visual", label: "Watching videos and diagrams" },
        { value: "reading", label: "Reading textbooks and notes" },
        { value: "hands_on", label: "Doing experiments and projects" },
        { value: "discussion", label: "Group discussions and debates" },
        { value: "practice", label: "Solving problems repeatedly" },
      ],
    },
    {
      id: 5,
      question: "What matters most to you in a future career?",
      options: [
        { value: "salary", label: "High salary and financial security" },
        { value: "impact", label: "Making a positive impact on society" },
        { value: "creativity", label: "Creative freedom and self-expression" },
        { value: "prestige", label: "Respect and recognition" },
        { value: "freedom", label: "Work-life balance and flexibility" },
        { value: "growth", label: "Continuous learning and growth" },
      ],
    },
    {
      id: 6,
      question: "When faced with a group project, you naturally:",
      options: [
        { value: "lead", label: "Take charge and organize the team" },
        { value: "research", label: "Do the research and analysis" },
        { value: "create", label: "Handle the creative/presentation part" },
        { value: "execute", label: "Do the hands-on work" },
        { value: "mediate", label: "Keep everyone motivated and on track" },
      ],
    },
    {
      id: 7,
      question: "Which type of news/content interests you most?",
      options: [
        { value: "tech", label: "Technology and gadgets" },
        { value: "politics", label: "Politics and current affairs" },
        { value: "science", label: "Scientific discoveries" },
        { value: "business", label: "Business and startups" },
        { value: "sports", label: "Sports and fitness" },
        { value: "entertainment", label: "Entertainment and culture" },
      ],
    },
    {
      id: 8,
      question: "Your parents want you to become a doctor, but you love coding. What do you do?",
      options: [
        { value: "follow_parents", label: "Follow their advice — they know best" },
        { value: "discuss", label: "Have an open conversation and find a middle ground" },
        { value: "rebel", label: "Follow your passion regardless" },
        { value: "explore", label: "Research both fields deeply before deciding" },
        { value: "combine", label: "Look for a career combining both (like health-tech)" },
      ],
    },
  ];
};

/**
 * Generate parent-child alignment report
 */
const generateAlignmentReport = async (studentData, parentData) => {
  const prompt = `You are a career counselor creating a parent-child career alignment report.

Student's Assessment:
- Interests: ${JSON.stringify(studentData.interests || studentData)}
- Dream career: ${studentData.dream_career || 'Not specified'}
- Preferred stream: ${studentData.preferred_stream || 'Not decided'}

Parent's Input:
- Preferred stream for child: ${parentData.preferred_stream || 'Not specified'}
- Career expectations: ${parentData.career_expectation || 'Not specified'}
- Concerns: ${parentData.concerns || 'None specified'}

Generate an alignment report:

Return ONLY JSON:
{
  "alignment_score": 0-100,
  "alignment_level": "High|Medium|Low",
  "student_profile_summary": "2 sentences about what the student naturally gravitates toward",
  "parent_expectations_summary": "2 sentences about what the parent envisions",
  "common_ground": ["Shared value or interest 1", "Shared value 2"],
  "gaps": [
    { "area": "What differs", "student_view": "...", "parent_view": "...", "resolution": "How to bridge this" }
  ],
  "recommended_path": {
    "stream": "Best stream considering both perspectives",
    "careers": ["Career that satisfies both", "Alternative 1", "Alternative 2"],
    "reasoning": "3-4 sentences explaining why this path works for both"
  },
  "conversation_starters": [
    "Question parent and student should discuss together 1",
    "Question 2",
    "Question 3"
  ],
  "action_plan": [
    { "step": 1, "action": "What to do next", "who": "Student|Parent|Both", "timeline": "This week|This month" }
  ],
  "reassurance_for_parent": "2-3 sentences addressing common parental concerns with data",
  "motivation_for_student": "2-3 sentences encouraging the student"
}

Be empathetic, practical, India-specific. Use salary data in INR. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.5 });
};

/**
 * Generate a full career roadmap for a specific stream/career
 */
const generateCareerRoadmap = async (career, options = {}) => {
  const { class_level, stream } = options;

  const prompt = `Generate a detailed career roadmap to become a: "${career}" in India.
${class_level ? `Current class: ${class_level}` : ''}
${stream ? `Current stream: ${stream}` : ''}

Return ONLY JSON:
{
  "career": "${career}",
  "overview": "2-3 sentence description of this career",
  "timeline": [
    { "phase": "Class 11-12", "focus": "What to study and prepare", "key_actions": ["Action 1", "Action 2"] },
    { "phase": "Entrance Exam", "focus": "Which exam, when, how to prepare", "key_actions": ["Action 1"] },
    { "phase": "College/University", "focus": "Best colleges, course details", "key_actions": ["Action 1"] },
    { "phase": "Early Career", "focus": "First job, internships", "key_actions": ["Action 1"] },
    { "phase": "Growth", "focus": "5-10 year plan", "key_actions": ["Action 1"] }
  ],
  "key_exams": [
    { "name": "JEE Main", "when": "Class 12", "difficulty": "hard", "preparation_months": 24 }
  ],
  "top_colleges": ["College 1 — City", "College 2 — City", "College 3 — City"],
  "salary_progression": {
    "entry": "₹X-Y LPA",
    "mid": "₹X-Y LPA",
    "senior": "₹X-Y LPA",
    "top": "₹X-Y LPA"
  },
  "skills_needed": ["Skill 1", "Skill 2", "Skill 3"],
  "books_resources": ["Book/Resource 1", "Book/Resource 2"],
  "pro_tip": "One insider tip from someone in this field"
}

Be accurate with Indian data — colleges, exams, salaries in INR. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.5 });
};

module.exports = {
  runAptitudeAssessment,
  getAptitudeQuestions,
  generateAlignmentReport,
  generateCareerRoadmap,
};
