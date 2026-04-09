
require('dotenv').config({ path: './.env.development' });
const { generateText } = require('./src/services/ai.service');

async function verifyUpdate() {
  console.log("--- Verifying Gemini update with 'Gemini 3 Flash' ---");
  try {
    const output = await generateText("Identify yourself briefly.", { model: 'Gemini 3 Flash' });
    console.log("✓ Success! AI response with 'Gemini 3 Flash' identifier:");
    console.log(output);
  } catch (err) {
    console.error("✗ Failed to use 'Gemini 3 Flash':", err.message);
  }
}

verifyUpdate();
