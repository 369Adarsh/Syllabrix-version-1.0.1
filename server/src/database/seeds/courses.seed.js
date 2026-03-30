/**
 * Seed: courses.seed.js
 * Seeds all major Indian university courses with level + duration.
 * Idempotent — INSERT IGNORE on (short_name, level, specialization).
 *
 * Run from server/ directory:
 *   node src/database/seeds/courses.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

// helper: fetch category id by name
async function getCatId(name) {
  const [rows] = await pool.execute(
    `SELECT id FROM course_categories WHERE name = ? LIMIT 1`, [name]
  );
  if (!rows.length) throw new Error(`course_categories row not found: ${name}`);
  return rows[0].id;
}

async function run() {
  console.log('[SEED] courses.seed.js — starting...');

  // Pre-load category IDs
  const catIds = {};
  const catNames = [
    'Engineering','Medical','Dental','Nursing','Pharmacy','Ayurveda','Homeopathy',
    'Science','Commerce','Arts','Law','Education','Management','Agriculture',
    'Design','Architecture','Hotel Management','Media & Journalism',
    'Social Work','Fine Arts','Physical Education',
  ];
  for (const n of catNames) catIds[n] = await getCatId(n);

  const courses = [
    // ── BACHELOR ──────────────────────────────────────────────────────────────
    // Engineering
    { cat: 'Engineering', name: 'Bachelor of Technology', short: 'B.Tech', level: 'bachelor', years: 4, spec: 'Computer Science and Engineering' },
    { cat: 'Engineering', name: 'Bachelor of Technology', short: 'B.Tech', level: 'bachelor', years: 4, spec: 'Mechanical Engineering' },
    { cat: 'Engineering', name: 'Bachelor of Technology', short: 'B.Tech', level: 'bachelor', years: 4, spec: 'Electrical Engineering' },
    { cat: 'Engineering', name: 'Bachelor of Technology', short: 'B.Tech', level: 'bachelor', years: 4, spec: 'Civil Engineering' },
    { cat: 'Engineering', name: 'Bachelor of Technology', short: 'B.Tech', level: 'bachelor', years: 4, spec: 'Electronics and Communication Engineering' },
    { cat: 'Engineering', name: 'Bachelor of Technology', short: 'B.Tech', level: 'bachelor', years: 4, spec: 'Chemical Engineering' },
    { cat: 'Engineering', name: 'Bachelor of Engineering', short: 'B.E',   level: 'bachelor', years: 4, spec: null },
    { cat: 'Architecture',name: 'Bachelor of Architecture',short: 'B.Arch',level: 'bachelor', years: 5, spec: null },
    // Medical
    { cat: 'Medical',    name: 'Bachelor of Medicine and Bachelor of Surgery', short: 'MBBS',       level: 'bachelor', years: 5, spec: null },
    { cat: 'Dental',     name: 'Bachelor of Dental Surgery',                  short: 'BDS',        level: 'bachelor', years: 5, spec: null },
    { cat: 'Pharmacy',   name: 'Bachelor of Pharmacy',                        short: 'B.Pharm',    level: 'bachelor', years: 4, spec: null },
    { cat: 'Nursing',    name: 'Bachelor of Science Nursing',                 short: 'B.Sc Nursing',level:'bachelor', years: 4, spec: null },
    { cat: 'Ayurveda',   name: 'Bachelor of Ayurvedic Medicine and Surgery',  short: 'BAMS',       level: 'bachelor', years: 5, spec: null },
    { cat: 'Homeopathy', name: 'Bachelor of Homeopathic Medicine and Surgery',short: 'BHMS',       level: 'bachelor', years: 5, spec: null },
    { cat: 'Medical',    name: 'Bachelor of Physiotherapy',                   short: 'BPT',        level: 'bachelor', years: 4, spec: null },
    // Science
    { cat: 'Science',    name: 'Bachelor of Science', short: 'B.Sc', level: 'bachelor', years: 3, spec: 'Physics'   },
    { cat: 'Science',    name: 'Bachelor of Science', short: 'B.Sc', level: 'bachelor', years: 3, spec: 'Chemistry' },
    { cat: 'Science',    name: 'Bachelor of Science', short: 'B.Sc', level: 'bachelor', years: 3, spec: 'Mathematics'},
    { cat: 'Science',    name: 'Bachelor of Science', short: 'B.Sc', level: 'bachelor', years: 3, spec: 'Biology'   },
    { cat: 'Science',    name: 'Bachelor of Science', short: 'B.Sc', level: 'bachelor', years: 3, spec: 'Computer Science' },
    // Commerce
    { cat: 'Commerce',   name: 'Bachelor of Commerce', short: 'B.Com', level: 'bachelor', years: 3, spec: null },
    { cat: 'Commerce',   name: 'Bachelor of Commerce', short: 'B.Com', level: 'bachelor', years: 3, spec: 'Accounting and Finance' },
    { cat: 'Commerce',   name: 'Bachelor of Commerce', short: 'B.Com', level: 'bachelor', years: 3, spec: 'Computer Applications' },
    // Arts
    { cat: 'Arts',       name: 'Bachelor of Arts', short: 'BA', level: 'bachelor', years: 3, spec: 'History'     },
    { cat: 'Arts',       name: 'Bachelor of Arts', short: 'BA', level: 'bachelor', years: 3, spec: 'Economics'   },
    { cat: 'Arts',       name: 'Bachelor of Arts', short: 'BA', level: 'bachelor', years: 3, spec: 'Political Science' },
    { cat: 'Arts',       name: 'Bachelor of Arts', short: 'BA', level: 'bachelor', years: 3, spec: 'English'     },
    { cat: 'Arts',       name: 'Bachelor of Arts', short: 'BA', level: 'bachelor', years: 3, spec: 'Sociology'   },
    { cat: 'Arts',       name: 'Bachelor of Arts', short: 'BA', level: 'bachelor', years: 3, spec: 'Psychology'  },
    // Law
    { cat: 'Law',        name: 'Bachelor of Laws',    short: 'LLB',    level: 'bachelor', years: 3, spec: null },
    { cat: 'Law',        name: 'Bachelor of Arts and Bachelor of Laws', short: 'BA LLB', level: 'integrated', years: 5, spec: null },
    // Management
    { cat: 'Management', name: 'Bachelor of Business Administration', short: 'BBA', level: 'bachelor', years: 3, spec: null },
    // Technology
    { cat: 'Engineering', name: 'Bachelor of Computer Applications', short: 'BCA', level: 'bachelor', years: 3, spec: null },
    // Education
    { cat: 'Education',  name: 'Bachelor of Education', short: 'B.Ed', level: 'bachelor', years: 2, spec: null },
    // Others
    { cat: 'Hotel Management', name: 'Bachelor of Hotel Management', short: 'BHM', level: 'bachelor', years: 3, spec: null },
    { cat: 'Media & Journalism', name: 'Bachelor of Journalism and Mass Communication', short: 'BJMC', level: 'bachelor', years: 3, spec: null },
    { cat: 'Design',     name: 'Bachelor of Design', short: 'B.Des', level: 'bachelor', years: 4, spec: null },
    { cat: 'Fine Arts',  name: 'Bachelor of Fine Arts', short: 'BFA', level: 'bachelor', years: 4, spec: null },
    { cat: 'Social Work',name: 'Bachelor of Social Work', short: 'BSW', level: 'bachelor', years: 3, spec: null },
    { cat: 'Agriculture',name: 'Bachelor of Science Agriculture', short: 'B.Sc Agriculture', level: 'bachelor', years: 4, spec: null },

    // ── MASTER ────────────────────────────────────────────────────────────────
    { cat: 'Engineering', name: 'Master of Technology', short: 'M.Tech', level: 'master', years: 2, spec: 'Computer Science and Engineering' },
    { cat: 'Engineering', name: 'Master of Technology', short: 'M.Tech', level: 'master', years: 2, spec: 'Mechanical Engineering' },
    { cat: 'Engineering', name: 'Master of Engineering', short: 'M.E',   level: 'master', years: 2, spec: null },
    { cat: 'Architecture',name: 'Master of Architecture', short: 'M.Arch', level: 'master', years: 2, spec: null },
    { cat: 'Medical',    name: 'Doctor of Medicine', short: 'MD',          level: 'master', years: 3, spec: null },
    { cat: 'Medical',    name: 'Master of Surgery',  short: 'MS Surgery',  level: 'master', years: 3, spec: null },
    { cat: 'Dental',     name: 'Master of Dental Surgery', short: 'MDS',   level: 'master', years: 3, spec: null },
    { cat: 'Pharmacy',   name: 'Master of Pharmacy', short: 'M.Pharm',     level: 'master', years: 2, spec: null },
    { cat: 'Nursing',    name: 'Master of Science Nursing', short: 'M.Sc Nursing', level: 'master', years: 2, spec: null },
    { cat: 'Science',    name: 'Master of Science', short: 'M.Sc', level: 'master', years: 2, spec: 'Physics'   },
    { cat: 'Science',    name: 'Master of Science', short: 'M.Sc', level: 'master', years: 2, spec: 'Chemistry' },
    { cat: 'Science',    name: 'Master of Science', short: 'M.Sc', level: 'master', years: 2, spec: 'Mathematics'},
    { cat: 'Commerce',   name: 'Master of Commerce', short: 'M.Com', level: 'master', years: 2, spec: null },
    { cat: 'Arts',       name: 'Master of Arts', short: 'MA', level: 'master', years: 2, spec: 'History'   },
    { cat: 'Arts',       name: 'Master of Arts', short: 'MA', level: 'master', years: 2, spec: 'Economics' },
    { cat: 'Law',        name: 'Master of Laws', short: 'LLM', level: 'master', years: 1, spec: null },
    { cat: 'Management', name: 'Master of Business Administration', short: 'MBA', level: 'master', years: 2, spec: null },
    { cat: 'Management', name: 'Master of Business Administration', short: 'MBA', level: 'master', years: 2, spec: 'Finance' },
    { cat: 'Management', name: 'Master of Business Administration', short: 'MBA', level: 'master', years: 2, spec: 'Marketing' },
    { cat: 'Management', name: 'Master of Business Administration', short: 'MBA', level: 'master', years: 2, spec: 'Human Resource Management' },
    { cat: 'Engineering', name: 'Master of Computer Applications', short: 'MCA', level: 'master', years: 2, spec: null },
    { cat: 'Education',  name: 'Master of Education', short: 'M.Ed', level: 'master', years: 2, spec: null },
    { cat: 'Media & Journalism', name: 'Master of Journalism and Mass Communication', short: 'MJMC', level: 'master', years: 2, spec: null },
    { cat: 'Design',     name: 'Master of Design', short: 'M.Des', level: 'master', years: 2, spec: null },
    { cat: 'Fine Arts',  name: 'Master of Fine Arts', short: 'MFA', level: 'master', years: 2, spec: null },
    { cat: 'Social Work',name: 'Master of Social Work', short: 'MSW', level: 'master', years: 2, spec: null },

    // ── INTEGRATED ────────────────────────────────────────────────────────────
    { cat: 'Engineering', name: 'Bachelor and Master of Technology', short: 'B.Tech + M.Tech', level: 'integrated', years: 5, spec: 'Computer Science and Engineering' },
    { cat: 'Science',    name: 'Bachelor and Master of Science', short: 'B.Sc + M.Sc', level: 'integrated', years: 5, spec: null },
    { cat: 'Medical',    name: 'MBBS and MD', short: 'MBBS + MD', level: 'integrated', years: 7, spec: null },
  ];

  let inserted = 0;
  for (const c of courses) {
    const catId = catIds[c.cat];
    if (!catId) { console.warn(`  [SKIP] Unknown category: ${c.cat}`); continue; }
    const [result] = await pool.execute(
      `INSERT IGNORE INTO courses
         (course_category_id, name, short_name, level, duration_years, specialization, is_active)
       VALUES (?,?,?,?,?,?,1)`,
      [catId, c.name, c.short || null, c.level, c.years || null, c.spec || null]
    );
    if (result.affectedRows > 0) inserted++;
  }

  console.log(`[SEED] courses.seed.js — done. Inserted ${inserted} / ${courses.length}.`);
  await pool.end();
}

run().catch(err => {
  console.error('[SEED] courses.seed.js FAILED:', err.message);
  process.exit(1);
});
