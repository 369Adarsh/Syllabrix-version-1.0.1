
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env.development' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env.development');
    return;
  }

  // Listing models is not directly exposed but we can try to find the method
  // Actually, standard practice for @google/generative-ai is just to use a name
  // But we want to know what this key supports.

  console.log("Checking API capacity with different model strings...");
  const tests = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.0-pro',
    'gemini-2.0-flash'
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  for (const t of tests) {
    try {
      const model = genAI.getGenerativeModel({ model: t });
      await model.generateContent("ping");
      console.log(`[WORKING] ${t}`);
    } catch (e) {
      console.log(`[FAILED]  ${t}: ${e.message.slice(0, 100)}`);
    }
  }
}

listModels();
