/**
 * Rebuilds mock test question_ids from the current live question bank.
 * Run this after question generation to ensure mocks reference valid IDs.
 *
 * Usage: node scripts/rebuild-mock-tests.js
 */
require('../src/config/env');
const { pool } = require('../src/database/connection');

async function main() {
  const [mocks] = await pool.query('SELECT * FROM jee_mock_tests WHERE is_published = 1');
  console.log(`\n🔧 Rebuilding ${mocks.length} mock tests...\n`);

  for (const mock of mocks) {
    const raw = mock.question_ids || '';
    let currentIds;
    try {
      // Try JSON parse first, fall back to comma-separated
      currentIds = typeof raw === 'string' && raw.startsWith('[')
        ? JSON.parse(raw)
        : String(raw).split(',').map(Number).filter(Boolean);
    } catch { currentIds = []; }

    // Verify which IDs still exist
    let validIds = [];
    if (currentIds.length > 0) {
      const placeholders = currentIds.map(() => '?').join(',');
      const [existing] = await pool.query(
        `SELECT id FROM jee_questions WHERE id IN (${placeholders}) AND is_active = 1`,
        currentIds
      );
      validIds = existing.map(r => r.id);
    }

    const needed = mock.total_questions;
    const missing = needed - validIds.length;

    if (missing > 0) {
      // Pull fresh random questions excluding already-included ones
      const excludeClause = validIds.length > 0
        ? `AND id NOT IN (${validIds.map(() => '?').join(',')})` : '';
      const [fresh] = await pool.query(
        `SELECT id FROM jee_questions WHERE is_active = 1 ${excludeClause} ORDER BY RAND() LIMIT ?`,
        [...validIds, missing]
      );
      validIds = [...validIds, ...fresh.map(r => r.id)];
    }

    // Shuffle for variety
    for (let i = validIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [validIds[i], validIds[j]] = [validIds[j], validIds[i]];
    }

    const finalIds = validIds.slice(0, needed);
    const totalMarks = finalIds.length * 4;

    await pool.query(
      'UPDATE jee_mock_tests SET question_ids = ?, total_questions = ?, total_marks = ? WHERE id = ?',
      [JSON.stringify(finalIds), finalIds.length, totalMarks, mock.id]
    );

    console.log(`✅ Mock #${mock.id} "${mock.title}" — valid: ${finalIds.length}/${needed}`);
  }

  const [total] = await pool.query('SELECT COUNT(*) as cnt FROM jee_questions WHERE is_active = 1');
  console.log(`\n📊 Total active questions: ${total[0].cnt}`);
  console.log('✅ All mock tests rebuilt.');
  pool.end();
}

main().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
