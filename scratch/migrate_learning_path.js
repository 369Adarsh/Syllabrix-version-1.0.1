const { pool } = require('../server/src/database/connection');

async function migrate() {
  try {
    console.log('Adding career_alignment column...');
    await pool.query('ALTER TABLE career_learning_paths ADD COLUMN career_alignment TEXT;');
    console.log('Migration successful.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
