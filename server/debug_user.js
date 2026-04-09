const mysql = require('mysql2/promise');
const config = require('./src/config/env');

const run = async () => {
  const conn = await mysql.createConnection({
    host: config.DB_SOCIAL.HOST,
    port: config.DB_SOCIAL.PORT,
    user: config.DB_SOCIAL.USER,
    password: config.DB_SOCIAL.PASSWORD,
    database: config.DB_SOCIAL.NAME,
    ssl: config.DB_SOCIAL.SSL ? { rejectUnauthorized: false } : null
  });
  try {
    const [users] = await conn.query('SELECT id, username, user_type FROM users WHERE username LIKE "%Adarsh%" OR id IN (SELECT user_id FROM user_profiles WHERE full_name LIKE "%Adarsh%")');
    console.log('Users found:', users);
    
    for (const user of users) {
      const [[cp]] = await conn.query('SELECT * FROM career_profiles WHERE user_id = ?', [user.id]);
      const [[sp]] = await conn.query('SELECT * FROM career_skill_profiles WHERE user_id = ?', [user.id]);
      console.log(`User ${user.id} (${user.username}):`);
      console.log('  Career Profile:', cp ? 'Exists' : 'MISSING');
      console.log('  Skill Profile:', sp ? 'Exists' : 'MISSING');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
};

run();
