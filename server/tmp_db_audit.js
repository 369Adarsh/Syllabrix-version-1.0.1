const { pool } = require('./src/database/connection');

async function auditDatabase() {
  try {
    const [tableRows] = await pool.query("SHOW TABLES");
    const tables = tableRows.map(r => Object.values(r)[0]);
    
    console.log('--- Table Audit ---');
    for (const table of tables) {
      const [[{ count }]] = await pool.query(`SELECT COUNT(*) as count FROM \`${table}\``);
      console.log(`${table.padEnd(30)}: ${count} rows`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

auditDatabase();
