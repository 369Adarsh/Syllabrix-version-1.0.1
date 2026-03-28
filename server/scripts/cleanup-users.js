/**
 * Syllabrix — User Cleanup Script
 *
 * Deletes ALL existing users and all related profile/session data,
 * then resets auto-increment counters so fresh IDs start from 1.
 *
 * Run from /server directory:
 *   node scripts/cleanup-users.js
 *
 * WARNING: This is IRREVERSIBLE. Run only in development/reset scenarios.
 */

const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(__dirname, '..', '.env.development') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const mysql = require('mysql2/promise');

const sslConfig = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

async function cleanup() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: 5,
    ssl: sslConfig,
    charset: 'utf8mb4',
    timezone: '+00:00',
  });

  console.log('\n🗑  Syllabrix User Cleanup\n');
  console.log('Connecting to:', process.env.DB_HOST, '/', process.env.DB_NAME);

  const conn = await pool.getConnection();

  try {
    // Disable FK checks so we can truncate in any order
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    const tablesToClear = [
      // Profile tables (user-linked)
      'student_profiles',
      'teacher_profiles',
      'institute_profiles',
      'parent_profiles',
      'professional_learner_profiles',
      'organization_profiles',
      'mentor_profiles',
      // Relation/activity tables
      'parent_child_links',
      'user_sessions',
      'mentorship_applications',
      'mentorship_sessions',
      'become_mentor_requests',
      // Social/content tables that belong to users
      'follows',
      'posts',
      'post_likes',
      'post_comments',
      'post_shares',
      'post_saves',
      'notifications',
      'messages',
      'user_badges',
      'user_streaks',
      'activity_log',
      'search_history',
      'skill_endorsements',
      'syllabrix_score_history',
      'user_experience_progress',
      'activity_completions',
      'experience_teams',
      'experience_team_members',
      'user_exam_selections',
      'user_syllabus_progress',
      'user_prep_bookmarks',
      'quiz_attempts',
      'job_applications',
      'teacher_ratings',
      'user_blocks',
      'reports',
      'live_class_attendees',
      // Finally users
      'users',
    ];

    let deleted = 0;
    for (const table of tablesToClear) {
      try {
        const [result] = await conn.query(`DELETE FROM ${table}`);
        if (result.affectedRows > 0) {
          console.log(`  ✓ ${table}: deleted ${result.affectedRows} row(s)`);
          deleted += result.affectedRows;
        }
      } catch (e) {
        // Table might not exist (feature not deployed yet) — skip silently
        if (e.code === 'ER_NO_SUCH_TABLE') {
          console.log(`  - ${table}: table not found, skipping`);
        } else {
          console.error(`  ✗ ${table}: ${e.message}`);
        }
      }
    }

    // Reset AUTO_INCREMENT on core tables
    const tablesWithAutoInc = [
      'users', 'student_profiles', 'teacher_profiles', 'institute_profiles',
      'parent_profiles', 'professional_learner_profiles', 'organization_profiles',
      'mentor_profiles', 'user_sessions', 'become_mentor_requests',
    ];
    for (const table of tablesWithAutoInc) {
      try {
        await conn.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
      } catch { /* skip if table doesn't exist */ }
    }

    // Re-enable FK checks
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log(`\n✅ Cleanup complete — ${deleted} total rows removed`);
    console.log('   All users deleted. Platform ready for fresh registrations.\n');

  } catch (err) {
    await conn.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    console.error('\n❌ Cleanup failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

cleanup();
