require('dotenv').config({ path: '.env.development' });
const { generateText } = require('../src/services/ai.service');

async function runDiagnostics() {
  console.log('=== AI Provider Diagnostics ===');
  console.log('Attempting a multi-provider fallback request...');
  console.log('------------------------------');

  try {
    const startTime = Date.now();
    const response = await generateText('Hello! Please respond with "SYLLABRIX_ACTIVE".', { 
      task: 'default', 
      maxRetries: 0 
    });
    
    const duration = Date.now() - startTime;
    console.log(`\n✅ SUCCESS! One of the providers responded in ${duration}ms`);
    console.log(`Response: "${response.trim()}"`);
    console.log('\n(Note: The AI service uses a fallback queue. If you see this, the system is working again.)');
  } catch (error) {
    console.error('\n❌ ALL PROVIDERS FAILED');
    console.error('Detailed Errors:', error.message);
    process.exit(1);
  }
}

runDiagnostics();
