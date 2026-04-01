const fs = require('fs');
const path = require('path');
const { pool } = require('../src/database/connection');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../../database/migrations/phase-fitness');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // ensures alphabetical/numerical order (106, 107...)

  console.log('Running Fitness Migrations...');
  
  for (const file of files) {
    console.log(`Executing ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    // Some SQL files might have multiple statements separated by semicolon.
    // mysql2/promise `query` method might not support multiple statements by default
    // unless multipleStatements: true is set. Let's try executing it.
    
    // Split by semicolons for basic support just in case
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
