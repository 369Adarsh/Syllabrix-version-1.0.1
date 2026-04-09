const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'priya.sharma@syllabrix.com',
      password: 'Syllabrix2026'
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log('Error from backend:', err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testLogin();
