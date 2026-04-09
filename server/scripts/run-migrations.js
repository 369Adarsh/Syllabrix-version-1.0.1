const fs = require('fs');
const path = require('path');
const { pool } = require('../src/database/connection');

const runMigrations = async () => {
    console.log('--- SYLLABRIX L&D: RUNNING DATABASE MIGRATIONS ---');
    const conn = await pool.getConnection();

    try {
        const migrationDir = path.join(__dirname, '../../database/migrations/phase-ld');
        const files = fs.readdirSync(migrationDir).sort();

        for (const file of files) {
            console.log(`Executing migration: ${file}...`);
            const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
            
            // Split by semicolon, but be careful with multi-line statements
            // This is a simple splitter for standard standard SQL
            const statements = sql
                .split(/;\s*$/m)
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const statement of statements) {
                try {
                    await conn.query(statement);
                } catch (err) {
                    // Ignore "Table already exists" or similar for clean run
                    if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
                        throw err;
                    }
                }
            }
        }
        console.log('--- MIGRATIONS COMPLETED SUCCESSFULLY ---');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        conn.release();
        process.exit(0);
    }
};

runMigrations();
