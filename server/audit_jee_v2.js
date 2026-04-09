
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '.env.development') });
dotenv.config({ path: path.join(__dirname, '.env') });

async function runAudit() {
  console.log('--- JEE COMMAND FORENSIC AUDIT (REFINED) ---');
  
  // 1. Check Env
  console.log('\n[1] Environment Check:');
  console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL || 'NOT SET');
  
  // 2. Database Check
  console.log('\n[2] Database Check:');
  const dbConfig = {
    host: process.env.DB_SOCIAL_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_SOCIAL_PORT || process.env.DB_PORT || '3306', 10),
    database: process.env.DB_SOCIAL_NAME || process.env.DB_NAME || 'syllabrix_social',
    user: process.env.DB_SOCIAL_USER || process.env.DB_USER || 'root',
    password: process.env.DB_SOCIAL_PASSWORD || process.env.DB_PASSWORD || '',
  };
  
  console.log('Attempting connection to:', dbConfig.host, dbConfig.database);
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully.');
    
    const [tables] = await connection.query("SHOW TABLES LIKE 'jee_%'");
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    if (tableNames.length === 0) {
      console.log('No jee_ tables found in', dbConfig.database);
    } else {
      for (const table of tableNames) {
        try {
          const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`Table: ${table.padEnd(25)} | Rows: ${rows[0].count}`);
        } catch (e) {
          console.log(`Table: ${table.padEnd(25)} | Error: ${e.message}`);
        }
      }
    }
    await connection.end();
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
  
  console.log('\n--- AUDIT SCRIPT COMPLETE ---');
}

runAudit();
