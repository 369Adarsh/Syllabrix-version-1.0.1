require('./src/config/env');
const { getGeminiModel } = require('./src/utils/gemini-utils');

async function test() {
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `set (${process.env.GEMINI_API_KEY.slice(0,10)}...)` : 'MISSING');
  console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL);
  try {
    const model = getGeminiModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Say hello in exactly 5 words.' }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 50 },
    });
    console.log('\n✅ Gemini responded:', result.response.text().trim());
  } catch (e) {
    console.error('\n❌ Gemini failed:', e.message.slice(0, 300));
  }
}
test();
