const gemini = require('../../services/gemini.service');

const clearDoubt = async (question, context) => {
  const prompt = `You are Syllabrix AI Tutor — a patient, clear, and encouraging teacher for Indian students.

Student's question: "${question}"
${context ? 'Context/Subject: ' + context : ''}

Provide a clear, educational answer. Rules:
- Use simple language appropriate for students
- Give examples from Indian context when possible
- If it's a concept, explain step by step
- If it's a math problem, show the solution
- If it's a doubt about career/exam, give specific Indian guidance
- Keep it under 300 words
- Be encouraging and positive
- End with a quick tip or interesting fact related to the topic`;

  return gemini.generateText(prompt, { temperature: 0.6 });
};

const doubtChat = async (history, message, subject) => {
  const systemPrompt = `You are Syllabrix AI Tutor — a friendly, patient tutor who helps Indian students with their studies. You explain concepts clearly with examples. Subject focus: ${subject || 'General'}. Keep responses concise (under 200 words). Use step-by-step explanations for problems. Be encouraging.`;

  return gemini.chat(history, message, systemPrompt);
};

module.exports = { clearDoubt, doubtChat };
