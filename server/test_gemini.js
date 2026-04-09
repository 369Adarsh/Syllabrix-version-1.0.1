
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env.development' });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env.development');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Testing a wider range including Gemin 3 just in case
  const modelsToTest = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];

  for (const modelName of modelsToTest) {
    try {
      console.log(`--- Testing model: ${modelName} ---`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = "Please state your exact model version and name as you understand it. Respond with only that information.";
      const result = await model.generateContent(prompt);
      const output = result.response.text().trim();
      console.log(`✓ ${modelName} responded:\n${output}\n`);
    } catch (error) {
      console.log(`✗ ${modelName} failed: ${error.message}\n`);
    }
  }
}

testGemini();
