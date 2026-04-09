
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.development') });

const { getGeminiModel } = require('./src/utils/gemini-utils');

async function testGemini() {
  console.log('--- VERIFYING GEMINI FIX ---');
  console.log('Using API Key:', process.env.GEMINI_API_KEY ? 'FOUND' : 'MISSING');
  console.log('Using Configured Model:', process.env.GEMINI_MODEL || 'NOT SET');

  try {
    const model = getGeminiModel();
    console.log('Calling Gemini...');
    
    // Explicit model check
    console.log('Model Name in SDK:', model.model);

    const result = await model.generateContent('Say hello and confirm you are working.');
    const response = await result.response;
    const text = response.text();
    
    console.log('\nGEMINI RESPONSE:');
    console.log('-----------------------------------');
    console.log(text);
    console.log('-----------------------------------');
    console.log('\n✓ VERIFICATION SUCCESSFUL: Gemini is responding.');
  } catch (err) {
    console.error('\n✗ VERIFICATION FAILED:');
    console.error('Error Message:', err.message);
    if (err.response) {
      console.error('Response Error:', JSON.stringify(err.response, null, 2));
    }
    // Check if it's the 404 model not found error
    if (err.message.includes('404') || err.message.includes('not found')) {
       console.log('\n[!] The model name might still be incorrect or not available for this key.');
    }
    process.exit(1);
  }
}

testGemini();
