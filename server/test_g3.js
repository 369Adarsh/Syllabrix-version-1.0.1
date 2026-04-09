
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env.development' });

async function quickTest() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash' });
    const res = await model.generateContent("ping");
    console.log("✓ SUCCESS: gemini-3-flash is working!");
  } catch (e) {
    console.log("✗ FAILED: gemini-3-flash still 404s: " + e.message);
  }
}
quickTest();
