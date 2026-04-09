const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ordered from most preferred/latest to most stable fallback
const GEMINI_TIERS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

const MODEL_ALIASES = {
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-1.5-flash-8b': 'gemini-1.5-flash-8b',
  'gemini-pro': 'gemini-1.5-pro',
};

/**
 * Resolves a friendly name or alias to a concrete Gemini model ID and 
 * generates a priority list of fallbacks.
 * 
 * @param {string} requestedModel - The name requested by the user/env
 * @returns {string[]} Ordered list of model IDs to attempt
 */
const getGeminiModelTierList = (requestedModel) => {
  const envDefault = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  let target = (requestedModel || envDefault).toLowerCase();

  // Normalize human-readable variants to machine IDs
  if (target.includes('gemini') && target.includes('flash')) {
    if (target.includes('3') || target.includes('2')) target = 'gemini-2.0-flash';
    else if (target.includes('1.5')) target = 'gemini-1.5-flash';
  } else if (target.includes('gemini') && target.includes('pro')) {
    target = 'gemini-1.5-pro';
  }

  const resolvedId = MODEL_ALIASES[target] || target;

  // Build the list: Start with resolved ID, then append remaining tiers
  const list = [resolvedId];
  
  GEMINI_TIERS.forEach(tier => {
    if (tier !== resolvedId) list.push(tier);
  });

  return [...new Set(list)]; // Ensure unique
};

/**
 * Gets a specific Gemini model instance by its exact ID.
 * 
 * @param {string} modelId - The exact model identifier (e.g. 'gemini-2.0-flash')
 * @returns {import('@google/generative-ai').GenerativeModel}
 */
const getGeminiModel = (modelId) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const safetySettings = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  ];

  return genAI.getGenerativeModel({ 
    model: modelId,
    safetySettings 
  });
};

module.exports = { getGeminiModel, getGeminiModelTierList, GEMINI_TIERS };
