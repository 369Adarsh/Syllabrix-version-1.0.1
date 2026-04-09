// Migration Runner — Reads and executes SQL files in order across multiple databases
const fs = require('fs');
const path = require('path');
const { socialPool, ldPool, testConnection } = require('./connection');

const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', '..', 'database', 'migrations');

const runMigrations = async () => {
  console.log('');
  console.log('========================================');
  console.log('  Syllabrix Multi-DB Migration Runner');
  console.log('========================================');
  console.log('');

  // 1. Initial connectivity check (Optional - will skip individual pools later)
  await testConnection().catch(() => {
    console.warn('  ⚠️  Warning: Initial connection check failed. Will retry per phase.');
  });

  // Find all phase directories
  const phases = fs.readdirSync(MIGRATIONS_DIR)
    .filter((d) => d.startsWith('phase-'))
    .sort();

  let totalRun = 0;
  let totalSkipped = 0;

  for (const phase of phases) {
    // 2. Determine target pool (Phase-LD goes to Corporate, others to Social)
    const isCorporate = phase.startsWith('phase-ld');
    const targetPool = isCorporate ? ldPool : socialPool;
    const dbLabel = isCorporate ? '[CORPORATE]' : '[SOCIAL]   ';

    // 3. Check pool connectivity for this specific phase
    try {
      const conn = await targetPool.getConnection();
      conn.release();
    } catch (e) {
      console.warn(`  ⚠️  Skipping Phase: ${phase} — ${dbLabel} is not reachable.`);
      continue;
    }

    const phaseDir = path.join(MIGRATIONS_DIR, phase);
    const files = fs.readdirSync(phaseDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) continue;

    console.log(`  ${dbLabel} Phase: ${phase} (${files.length} files)`);

    // 4. Ensure _migrations table exists in the target DB
    await targetPool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        filename VARCHAR(255) NOT NULL,
        executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_migration_file (filename)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Get already-run migrations for THIS database
    const [executed] = await targetPool.query('SELECT filename FROM _migrations ORDER BY id');
    const executedSet = new Set(executed.map((r) => r.filename));

    for (const file of files) {
      const key = `${phase}/${file}`;

      if (executedSet.has(key)) {
        totalSkipped++;
        continue;
      }

      const sql = fs.readFileSync(path.join(phaseDir, file), 'utf8');
      const upSql = sql.split('-- DOWN')[0];
      const cleanedSql = upSql.split('\n').filter((line) => !line.trim().startsWith('--')).join('\n');
      const statements = cleanedSql.split(';').map((s) => s.trim()).filter((s) => s.length > 0);

      try {
        for (const stmt of statements) {
          if (stmt.toUpperCase().includes('CREATE TABLE') ||
              stmt.toUpperCase().includes('ALTER TABLE') ||
              stmt.toUpperCase().includes('ALTER COLUMN') ||
              stmt.toUpperCase().includes('INSERT') ||
              stmt.toUpperCase().includes('UPDATE') ||
              stmt.toUpperCase().includes('DELETE')) {
            await targetPool.query(stmt);
          }
        }
        await targetPool.query('INSERT INTO _migrations (filename) VALUES (?)', [key]);
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
  console.log(`  Done! ${totalRun} migrations executed, ${totalSkipped} skipped.`);
  console.log('========================================');
  console.log('');
  process.exit(0);
};

runMigrations();
