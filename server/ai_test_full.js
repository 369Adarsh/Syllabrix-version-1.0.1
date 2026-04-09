require('./src/config/env');
const { generateJSON } = require('./src/services/ai.service');

async function test() {
  console.log('Testing generateJSON...');
  try {
    const result = await generateJSON('Generate a JSON object with one key "hello" and value "world"', { task: 'json' });
    console.log('SUCCESS:', result);
  } catch (e) {
    console.error('FAILED:', e.message);
  }
}

test();
