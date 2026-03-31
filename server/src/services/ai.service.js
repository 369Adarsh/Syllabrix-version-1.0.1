const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const providers = {
  gemini: {
    name: 'Gemini',
    available: !!process.env.GEMINI_API_KEY,
    generate: async (prompt, opts) => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: opts.temperature || 0.7, maxOutputTokens: opts.maxTokens || 4096 },
      });
      return result.response.text();
    },
    chat: async (history, message, systemPrompt) => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const chatHistory = [];
      if (systemPrompt) {
        chatHistory.push({ role: 'user', parts: [{ text: systemPrompt }] });
        chatHistory.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
      }
      history.forEach(m => {
        const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
        chatHistory.push({ role, parts: [{ text: m.content }] });
      });
      const session = model.startChat({ history: chatHistory });
      const result = await session.sendMessage(message);
      return result.response.text();
    },
  },

  groq: {
    name: 'Groq',
    available: !!process.env.GROQ_API_KEY,
    generate: async (prompt, opts) => {
      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: opts.temperature || 0.7,
        max_tokens: opts.maxTokens || 4096,
      }, {
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      return res.data.choices[0].message.content;
    },
    chat: async (history, message, systemPrompt) => {
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      history.forEach(m => messages.push({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content }));
      messages.push({ role: 'user', content: message });
      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile', messages, temperature: 0.7, max_tokens: 2048,
      }, {
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      return res.data.choices[0].message.content;
    },
  },

  together: {
    name: 'Together',
    available: !!process.env.TOGETHER_API_KEY,
    generate: async (prompt, opts) => {
      const res = await axios.post('https://api.together.xyz/v1/chat/completions', {
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: opts.temperature || 0.7, max_tokens: opts.maxTokens || 4096,
      }, {
        headers: { 'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      return res.data.choices[0].message.content;
    },
    chat: async (history, message, systemPrompt) => {
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      history.forEach(m => messages.push({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content }));
      messages.push({ role: 'user', content: message });
      const res = await axios.post('https://api.together.xyz/v1/chat/completions', {
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', messages, temperature: 0.7, max_tokens: 2048,
      }, {
        headers: { 'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      return res.data.choices[0].message.content;
    },
  },

  cohere: {
    name: 'Cohere',
    available: !!process.env.COHERE_API_KEY,
    generate: async (prompt, opts) => {
      const res = await axios.post('https://api.cohere.com/v2/chat', {
        model: 'command-r-plus-08-2024',
        messages: [{ role: 'user', content: prompt }],
      }, {
        headers: { 'Authorization': `Bearer ${process.env.COHERE_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      const content = res.data.message?.content;
      if (Array.isArray(content)) return content.map(c => c.text || '').join('');
      return content?.text || res.data.text || JSON.stringify(res.data);
    },
    chat: async (history, message, systemPrompt) => {
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      history.forEach(m => messages.push({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content }));
      messages.push({ role: 'user', content: message });
      const res = await axios.post('https://api.cohere.com/v2/chat', {
        model: 'command-r-plus-08-2024', messages,
      }, {
        headers: { 'Authorization': `Bearer ${process.env.COHERE_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      const content = res.data.message?.content;
      if (Array.isArray(content)) return content.map(c => c.text || '').join('');
      return content?.text || res.data.text || '';
    },
  },
};

const TASK_PROFILES = {
  reasoning: ['gemini', 'cohere', 'groq', 'together'],
  coding:    ['gemini', 'cohere', 'groq', 'together'],
  fast:      ['groq', 'together', 'gemini', 'cohere'],
  json:      ['groq', 'together', 'gemini', 'cohere'],
  chat:      ['together', 'groq', 'cohere', 'gemini'],
  default:   ['gemini', 'groq', 'together', 'cohere']
};

const getProviderQueue = (task) => {
  const queue = TASK_PROFILES[task] || TASK_PROFILES.default;
  return queue.filter(name => providers[name] && providers[name].available);
};

const generateText = async (prompt, opts = {}) => {
  const queue = getProviderQueue(opts.task);
  if (queue.length === 0) throw new Error('No AI providers configured in env.');

  const errors = [];
  for (const name of queue) {
    const p = providers[name];
    try {
      console.log(`[AI] Trying ${p.name}...`);
      const result = await p.generate(prompt, opts);
      if (!result || result.trim().length < 5) throw new Error('Empty response');
      console.log(`[AI] ✓ ${p.name} succeeded (${result.length} chars)`);
      return result;
    } catch (e) {
      const msg = e.response?.data?.error?.message || e.message || 'Unknown error';
      console.log(`[AI] ✗ ${p.name} failed: ${msg.slice(0, 100)}`);
      errors.push(`${p.name}: ${msg.slice(0, 80)}`);
    }
  }
  throw new Error('All AI providers failed: ' + errors.join(' | '));
};

const generateJSON = async (prompt, opts = {}) => {
  const updatedOpts = { ...opts, task: opts.task || 'json' };
  const text = await generateText(
    prompt + '\n\nCRITICAL: Respond with ONLY valid JSON. No markdown backticks. No text before or after the JSON.',
    updatedOpts
  );
  let cleaned = text.trim();
  // Remove markdown fences
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  // Find JSON start
  const startObj = cleaned.indexOf('{');
  const startArr = cleaned.indexOf('[');
  let start = -1;
  if (startObj >= 0 && startArr >= 0) start = Math.min(startObj, startArr);
  else start = Math.max(startObj, startArr);
  if (start > 0) cleaned = cleaned.slice(start);
  // Find JSON end
  const lastObj = cleaned.lastIndexOf('}');
  const lastArr = cleaned.lastIndexOf(']');
  const end = Math.max(lastObj, lastArr);
  if (end > 0 && end < cleaned.length - 1) cleaned = cleaned.slice(0, end + 1);
  try {
    return JSON.parse(cleaned);
  } catch(e) {
    console.error('[AI JSON] Parse failed. Raw:', cleaned.slice(0, 200));
    throw new Error('Failed to parse AI response as JSON');
  }
};

const chat = async (history, message, systemPrompt, opts = {}) => {
  const queue = getProviderQueue(opts.task || 'chat');
  if (queue.length === 0) throw new Error('No AI providers available for chat.');

  const errors = [];
  for (const name of queue) {
    const p = providers[name];
    try {
      console.log(`[AI Chat] Trying ${p.name}...`);
      const result = await p.chat(history, message, systemPrompt);
      if (!result || result.trim().length < 5) throw new Error('Empty response');
      console.log(`[AI Chat] ✓ ${p.name} succeeded`);
      return result;
    } catch (e) {
      const msg = e.response?.data?.error?.message || e.message || 'Unknown';
      console.log(`[AI Chat] ✗ ${p.name} failed: ${msg.slice(0, 100)}`);
      errors.push(`${p.name}: ${msg.slice(0, 80)}`);
    }
  }
  throw new Error('All AI providers failed: ' + errors.join(' | '));
};

console.log('[AI] Default Queue:', TASK_PROFILES.default.filter(n => providers[n].available).map(n => providers[n].name).join(', ') || 'NONE');

module.exports = { generateText, generateJSON, chat };
