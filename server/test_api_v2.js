const dotenv = require('dotenv');
const path = require('path');
const { getGeminiModel } = require('./src/utils/gemini-utils');

// Load .env.development
dotenv.config({ path: path.join(__dirname, '.env.development') });

async function testGemini() {
  console.log('--- Gemini API Test v2 ---');
  console.log('Model configured in .env:', process.env.GEMINI_MODEL);
  console.log('API Key exists:', !!process.env.GEMINI_API_KEY);

  const modelsToTry = [process.env.GEMINI_MODEL || 'gemini-2.0-flash', 'gemini-1.5-flash'];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`\nTrying model: ${modelName}`);
      const model = getGeminiModel(modelName);
      const prompt = "Say 'Hello, Syllabrix is ready!' to confirm you are working.";
      
      console.log(`Sending prompt to Gemini (${modelName})...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`\nSUCCESS! Gemini (${modelName}) Response:`);
      console.log('---------------------------');
      console.log(text);
      console.log('---------------------------');
      return; // Exit on first success
    } catch (error) {
      console.error(`\nFAILED! Error calling Gemini (${modelName}):`);
      console.error(error.message);
      if (error.message.includes('429')) {
        console.log('Rate limited. Waiting 5s before trying next model...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}

testGemini();
