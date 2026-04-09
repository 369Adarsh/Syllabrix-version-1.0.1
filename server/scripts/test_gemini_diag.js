require('dotenv').config({ path: '.env.development' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('Testing Gemini with key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
  console.log('Using model:', process.env.GEMINI_MODEL || 'gemini-1.5-flash');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const startTime = Date.now();
    const result = await model.generateContent("Say 'GEMINI_OK'");
    const response = await result.response;
    const text = response.text();
    
    console.log('Success (took ' + (Date.now() - startTime) + 'ms):', text);
  } catch (e) {
    console.error('Gemini Failed:', e.message);
    if (e.stack) console.error(e.stack.split('\n').slice(0, 3).join('\n'));
  }
}

testGemini();
