const { testConnection } = require('./src/database/connection');

async function verify() {
  console.log('Verifying Database Connections...');
  const success = await testConnection();
  if (success) {
    console.log('SUCCESS: Both pools connected.');
  } else {
    console.log('FAILURE: One or more pools failed to connect.');
  }
  process.exit(success ? 0 : 1);
}

verify();
