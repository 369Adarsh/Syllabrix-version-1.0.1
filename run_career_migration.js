const { ldPool } = require('./server/src/database/connection');

async function runMigration() {
  try {
    console.log('Running simplified career migration...');
    
    await ldPool.query(`
      ALTER TABLE career_profiles 
      ADD COLUMN mentorship_preference ENUM('expert', 'peer', 'ai') DEFAULT 'ai' AFTER salary_expectation,
      ADD COLUMN focus_priority JSON AFTER mentorship_preference
    `);
    
    console.log('Migration completed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist. Skipping. 🎉');
      process.exit(0);
    }
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
