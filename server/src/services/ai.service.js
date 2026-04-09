const axios = require('axios');
const { getGeminiModel, getGeminiModelTierList } = require('../utils/gemini-utils');

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// Centralized state to track quota exhaustion across the entire service
let lastQuotaTime = 0;
const QUOTA_COOLING_MS = 45000; // 45s cooling to clear strict Gemini-experimental penalties

const providers = {
  gemini: {
    name: 'Gemini',
    available: !!process.env.GEMINI_API_KEY,
    generate: async (input, opts) => {
      const tierList = getGeminiModelTierList(opts.model);
      const parts = Array.isArray(input) ? input : [{ text: input }];
      let lastError;

      for (const modelId of tierList) {
        try {
          console.log(`[AI] Gemini: Trying version ${modelId}...`);
          const model = getGeminiModel(modelId);
          const result = await model.generateContent({
            contents: [{ role: 'user', parts }],
            generationConfig: { temperature: opts.temperature || 0.7, maxOutputTokens: opts.maxTokens || 4096 },
          });
          return result.response.text();
        } catch (e) {
          lastError = e;
          const is429 = e.message?.includes('429') || e.message?.toLowerCase().includes('quota');
          const isRotationError = is429 || e.message?.includes('404') || e.message?.includes('quota');

          if (is429) {
            console.warn(`[AI] Gemini 429 detected. Cooling down for 15s before tier rotation...`);
            await sleep(15000);
          }

          if (isRotationError && modelId !== tierList[tierList.length - 1]) {
            console.warn(`[AI] Gemini version ${modelId} exhausted. Rotating to next version...`);
            continue;
          }
          throw e; // Rethrow if it's not a rotation-friendly error or we've run out of tiers
        }
      }
      throw lastError;
    },
    chat: async (history, message, systemPrompt, opts = {}) => {
      const tierList = getGeminiModelTierList(opts.model);
      let lastError;

      for (const modelId of tierList) {
        try {
          console.log(`[AI Chat] Gemini: Trying version ${modelId}...`);
          const model = getGeminiModel(modelId);
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
        } catch (e) {
          lastError = e;
          const isRotationError = e.message?.includes('429') || e.message?.includes('404') || e.message?.includes('quota');
          if (isRotationError && modelId !== tierList[tierList.length - 1]) {
            console.warn(`[AI Chat] Gemini version ${modelId} exhausted. Rotating...`);
            continue;
          }
          throw e;
        }
      }
      throw lastError;
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
        timeout: 90000,
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
        timeout: 90000,
      });
      const content = res.data.message?.content;
      if (Array.isArray(content)) return content.map(c => c.text || '').join('');
      return content?.text || res.data.text || '';
    },
  },
};

const TASK_PROFILES = {
  reasoning: ['gemini', 'groq'],
  coding:    ['gemini', 'groq'],
  fast:      ['gemini', 'groq'],
  json:      ['gemini', 'groq'],
  chat:      ['gemini', 'groq'],
  default:   ['gemini', 'groq'],
};

const getProviderQueue = (task) => {
  const queue = TASK_PROFILES[task] || TASK_PROFILES.default;
  return queue.filter(name => providers[name] && providers[name].available);
};

const repairJSON = (text) => {
  let cleaned = text.trim();
  
  // 1. Remove markdown fences if present
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  
  // 2. Locate the outermost structure (handles both {} and [])
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');

  // Identify which structure comes first and ends last
  let start = -1;
  let last = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    last = lastBrace;
  } else if (firstBracket !== -1) {
    start = firstBracket;
    last = lastBracket;
  }

  if (start !== -1 && last > start) {
    cleaned = cleaned.slice(start, last + 1);
  }

  // 3. Common AI hallucination fixes
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3'); // Missing quotes
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1'); // Trailing commas
  
  return cleaned;
};

const generateText = async (input, opts = {}) => {
  // Global Guard: If we hit a quota limit recently, wait before starting a new request
  const now = Date.now();
  if (now - lastQuotaTime < QUOTA_COOLING_MS) {
    const waitTime = QUOTA_COOLING_MS - (now - lastQuotaTime);
    console.log(`[AI Quota Guard] Active. Waiting ${Math.round(waitTime/1000)}s for node calibration...`);
    await sleep(waitTime);
  }

  const queue = getProviderQueue(opts.task);
  if (queue.length === 0) throw new Error('No AI providers configured in env.');

  const errors = [];
  const maxRetries = opts.maxRetries || 1;
  
  for (const name of queue) {
    const p = providers[name];
    let attempts = 0;
    
    while (attempts <= maxRetries) {
      try {
        console.log(`[AI] Trying ${p.name} (Attempt ${attempts + 1})...`);
        const result = await p.generate(input, opts);
        if (!result || result.trim().length < 5) throw new Error('Empty response');
        console.log(`[AI] ✓ ${p.name} succeeded (${result.length} chars)`);
        return result;
      } catch (e) {
        attempts++;
        const is429 = e.response?.status === 429 || e.message?.includes('429');
        const isRetryable = is429 || e.response?.status >= 500 || e.code === 'ECONNABORTED';
        const msg = e.response?.data?.error?.message || e.message || 'Unknown error';
        
        console.log(`[AI] ✗ ${p.name} attempt ${attempts} failed: ${msg.slice(0, 100)}`);
        
        if (is429) {
          lastQuotaTime = Date.now();
          console.log(`[AI] Rate limit hit. Triggering Strategic Cooling (${Math.round(QUOTA_COOLING_MS/1000)}s)...`);
          await sleep(QUOTA_COOLING_MS);
        }

        if (!isRetryable || attempts > maxRetries) {
          errors.push(`${p.name}: ${msg.slice(0, 80)}`);
          break; 
        }
        
        const delay = Math.pow(2, attempts) * 1000;
        await sleep(delay);
      }
    }
  }
  throw new Error('All AI providers failed: ' + errors.join(' | '));
};

const generateJSON = async (input, opts = {}) => {
  const updatedOpts = { ...opts, task: opts.task || 'json' };
  
  // If input is an array (parts), append the JSON instruction to the last text part or add a new one
  let finalInput = input;
  const jsonInstruction = '\n\nCRITICAL: Respond with ONLY valid JSON. No markdown backticks. No text before or after the JSON structure.';
  
  if (Array.isArray(input)) {
    finalInput = [...input, { text: jsonInstruction }];
  } else {
    finalInput = input + jsonInstruction;
  }

  const text = await generateText(finalInput, updatedOpts);
  
  const cleaned = repairJSON(text);
  
  try {
    return JSON.parse(cleaned);
  } catch(e) {
    console.error('[AI JSON] Parse failed. Cleaned text:', cleaned.slice(0, 200));
    try {
        const fallbackMatch = text.match(/[\{\[][\s\S]*[\}\]]/);
        if (fallbackMatch) return JSON.parse(repairJSON(fallbackMatch[0]));
    } catch(e2) {}
    throw new Error('Failed to parse AI response as JSON after repair attempts');
  }
};

const chat = async (history, message, systemPrompt, opts = {}) => {
  const queue = getProviderQueue(opts.task || 'chat');
  if (queue.length === 0) throw new Error('No AI providers available for chat.');

  const errors = [];
  const maxRetries = opts.maxRetries || 1;

  for (const name of queue) {
    const p = providers[name];
    let attempts = 0;

    while (attempts <= maxRetries) {
      try {
        console.log(`[AI Chat] Trying ${p.name} (Attempt ${attempts + 1})...`);
        const result = await p.chat(history, message, systemPrompt);
        if (!result || result.trim().length < 5) throw new Error('Empty response');
        console.log(`[AI Chat] ✓ ${p.name} succeeded`);
        return result;
      } catch (e) {
        attempts++;
        const isRetryable = e.response?.status === 429 || e.response?.status >= 500 || e.code === 'ECONNABORTED';
        const msg = e.response?.data?.error?.message || e.message || 'Unknown';
        
        console.log(`[AI Chat] ✗ ${p.name} attempt ${attempts} failed: ${msg.slice(0, 100)}`);
        
        if (!isRetryable || attempts > maxRetries) {
          errors.push(`${p.name}: ${msg.slice(0, 80)}`);
          break; 
        }
        
        const delay = Math.pow(2, attempts) * 1000;
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw new Error('All AI providers failed: ' + errors.join(' | '));
};


console.log('[AI] Default Queue:', TASK_PROFILES.default.filter(n => providers[n].available).map(n => providers[n].name).join(', ') || 'NONE');

module.exports = { generateText, generateJSON, chat };
