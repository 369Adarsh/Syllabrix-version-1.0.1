
require('dotenv').config({ path: './.env.development' });
try {
  const { getGeminiModel } = require('./src/utils/gemini-utils');
  const model = getGeminiModel();
  console.log("✓ getGeminiModel works. Model ID:", model.model);
} catch (err) {
  console.error("✗ getGeminiModel failed:", err.message);
}

try {
  const jeeAI = require('./src/features/jee/jee-ai.service');
  console.log("✓ jee-ai.service required successfully.");
} catch (err) {
  console.error("✗ jee-ai.service requirement failed:", err.message);
  console.error(err.stack);
}
