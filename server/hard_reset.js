const readline = require('readline');
const { socialPool, ldPool, testConnection } = require('./src/database/connection');
const { hashPassword } = require('./src/utils/password-utils');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function hardReset() {
  const socialTables = [
    'user_sessions', 'users', 'student_profiles', 'teacher_profiles', 
    'institute_profiles', 'parent_profiles', 'professional_learner_profiles', 
    'organization_profiles', 'user_groups'
  ];

  const corporateTables = [
    'ld_assessments', 'ld_enrollments', 'ld_module_progress', 'ld_modules',
    'ld_org_members', 'ld_organizations', 'ld_programs', 'ld_repetition_schedule',
    'ld_reviews', 'ld_role_skills', 'ld_roles', 'ld_skill_history',
    'ld_skill_profiles', 'ld_skills'
  ];

  console.log('\n========================================');
  console.log('  ⚠️  SYLLABRIX COMPLETE HARD RESET  ⚠️');
  console.log('========================================\n');
  
  console.log('This will wipe ALL data from BOTH databases:');
  console.log(`- SOCIAL/PRIMARY: ${socialTables.length} tables`);
  console.log(`- CORPORATE L&D: ${corporateTables.length} tables`);
  console.log('\n');

  const answer = await new Promise(resolve => {
    rl.question('ARE YOU ABSOLUTELY SURE? This cannot be undone. (y/n): ', resolve);
  });

  if (answer.toLowerCase() !== 'y') {
    console.log('Reset cancelled.');
    process.exit(0);
  }

  try {
    const connected = await testConnection();
    if (!connected) { 
      console.error('DB not reachable.'); 
      process.exit(1); 
    }

    // 1. Reset Social Tables
    console.log('\n--- RESETTING SOCIAL DATABASE ---');
    await socialPool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of socialTables) {
      process.stdout.write(`    Truncating ${table}... `);
      await socialPool.query(`TRUNCATE TABLE \`${table}\``);
      console.log('✓');
    }
    await socialPool.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Reset Corporate Tables
    console.log('\n--- RESETTING CORPORATE DATABASE ---');
    try {
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
    } catch (err) {
      console.warn('    Warning: Corporate database reset failed (might not exist yet).');
    }

    console.log('\n--- CREATING FRESH ADMIN ACCOUNT (Social DB) ---');
    const hashedPassword = await hashPassword('Syllabrix2026');
    
    const [userRes] = await socialPool.query(
      `INSERT INTO users (username, full_name, email, password_hash, user_type, email_verified_at, is_active, is_profile_complete, syllabrix_id)
       VALUES (?, ?, ?, ?, ?, NOW(), 1, 1, ?)`,
      ['priya_admin', 'Priya Sharma', 'priya.sharma@syllabrix.com', hashedPassword, 'professional_learner', 'P-PRIYAX000026']
    );

    const userId = userRes.insertId;

    await socialPool.query(
      `INSERT INTO professional_learner_profiles (user_id, full_name, industry, designation)
       VALUES (?, ?, ?, ?)`,
      [userId, 'Priya Sharma', 'Technology', 'L&D Director']
    );

    console.log('\n--- COMPLETE RESET FINISHED ---');
    console.log('Admin Email: priya.sharma@syllabrix.com');
    console.log('Admin Pass:  Syllabrix2026');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (err) {
    console.error('\n!!! RESET FAILED !!!');
    console.error(err);
    process.exit(1);
  }
}

hardReset();
