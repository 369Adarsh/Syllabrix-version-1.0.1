const readline = require('readline');
const { ldPool } = require('../src/database/connection');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const corporateTables = [
  'ld_assessments', 'ld_enrollments', 'ld_module_progress', 'ld_modules',
  'ld_org_members', 'ld_organizations', 'ld_programs', 'ld_repetition_schedule',
  'ld_reviews', 'ld_role_skills', 'ld_roles', 'ld_skill_history',
  'ld_skill_profiles', 'ld_skills'
];

async function resetCorporate() {
  console.log('\n========================================');
  console.log('  Syllabrix CORPORATE L&D Reset');
  console.log('========================================\n');
  
  console.log('Target Database: Syllabrix Corporate L&D');
  console.log('Tables to wipe: ' + corporateTables.length);
  console.log('');

  const answer = await new Promise(resolve => {
    rl.question('Are you sure you want to wipe ALL Corporate L&D data? (y/n): ', resolve);
  });

  if (answer.toLowerCase() !== 'y') {
    console.log('Reset cancelled.');
    process.exit(0);
  }

  try {
    // Check if database is reachable
    const connTest = await ldPool.getConnection();
    connTest.release();

    await ldPool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of corporateTables) {
      process.stdout.write(`    Truncating ${table}... `);
      try {
        await ldPool.query(`TRUNCATE TABLE \`${table}\``);
        console.log('✓');
      } catch (e) {
        console.log('✗ (Missing/Skipped)');
      }
    }
    await ldPool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n--- CORPORATE RESET COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('\n!!! RESET FAILED !!!');
    console.error('Error:', err.message);
    console.log('\nIs the database "syllabrix_corporate" created correctly?');
    process.exit(1);
  }
}

resetCorporate();
