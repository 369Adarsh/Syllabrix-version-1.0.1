const { socialPool: pool } = require('../server/src/database/connection');

async function cleanSocialUsers({ dryRun = true } = {}) {
  console.log(`\n🚀 SYLLABRIX SOCIAL CLEANUP (${dryRun ? 'DRY RUN' : 'FINAL EXECUTION'})\n`);

  try {
    // 1. Identify non-admin users to delete
    const [usersToDelete] = await pool.query(
      "SELECT id, username FROM users WHERE user_type != 'syllabrix_admin'"
    );

    if (usersToDelete.length === 0) {
      console.log('✅ No regular users found to delete.');
      return;
    }

    const userIds = usersToDelete.map(u => u.id);
    console.log(`📦 Found ${usersToDelete.length} regular users to remove.\n`);

    // 2. Identify tables referencing users
    const [referenceTables] = await pool.query(`
      SELECT DISTINCT TABLE_NAME, COLUMN_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME = 'users' 
      AND TABLE_SCHEMA = DATABASE()
    `);

    // 3. Perform Deletion
    if (!dryRun) {
      await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    }

    for (const ref of referenceTables) {
      const { TABLE_NAME, COLUMN_NAME } = ref;
      
      // Skip admin_audit_logs if it's the admin_id column (we only want to delete logs if they refer to a deleted TARGET)
      if (TABLE_NAME === 'admin_audit_logs' && COLUMN_NAME === 'admin_id') continue;

      const [countResult] = await pool.query(
        `SELECT COUNT(*) as count FROM ?? WHERE ?? IN (?)`,
        [TABLE_NAME, COLUMN_NAME, userIds]
      );
      
      const count = countResult[0].count;
      if (count > 0) {
        console.log(`🗑️  ${TABLE_NAME}: Detected ${count} records linked via ${COLUMN_NAME}.`);
        if (!dryRun) {
          await pool.query(
            `DELETE FROM ?? WHERE ?? IN (?)`,
            [TABLE_NAME, COLUMN_NAME, userIds]
          );
        }
      }
    }

    // Finally, the users themselves
    console.log(`👤 users: Detected ${usersToDelete.length} records.`);
    if (!dryRun) {
      await pool.query(`DELETE FROM users WHERE id IN (?)`, [userIds]);
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('\n✅ Cleanup complete.');
    } else {
      console.log('\n⚠️  DRY RUN: No actual deletions were made.');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    if (!dryRun) await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    process.exit();
  }
}

// Check command line arguments
const isForced = process.argv.includes('--force');
cleanSocialUsers({ dryRun: !isForced });
