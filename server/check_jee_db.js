const mysql = require('mysql2/promise');
const config = require('./src/config/env');

const checkDatabase = async () => {
  const conn = await mysql.createConnection({
    host: config.DB_SOCIAL.HOST,
    port: config.DB_SOCIAL.PORT,
    user: config.DB_SOCIAL.USER,
    password: config.DB_SOCIAL.PASSWORD,
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  });
  
  const tables = ['jee_subjects', 'jee_chapters', 'jee_topics', 'jee_questions', 'jee_user_progress', 'jee_test_attempts'];
  for (const table of tables) {
    try {
      const [cols] = await conn.query(`DESCRIBE ${table}`);
      console.log(`\nTable: ${table}`);
      console.log(cols.map(c => `${c.Field} (${c.Type})`).join(', '));
    } catch (e) {
      console.log(`Table ${table} NOT FOUND`);
    }
  }
  
  await conn.end();
};

checkDatabase().catch(console.error);
