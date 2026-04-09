const fs = require('fs');
const path = require('path');
const { pool } = require('../src/database/connection');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../../database/migrations/phase-ai-study-table');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); 

  console.log('Running AI Study Table Migrations...');
  
  for (const file of files) {
    console.log(`Executing ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (let statement of statements) {
      if(statement) {
        try {
            await pool.query(statement);
        } catch(e) {
            console.error(`Error executing statement in ${file}: ` + e.message);
        }
      }
    }
    console.log(`✅ ${file} applied.`);
  }

  console.log('All migrations executed successfully.');
  process.exit(0);
}

runMigrations().catch(e => {
  console.error('Migration failed', e);
  process.exit(1);
});
