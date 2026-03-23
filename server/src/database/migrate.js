// Migration Runner — Reads and executes SQL files in order
// FIXED: Properly strips comments before executing SQL
const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('./connection');

const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', '..', 'database', 'migrations');

const runMigrations = async () => {
  console.log('');
  console.log('========================================');
  console.log('  Syllabrix Migration Runner');
  console.log('========================================');
  console.log('');

  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot run migrations — database not reachable.');
    process.exit(1);
  }

  // Create migrations tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL,
      executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_migration_file (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Get already-run migrations
  const [executed] = await pool.query('SELECT filename FROM _migrations ORDER BY id');
  const executedSet = new Set(executed.map((r) => r.filename));

  // Find all phase directories and collect SQL files
  const phases = fs.readdirSync(MIGRATIONS_DIR)
    .filter((d) => d.startsWith('phase-'))
    .sort();

  let totalRun = 0;
  let totalSkipped = 0;

  for (const phase of phases) {
    const phaseDir = path.join(MIGRATIONS_DIR, phase);
    const files = fs.readdirSync(phaseDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log(`  Phase: ${phase} (${files.length} files)`);

    for (const file of files) {
      const key = `${phase}/${file}`;

      if (executedSet.has(key)) {
        totalSkipped++;
        continue;
      }

      const sql = fs.readFileSync(path.join(phaseDir, file), 'utf8');

      // Extract only the UP section (before -- DOWN)
      const upSql = sql.split('-- DOWN')[0];

      // Strip all comment lines, then extract SQL statements
      const cleanedSql = upSql
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n');

      // Split by semicolon and get non-empty statements
      const statements = cleanedSql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      try {
        for (const stmt of statements) {
          if (stmt.toUpperCase().includes('CREATE TABLE') ||
              stmt.toUpperCase().includes('ALTER TABLE') ||
              stmt.toUpperCase().includes('INSERT')) {
            await pool.query(stmt);
          }
        }
        await pool.query('INSERT INTO _migrations (filename) VALUES (?)', [key]);
        console.log(`    ✓ ${file}`);
        totalRun++;
      } catch (error) {
        console.error(`    ✗ ${file} — ERROR: ${error.message}`);
        console.error('    Migration stopped. Fix the error and re-run.');
        process.exit(1);
      }
    }
  }

  console.log('');
  console.log(`  Done! ${totalRun} migrations executed, ${totalSkipped} skipped (already run).`);
  console.log('');
  process.exit(0);
};

runMigrations();
