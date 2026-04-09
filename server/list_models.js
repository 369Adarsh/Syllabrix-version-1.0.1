
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.development') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found');
    return;
  }

  console.log('--- FETCHING AVAILABLE MODELS ---');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await axios.get(url);
    console.log('Available Models:');
    res.data.models.forEach(m => {
      console.log(`- ${m.name} (${m.displayName})`);
    });
  } catch (err) {
    console.error('Error fetching models:', err.response?.data || err.message);
  }
}

listModels();
