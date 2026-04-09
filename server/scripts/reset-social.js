const readline = require('readline');
const { socialPool } = require('../src/database/connection');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const socialTables = [
  'user_sessions', 'users', 'student_profiles', 'teacher_profiles', 
  'institute_profiles', 'parent_profiles', 'professional_learner_profiles', 
  'organization_profiles', 'user_groups'
];

async function resetSocial() {
  console.log('\n========================================');
  console.log('  Syllabrix SOCIAL Reset');
  console.log('========================================\n');
  
  console.log('Target Database: Syllabrix Social (Primary)');
  console.log('Tables to wipe: ' + socialTables.length);
  console.log('');

  const answer = await new Promise(resolve => {
    rl.question('Are you sure you want to wipe ALL Social data (including USERS)? (y/n): ', resolve);
  });

  if (answer.toLowerCase() !== 'y') {
    console.log('Reset cancelled.');
    process.exit(0);
  }

  try {
    // Check if database is reachable
    const connTest = await socialPool.getConnection();
    connTest.release();

    await socialPool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of socialTables) {
      process.stdout.write(`    Truncating ${table}... `);
      try {
        await socialPool.query(`TRUNCATE TABLE \`${table}\``);
        console.log('✓');
      } catch (e) {
        console.log('✗ (Missing/Skipped)');
      }
    }
    await socialPool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n--- SOCIAL RESET COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('\n!!! RESET FAILED !!!');
    console.error('Error:', err.message);
    process.exit(1);
  }
}

resetSocial();
