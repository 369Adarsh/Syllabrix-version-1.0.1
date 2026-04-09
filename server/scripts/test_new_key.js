const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testNewKey() {
  const newKey = 'AIzaSyCDTgWOlUwZgXSYtfnExaLYr8zF8_wCdsg';
  console.log('Testing New Gemini Key...');
  
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  
  for (const modelId of models) {
    console.log(`\n--- Testing Model: ${modelId} ---`);
    try {
      const genAI = new GoogleGenerativeAI(newKey);
      const model = genAI.getGenerativeModel({ model: modelId });
      
      const startTime = Date.now();
      const result = await model.generateContent("Say 'TEST_SUCCESS'");
      const response = await result.response;
      const text = response.text();
      
      console.log(`[OK] Success (took ${Date.now() - startTime}ms):`, text.trim());
    } catch (e) {
      console.error(`[FAIL] ${modelId} failed:`, e.message);
    }
  }
}

testNewKey();
