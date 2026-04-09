
const axios = require('axios');
const fs = require('fs');

async function verify() {
  const baseUrl = 'http://localhost:5000/api';
  let report = '--- RAW ENDPOINT RESPONSES ---\n\n';
  
  try {
    const res = await axios.get(`${baseUrl}/jee/subjects`);
    report += 'GET /jee/subjects:\n' + JSON.stringify(res.data, null, 2) + '\n\n';
  } catch (err) {
    report += 'GET /jee/subjects ERROR: ' + err.message + '\n\n';
  }

  try {
    const res = await axios.get(`${baseUrl}/jee/chapters`, { params: { subject: 'physics', class: 11 } });
    report += 'GET /jee/chapters?subject=physics&class=11:\n' + JSON.stringify(res.data, null, 2) + '\n\n';
  } catch (err) {
    report += 'GET /jee/chapters ERROR: ' + err.message + '\n\n';
  }

  fs.writeFileSync('raw_responses.txt', report);
  console.log('Report saved to raw_responses.txt');
}

verify();
