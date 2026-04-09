const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { socialPool } = require('./src/database/connection');

async function createAdmin() {
  const hash = await bcrypt.hash('Syllabrix2026', 10);
  const [existing] = await socialPool.query("SELECT id FROM users WHERE email = 'priya.sharma@syllabrix.com'");
  if (existing.length > 0) {
    await socialPool.query("UPDATE users SET user_type='organization', admin_role='super_admin', is_active=1, is_profile_complete=1, password_hash=? WHERE email='priya.sharma@syllabrix.com'", [hash]);
    console.log('Updated existing admin user.');
  } else {
    await socialPool.query(`INSERT INTO users (username, full_name, email, password_hash, user_type, admin_role, age_group, syllabrix_id, email_verified_at, is_active, is_profile_complete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1, 1)`,
      ['priyasharma', 'Priya Sharma', 'priya.sharma@syllabrix.com', hash, 'organization', 'super_admin', '18+', 'A-PRIYA001']
    );
    console.log('Created admin user.');
  }
  process.exit();
}

createAdmin();
