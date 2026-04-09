
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, 'server', '.env.development') });
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function runAudit() {
  console.log('--- JEE COMMAND FORENSIC AUDIT ---');
  
  // 1. Check Env
  console.log('\n[1] Environment Check:');
  console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  console.log('GEMINI_API_KEY value:', process.env.GEMINI_API_KEY ? (process.env.GEMINI_API_KEY.length > 8 ? process.env.GEMINI_API_KEY.substring(0, 8) + '...' : 'too-short') : 'NULL');
  console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL || 'NOT SET (defaulting to gemini-2.0-flash in code)');
  
  // 2. Database Check
  console.log('\n[2] Database Check:');
  const dbConfig = {
    host: process.env.DB_SOCIAL_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_SOCIAL_PORT || process.env.DB_PORT || '3306', 10),
    database: process.env.DB_SOCIAL_NAME || process.env.DB_NAME || 'syllabrix_social',
    user: process.env.DB_SOCIAL_USER || process.env.DB_USER || 'root',
    password: process.env.DB_SOCIAL_PASSWORD || process.env.DB_PASSWORD || '',
  };
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log(`Connected to database: ${dbConfig.database}`);
    
    const [tables] = await connection.query("SHOW TABLES LIKE 'jee_%'");
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    if (tableNames.length === 0) {
      console.log('No jee_ tables found!');
    } else {
      for (const table of tableNames) {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`Table: ${table.padEnd(25)} | Rows: ${rows[0].count}`);
      }
    }
    await connection.end();
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
  
  console.log('\n--- AUDIT SCRIPT COMPLETE ---');
}

runAudit();
