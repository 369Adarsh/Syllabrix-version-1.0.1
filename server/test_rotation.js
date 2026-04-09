require('./src/config/env');
const { generateText } = require('./src/services/ai.service');

async function testRotation() {
  console.log('--- TESTING AUTOMATIC GEMINI VERSION ROTATION ---');
  console.log('Requesting gemini-2.0-flash (known to be over quota)...');
  
  try {
    const result = await generateText('Say "Rotation Success" in 2 words.', { 
      model: 'gemini-2.0-flash' 
    });
    console.log('\nFINAL OUTPUT:', result);
    console.log('\n✅ TEST PASSED: System successfully rotated through models until a working one was found.');
  } catch (e) {
    console.error('\n❌ TEST FAILED:', e.message);
  }
}

testRotation();
