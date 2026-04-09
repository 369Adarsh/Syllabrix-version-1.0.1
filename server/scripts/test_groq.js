require('dotenv').config({ path: '.env.development' });
const axios = require('axios');

async function testGroq() {
  console.log('Testing Groq with key:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');
  try {
    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Say "GROQ_OK"' }],
    }, {
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    console.log('Success:', res.data.choices[0].message.content);
  } catch (e) {
    console.error('Groq Failed:', e.response?.data?.error?.message || e.message);
  }
}

testGroq();
