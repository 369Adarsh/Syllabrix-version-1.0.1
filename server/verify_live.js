
const axios = require('axios');

async function verify() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('--- VERIFYING JEE ENDPOINTS (AUTH BYPASSED) ---');
  
  try {
    console.log('\n[1] GET /jee/subjects');
    const res = await axios.get(`${baseUrl}/jee/subjects`);
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('GET /jee/subjects FAILED:', err.response?.data || err.message);
  }

  try {
    console.log('\n[2] GET /jee/chapters?subject=physics&class=11');
    const res = await axios.get(`${baseUrl}/jee/chapters`, { 
      params: { subject: 'physics', class: 11 } 
    });
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('GET /jee/chapters FAILED:', err.response?.data || err.message);
  }

  try {
    console.log('\n[3] POST /jee/ai/doubt');
    const res = await axios.post(`${baseUrl}/jee/ai/doubt`, { 
      question: "What is Newton's second law?",
      subject: "physics"
    });
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('POST /jee/ai/doubt FAILED:', err.response?.data || err.message);
  }
}

verify();
