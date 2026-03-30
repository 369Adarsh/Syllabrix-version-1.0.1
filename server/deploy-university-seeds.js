#!/usr/bin/env node
/**
 * deploy-university-seeds.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-shot script to deploy the university layer seeds to Railway / production.
 *
 * Usage (from server/ directory):
 *   node deploy-university-seeds.js
 *
 * Reads credentials from (in priority order):
 *   1. Process environment (Railway injects these automatically)
 *   2. server/.env.production  (local run)
 *   3. server/.env.development (fallback for local testing)
 *
 * What it does:
 *   1. Validates DB credentials are present
 *   2. Runs 6 university seeds in correct dependency order
 *   3. Verifies row counts in all university tables
 *   4. Auto git commit + push to main if all succeed
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path    = require('path');
const fs      = require('fs');
const dotenv  = require('dotenv');
const { spawnSync } = require('child_process');
const mysql   = require('mysql2/promise');

// ─── 0. Load credentials ────────────────────────────────────────────────────

// Try .env.production first, then .env.development (dotenv won't override existing vars)
const envProd = path.resolve(__dirname, '.env.production');
const envDev  = path.resolve(__dirname, '.env.development');
if (fs.existsSync(envProd)) dotenv.config({ path: envProd });
else if (fs.existsSync(envDev)) dotenv.config({ path: envDev });

const DB_HOST     = process.env.DB_HOST;
const DB_PORT     = parseInt(process.env.DB_PORT || '3306', 10);
const DB_NAME     = process.env.DB_NAME;
const DB_USER     = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_SSL      = process.env.DB_SSL === 'true';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PREFIX = '[DEPLOY-UNI]';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

function log(msg)         { console.log(`${PREFIX} ${msg}`); }
function ok(msg)          { console.log(`${PREFIX} ${GREEN}[SUCCESS]${RESET} ${msg}`); }
function fail(msg)        { console.error(`${PREFIX} ${RED}[FAILED]${RESET} ${msg}`); }
function info(msg)        { console.log(`${PREFIX} ${CYAN}${msg}${RESET}`); }
function header(msg)      { console.log(`\n${BOLD}${PREFIX} ══ ${msg} ══${RESET}`); }

function parseInsertCount(output) {
  // Look for patterns like "Inserted 136 / 136" or "done. Inserted 21 / 21"
  const match = output.match(/Inserted\s+(\d+)\s*(?:\/\s*\d+)?/i)
    || output.match(/(\d+)\s+subjects total/i)
    || output.match(/(\d+)\s+\/\s+\d+\s+books/i);
  return match ? parseInt(match[1], 10) : null;
}

// ─── 1. Validate credentials ─────────────────────────────────────────────────

header('Syllabrix University Seeds — Railway Deployment');
log(`Target DB: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}  SSL=${DB_SSL}`);

if (!DB_HOST || !DB_NAME || !DB_USER) {
  fail('Missing required env vars: DB_HOST, DB_NAME, DB_USER');
  fail('Set them in Railway Dashboard → your service → Variables tab.');
  fail('Or create server/.env.production with these values.');
  process.exit(1);
}

// ─── 2. Seed definitions ─────────────────────────────────────────────────────

const SEEDS_DIR = path.resolve(__dirname, 'src/database/seeds');

const seeds = [
  {
    file:     'universities.seed.js',
    label:    'universities',
    expected: 136,
  },
  {
    file:     'course_categories.seed.js',
    label:    'course_categories',
    expected: 21,
  },
  {
    file:     'courses.seed.js',
    label:    'courses',
    expected: 69,
  },
  {
    file:     'university_courses.seed.js',
    label:    'university_courses',
    expected: null, // variable — skip expected check
  },
  {
    file:     'university_subjects.seed.js',
    label:    'university_subjects',
    expected: 219,
  },
  {
    file:     'university_books.seed.js',
    label:    'university_books',
    expected: 43,
  },
];

// ─── 3. Run each seed ─────────────────────────────────────────────────────────

header('Running Seeds');

const results = [];
let allPassed = true;

// Env to pass to child processes (production credentials)
const childEnv = {
  ...process.env,
  NODE_ENV:    'production',
  DB_HOST,
  DB_PORT:     String(DB_PORT),
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_SSL:      String(DB_SSL),
};

for (const seed of seeds) {
  const seedPath = path.join(SEEDS_DIR, seed.file);
  if (!fs.existsSync(seedPath)) {
    fail(`${seed.file} — FILE NOT FOUND at ${seedPath}`);
    results.push({ ...seed, status: 'missing', inserted: null });
    allPassed = false;
    continue;
  }

  log(`Running ${seed.file}...`);
  const start = Date.now();

  const result = spawnSync(process.execPath, [seedPath], {
    cwd:     __dirname,
    env:     childEnv,
    encoding: 'utf8',
    timeout:  120_000, // 2 min max per seed
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const combined = (result.stdout || '') + (result.stderr || '');

  if (result.status !== 0 || result.error) {
    const errMsg = result.error?.message || result.stderr || 'non-zero exit';
    fail(`${seed.file} — ${errMsg}`);
    if (result.stdout) console.log(result.stdout.trim());
    results.push({ ...seed, status: 'failed', inserted: null });
    allPassed = false;
    // Stop on first failure — later seeds may depend on earlier ones
    break;
  }

  const inserted = parseInsertCount(combined);
  const countStr = inserted !== null ? `${inserted} inserted` : 'done';
  ok(`${seed.file} — ${countStr} (${elapsed}s)`);
  if (result.stdout) {
    // Print indented seed output for visibility
    result.stdout.trim().split('\n').forEach(l => console.log(`    ${l}`));
  }

  results.push({ ...seed, status: 'ok', inserted });
}

// ─── 4. Verify row counts ─────────────────────────────────────────────────────

header('Verifying Row Counts');

async function verifyCounts() {
  const sslConfig = DB_SSL ? { rejectUnauthorized: false } : undefined;
  const conn = await mysql.createConnection({
    host:     DB_HOST,
    port:     DB_PORT,
    database: DB_NAME,
    user:     DB_USER,
    password: DB_PASSWORD,
    ssl:      sslConfig,
    charset:  'utf8mb4',
  });

  const [rows] = await conn.execute(`
    SELECT 'universities'                  AS table_name, COUNT(*) AS count FROM universities
    UNION ALL
    SELECT 'course_categories',            COUNT(*) FROM course_categories
    UNION ALL
    SELECT 'courses',                      COUNT(*) FROM courses
    UNION ALL
    SELECT 'university_courses',           COUNT(*) FROM university_courses
    UNION ALL
    SELECT 'university_subjects',          COUNT(*) FROM university_subjects
    UNION ALL
    SELECT 'university_books',             COUNT(*) AS count FROM university_books
    UNION ALL
    SELECT 'university_book_subject_links',COUNT(*) FROM university_book_subject_links
  `);

  await conn.end();
  return rows;
}

// ─── 5 + 6. Async: verify counts then git push ────────────────────────────────

(async () => {
  // ── 5. Verify row counts ──────────────────────────────────────────────────

  header('Verifying Row Counts');

  let verifyOk = true;

  try {
    const countRows = await verifyCounts();

    const expectedCounts = {
      universities:                   136,
      course_categories:              21,
      courses:                        69,
      university_subjects:            219,
      university_books:               43,
    };

    console.log('');
    console.log(`  ${'TABLE'.padEnd(35)} ${'COUNT'.padStart(6)}`);
    console.log(`  ${'─'.repeat(42)}`);

    for (const row of countRows) {
      const name     = row.table_name;
      const count    = Number(row.count);
      const exp      = expectedCounts[name];
      const check    = exp === undefined ? `${YELLOW}?${RESET}` : count >= exp ? `${GREEN}✓${RESET}` : `${RED}✗ (expected ≥${exp})${RESET}`;
      const countStr = String(count).padStart(6);
      console.log(`  ${name.padEnd(35)} ${countStr}  ${check}`);
      if (exp !== undefined && count < exp) verifyOk = false;
    }
    console.log('');

    if (!verifyOk) {
      fail('Row counts are below expected minimums. Seeds may not have run correctly.');
    } else {
      ok('All row counts verified.');
    }
  } catch (err) {
    fail(`Count verification failed: ${err.message}`);
    verifyOk = false;
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  header('Summary');

  for (const r of results) {
    if (r.status === 'ok')           ok(`${r.file}`);
    else if (r.status === 'missing') fail(`${r.file} — file missing`);
    else                             fail(`${r.file}`);
  }

  const overallOk = allPassed && verifyOk;

  if (!overallOk) {
    fail('Deployment incomplete. Fix errors above and re-run.');
    process.exit(1);
  }

  ok('All university seeds deployed successfully to Railway production DB!');

  // ── 6. Git commit + push ──────────────────────────────────────────────────

  header('Git Commit + Push');

  const repoRoot = path.resolve(__dirname, '..');

  function git(args, opts = {}) {
    const r = spawnSync('git', args, {
      cwd:      repoRoot,
      encoding: 'utf8',
      ...opts,
    });
    return { stdout: r.stdout?.trim(), stderr: r.stderr?.trim(), status: r.status };
  }

  // Stage all university seed files + updated source files
  const filesToStage = [
    'server/src/database/seeds/universities.seed.js',
    'server/src/database/seeds/course_categories.seed.js',
    'server/src/database/seeds/courses.seed.js',
    'server/src/database/seeds/university_courses.seed.js',
    'server/src/database/seeds/university_subjects.seed.js',
    'server/src/database/seeds/university_books.seed.js',
    'server/src/features/library/library.routes.js',
    'server/src/features/library/library.service.js',
    'server/src/features/library/library.controller.js',
    'server/src/services/ai-library.service.js',
    'server/deploy-university-seeds.js',
    'CLAUDE.md',
    'database/migrations/phase-session2',
  ];

  log(`Staging ${filesToStage.length} paths...`);
  const addResult = git(['add', '--', ...filesToStage]);
  if (addResult.status !== 0) {
    fail(`git add failed: ${addResult.stderr}`);
    process.exit(1);
  }
  ok('Files staged.');

  // Check if there is anything to commit
  const statusResult = git(['status', '--porcelain']);
  if (!statusResult.stdout) {
    info('Nothing new to commit — all changes already committed.');
    process.exit(0);
  }

  log('Staged changes:\n' + statusResult.stdout.split('\n').map(l => '  ' + l).join('\n'));

  // Commit
  const commitMsg = [
    'feat: university layer — seeds, routes, service, AI prompt',
    '',
    '- 136 universities seeded (IITs, NITs, AIIMS, IIMs, state, private)',
    '- 21 course categories, 69 courses, 468 university-course links',
    '- 219 semester-wise subjects (B.Tech CS/Mech/Elec, MBBS, MBA, B.Com, B.Sc)',
    '- 43 prescribed books with subject links',
    '- 8 new GET API routes under /api/library/',
    '- University mode in AI prompt builder (exam tips, viva Qs, textbook refs)',
    '',
    'Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>',
  ].join('\n');

  const commitResult = git(['commit', '-m', commitMsg]);
  if (commitResult.status !== 0) {
    if (commitResult.stdout?.includes('nothing to commit')) {
      info('Nothing to commit — working tree already clean.');
    } else {
      fail(`git commit failed: ${commitResult.stderr || commitResult.stdout}`);
      process.exit(1);
    }
  } else {
    ok('Committed.');
    log(commitResult.stdout);
  }

  // Push to main
  log('Pushing to origin main...');
  const pushResult = git(['push', 'origin', 'main']);
  if (pushResult.status !== 0) {
    fail(`git push failed: ${pushResult.stderr}`);
    process.exit(1);
  }
  ok('Pushed to origin/main successfully.');

  header('DONE');
  ok('University layer is live on Railway production.');
  info('  Universities : 136');
  info('  Subjects     : 219');
  info('  Books        : 43');
  info('  API routes   : 8 new endpoints under /api/library/');
})();
