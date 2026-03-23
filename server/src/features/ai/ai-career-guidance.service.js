const gemini = require('../../services/gemini.service');

const streamGuidance = async (stream, interests, currentClass) => {
  const prompt = `You are an expert Indian career counselor. A student in Class ${currentClass || '10'} is considering: ${stream}
${interests ? 'Their interests: ' + interests : ''}

Provide comprehensive guidance as JSON:
{
  "stream": "${stream}",
  "overview": "2-3 sentence overview",
  "subjects": ["List of main subjects"],
  "career_paths": [
    { "career": "Career Name", "avg_salary": "₹X-Y LPA", "demand": "high/medium/low", "description": "1 line" }
  ],
  "top_exams": [
    { "exam": "Exam Name", "purpose": "What it's for", "difficulty": "easy/medium/hard" }
  ],
  "pros": ["Advantage 1", "Advantage 2"],
  "cons": ["Challenge 1", "Challenge 2"],
  "best_for": "Type of student this is best for",
  "famous_alumni": ["Famous person 1 - role", "Famous person 2 - role"],
  "future_scope": "2-3 sentences about future prospects in India",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Be specific to the Indian education system. Include salary ranges in INR.`;

  return gemini.generateJSON(prompt, { temperature: 0.5 });
};

const compareStreams = async (stream1, stream2, interests) => {
  const prompt = `You are an expert Indian career counselor. Compare these two academic streams:
Stream 1: ${stream1}
Stream 2: ${stream2}
${interests ? 'Student interests: ' + interests : ''}

Return as JSON:
{
  "stream1": { "name": "${stream1}", "score": 0-100, "strengths": ["..."], "careers_count": X },
  "stream2": { "name": "${stream2}", "score": 0-100, "strengths": ["..."], "careers_count": X },
  "comparison": [
    { "factor": "Job Opportunities", "stream1_rating": 1-5, "stream2_rating": 1-5 },
    { "factor": "Salary Potential", "stream1_rating": 1-5, "stream2_rating": 1-5 },
    { "factor": "Future Growth", "stream1_rating": 1-5, "stream2_rating": 1-5 },
    { "factor": "Study Difficulty", "stream1_rating": 1-5, "stream2_rating": 1-5 },
    { "factor": "Creative Freedom", "stream1_rating": 1-5, "stream2_rating": 1-5 }
  ],
  "recommendation": "2-3 sentences of personalized advice",
  "common_misconceptions": ["Myth 1 - Truth", "Myth 2 - Truth"]
}`;

  return gemini.generateJSON(prompt, { temperature: 0.5 });
};

const careerChat = async (history, message) => {
  const systemPrompt = `You are Syllabrix Career Buddy — a friendly, expert career counselor for Indian students (ages 13-18). You help students choose between streams (PCM, PCB, Commerce, Arts/Humanities), understand career options, and make informed decisions. Be encouraging, specific to India, mention salary ranges in INR, mention relevant Indian exams (JEE, NEET, CA, CLAT, NID, NIFT etc.), and always be positive. Keep responses concise (under 200 words). If a student seems confused, ask one clarifying question.`;

  return gemini.chat(history, message, systemPrompt);
};

module.exports = { streamGuidance, compareStreams, careerChat };
