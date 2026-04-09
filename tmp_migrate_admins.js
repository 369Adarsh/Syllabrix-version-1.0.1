const { pool } = require('./server/src/database/connection');
async function run() {
  try {
    const [result] = await pool.query(
      "UPDATE users SET admin_role = 'super_admin' WHERE user_type = 'syllabrix_admin' AND (admin_role IS NULL OR admin_role = '')"
    );
    console.log('Migrated Admins:', result.changedRows);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
}
run();
