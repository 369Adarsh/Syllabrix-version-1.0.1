const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = (modelName = 'gemini-2.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Simple text generation
 */
const generateText = async (prompt, options = {}) => {
  const model = getModel(options.model);
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxTokens || 4096,
      topP: 0.9,
    },
  });
  return result.response.text();
};

/**
 * Generate JSON output — with robust cleaning
 */
const generateJSON = async (prompt, options = {}) => {
  const text = await generateText(
    prompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no backticks, no explanation.',
    options
  );
  // Clean and parse
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  // Handle edge case: sometimes model wraps in extra text
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }
  return JSON.parse(cleaned);
};

/**
 * Chat conversation
 */
const chat = async (history, newMessage, systemPrompt) => {
  const model = getModel();
  const chatSession = model.startChat({
    history: [
      ...(systemPrompt ? [{ role: 'user', parts: [{ text: systemPrompt }] }, { role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] }] : []),
      ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
    ],
  });
  const result = await chatSession.sendMessage(newMessage);
  return result.response.text();
};

module.exports = { generateText, generateJSON, chat, getModel };
