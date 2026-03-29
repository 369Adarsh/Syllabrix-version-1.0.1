/**
 * Seed: competitive_subjects.seed.js
 * Seeds all subjects for all exam categories.
 * Idempotent — skips existing rows (checks by exam_category_id + name).
 *
 * Run from server/ directory (run exam_categories.seed.js first):
 *   node src/database/seeds/competitive_subjects.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

// ── Helper ────────────────────────────────────────────────────────────────────

async function getExamId(code, examMap) {
  return examMap.get(code) || null;
}

async function seedSubject(examId, subject, existingSet) {
  const key = `${examId}|${subject.name}`;
  if (existingSet.has(key)) return;
  await pool.execute(
    `INSERT IGNORE INTO competitive_subjects
       (exam_category_id, name, parent_subject, sub_category, description,
        syllabus_url, weightage_percent, is_active)
     VALUES (?,?,?,?,?,?,?,1)`,
    [
      examId,
      subject.name,
      subject.parent_subject || null,
      subject.sub_category   || null,
      subject.description    || null,
      subject.syllabus_url   || null,
      subject.weightage      || null,
    ]
  );
}

// ── Subject definitions per exam ──────────────────────────────────────────────

const UPSC_IAS_SUBJECTS = [
  { name: 'Ancient India',                   parent_subject: 'History',       sub_category: 'ancient',   weightage: 8 },
  { name: 'Medieval India',                  parent_subject: 'History',       sub_category: 'medieval',  weightage: 6 },
  { name: 'Modern India',                    parent_subject: 'History',       sub_category: 'modern',    weightage: 12 },
  { name: 'World History',                   parent_subject: 'History',       sub_category: 'world',     weightage: 5 },
  { name: 'Indian Art & Culture',            parent_subject: 'History',       sub_category: 'culture',   weightage: 8 },
  { name: 'Indian Geography',                parent_subject: 'Geography',     sub_category: 'indian',    weightage: 10 },
  { name: 'World Geography',                 parent_subject: 'Geography',     sub_category: 'world',     weightage: 6 },
  { name: 'Physical Geography',              parent_subject: 'Geography',     sub_category: 'physical',  weightage: 5 },
  { name: 'Human & Economic Geography',      parent_subject: 'Geography',     sub_category: 'human',     weightage: 4 },
  { name: 'Indian Constitution & Governance',parent_subject: 'Polity',        sub_category: null,        weightage: 15 },
  { name: 'Parliamentary System',            parent_subject: 'Polity',        sub_category: null,        weightage: 5 },
  { name: 'Indian Economy',                  parent_subject: 'Economy',       sub_category: null,        weightage: 12 },
  { name: 'Economic Survey & Budget',        parent_subject: 'Economy',       sub_category: null,        weightage: 5 },
  { name: 'Environment & Ecology',           parent_subject: 'Environment',   sub_category: null,        weightage: 8 },
  { name: 'Science & Technology',            parent_subject: 'Science',       sub_category: null,        weightage: 6 },
  { name: 'Ethics, Integrity & Aptitude',    parent_subject: 'Ethics',        sub_category: null,        weightage: 10 },
  { name: 'National & International Events', parent_subject: 'Current Affairs',sub_category: null,       weightage: 15 },
  { name: 'Disaster Management',             parent_subject: 'Internal Security', sub_category: null,    weightage: 3 },
  { name: 'Internal Security',               parent_subject: 'Internal Security', sub_category: null,    weightage: 4 },
  { name: 'Social Justice & Welfare',        parent_subject: 'Social Issues', sub_category: null,        weightage: 5 },
];

const JEE_SUBJECTS = [
  { name: 'Mechanics',                    parent_subject: 'Physics',     sub_category: null,     weightage: 25 },
  { name: 'Thermodynamics',               parent_subject: 'Physics',     sub_category: null,     weightage: 10 },
  { name: 'Electromagnetism',             parent_subject: 'Physics',     sub_category: null,     weightage: 20 },
  { name: 'Optics & Modern Physics',      parent_subject: 'Physics',     sub_category: null,     weightage: 15 },
  { name: 'Physical Chemistry',           parent_subject: 'Chemistry',   sub_category: 'physical',  weightage: 35 },
  { name: 'Organic Chemistry',            parent_subject: 'Chemistry',   sub_category: 'organic',   weightage: 35 },
  { name: 'Inorganic Chemistry',          parent_subject: 'Chemistry',   sub_category: 'inorganic', weightage: 30 },
  { name: 'Algebra',                      parent_subject: 'Mathematics', sub_category: null,     weightage: 30 },
  { name: 'Calculus',                     parent_subject: 'Mathematics', sub_category: null,     weightage: 25 },
  { name: 'Coordinate Geometry',          parent_subject: 'Mathematics', sub_category: null,     weightage: 20 },
  { name: 'Trigonometry & Vectors',       parent_subject: 'Mathematics', sub_category: null,     weightage: 15 },
];

const NEET_SUBJECTS = [
  { name: 'NEET Physics',                 parent_subject: 'Physics',   sub_category: null,    weightage: 25 },
  { name: 'Physical Chemistry (NEET)',    parent_subject: 'Chemistry', sub_category: 'physical', weightage: 12 },
  { name: 'Organic Chemistry (NEET)',     parent_subject: 'Chemistry', sub_category: 'organic',  weightage: 15 },
  { name: 'Inorganic Chemistry (NEET)',   parent_subject: 'Chemistry', sub_category: 'inorganic',weightage: 8 },
  { name: 'Botany',                       parent_subject: 'Biology',   sub_category: null,    weightage: 25 },
  { name: 'Zoology',                      parent_subject: 'Biology',   sub_category: null,    weightage: 25 },
];

const SSC_CGL_SUBJECTS = [
  { name: 'Quantitative Aptitude',                parent_subject: 'Mathematics', sub_category: null, weightage: 25 },
  { name: 'Verbal & Non-Verbal Reasoning',        parent_subject: 'Reasoning',   sub_category: null, weightage: 25 },
  { name: 'English Comprehension & Grammar',      parent_subject: 'English',     sub_category: null, weightage: 25 },
  { name: 'General Awareness (History, Geo, Sci)',parent_subject: 'GK',          sub_category: null, weightage: 25 },
];

const BANKING_SUBJECTS = [
  { name: 'Quantitative Aptitude (Banking)',  parent_subject: 'Mathematics',  sub_category: null, weightage: 20 },
  { name: 'Logical & Verbal Reasoning',       parent_subject: 'Reasoning',    sub_category: null, weightage: 20 },
  { name: 'English Language',                 parent_subject: 'English',      sub_category: null, weightage: 20 },
  { name: 'General Awareness — Banking & CA', parent_subject: 'GK',           sub_category: null, weightage: 20 },
  { name: 'Computer Awareness',               parent_subject: 'Computer',     sub_category: null, weightage: 10 },
  { name: 'Data Interpretation',              parent_subject: 'Mathematics',  sub_category: null, weightage: 10 },
];

const NDA_CDS_SUBJECTS = [
  { name: 'Mathematics (Defence)',             parent_subject: 'Mathematics',    sub_category: null, weightage: 30 },
  { name: 'English (Defence)',                 parent_subject: 'General Ability',sub_category: null, weightage: 20 },
  { name: 'Physics (Defence)',                 parent_subject: 'General Ability',sub_category: null, weightage: 10 },
  { name: 'Chemistry (Defence)',               parent_subject: 'General Ability',sub_category: null, weightage: 8 },
  { name: 'History & Polity (Defence)',        parent_subject: 'General Ability',sub_category: null, weightage: 12 },
  { name: 'Geography (Defence)',               parent_subject: 'General Ability',sub_category: null, weightage: 10 },
  { name: 'Current Affairs (Defence)',         parent_subject: 'General Ability',sub_category: null, weightage: 10 },
];

// State PSC subjects generator
function buildStatePSCSubjects(stateName) {
  return [
    { name: 'General Studies — History',              parent_subject: 'History',   sub_category: 'national', weightage: null },
    { name: 'General Studies — Geography',            parent_subject: 'Geography', sub_category: 'national', weightage: null },
    { name: 'General Studies — Polity & Governance',  parent_subject: 'Polity',    sub_category: null,       weightage: null },
    { name: 'General Studies — Economy',              parent_subject: 'Economy',   sub_category: null,       weightage: null },
    { name: 'General Studies — Science & Technology', parent_subject: 'Science',   sub_category: null,       weightage: null },
    { name: 'General Studies — Current Affairs',      parent_subject: 'Current Affairs', sub_category: null, weightage: null },
    { name: `${stateName} History & Culture`,         parent_subject: 'State Specific', sub_category: 'state_history', weightage: null },
    { name: `${stateName} Geography`,                 parent_subject: 'State Specific', sub_category: 'state_geography', weightage: null },
    { name: `${stateName} Culture & Heritage`,        parent_subject: 'State Specific', sub_category: 'state_culture', weightage: null },
    { name: `${stateName} Economy & Development`,     parent_subject: 'State Specific', sub_category: 'state_economy', weightage: null },
  ];
}

const STATE_PSC_LIST = [
  { code: 'GPSC',  state: 'Gujarat'          },
  { code: 'MPSC',  state: 'Maharashtra'      },
  { code: 'UPPSC', state: 'Uttar Pradesh'    },
  { code: 'TNPSC', state: 'Tamil Nadu'       },
  { code: 'KPSC',  state: 'Karnataka'        },
  { code: 'RPSC',  state: 'Rajasthan'        },
  { code: 'BPSC',  state: 'Bihar'            },
  { code: 'MPPSC', state: 'Madhya Pradesh'   },
  { code: 'WBPSC', state: 'West Bengal'      },
  { code: 'HPSC',  state: 'Haryana'          },
  { code: 'PPSC',  state: 'Punjab'           },
  { code: 'APPSC', state: 'Andhra Pradesh'   },
  { code: 'TSPSC', state: 'Telangana'        },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log('[SEED] competitive_subjects.seed.js — starting...');

  // Load all exam_categories into a map
  const [examRows] = await pool.execute('SELECT id, code FROM exam_categories');
  const examMap = new Map(examRows.map(r => [r.code, r.id]));
  console.log(`[SEED] Loaded ${examMap.size} exam categories.`);

  // Load existing subjects to skip duplicates
  const [existingRows] = await pool.execute('SELECT exam_category_id, name FROM competitive_subjects');
  const existingSet = new Set(existingRows.map(r => `${r.exam_category_id}|${r.name}`));

  let count = 0;

  // UPSC
  const upscId = examMap.get('UPSC_IAS');
  if (upscId) {
    for (const s of UPSC_IAS_SUBJECTS) { await seedSubject(upscId, s, existingSet); count++; }
    console.log(`[SEED] UPSC_IAS subjects done.`);
  }

  // JEE Main + Adv (same subjects)
  for (const code of ['JEE_MAIN', 'JEE_ADV']) {
    const id = examMap.get(code);
    if (id) {
      for (const s of JEE_SUBJECTS) { await seedSubject(id, s, existingSet); count++; }
      console.log(`[SEED] ${code} subjects done.`);
    }
  }

  // NEET
  const neetId = examMap.get('NEET_UG');
  if (neetId) {
    for (const s of NEET_SUBJECTS) { await seedSubject(neetId, s, existingSet); count++; }
    console.log(`[SEED] NEET_UG subjects done.`);
  }

  // SSC CGL
  const sscId = examMap.get('SSC_CGL');
  if (sscId) {
    for (const s of SSC_CGL_SUBJECTS) { await seedSubject(sscId, s, existingSet); count++; }
    console.log(`[SEED] SSC_CGL subjects done.`);
  }

  // Banking (SBI_PO, IBPS_PO) — same subjects
  for (const code of ['SBI_PO', 'IBPS_PO']) {
    const id = examMap.get(code);
    if (id) {
      for (const s of BANKING_SUBJECTS) { await seedSubject(id, s, existingSet); count++; }
      console.log(`[SEED] ${code} subjects done.`);
    }
  }

  // NDA + CDS — same subjects
  for (const code of ['NDA', 'CDS']) {
    const id = examMap.get(code);
    if (id) {
      for (const s of NDA_CDS_SUBJECTS) { await seedSubject(id, s, existingSet); count++; }
      console.log(`[SEED] ${code} subjects done.`);
    }
  }

  // All State PSCs
  for (const { code, state } of STATE_PSC_LIST) {
    const id = examMap.get(code);
    if (!id) { console.warn(`[SEED] Exam ${code} not found, skipping.`); continue; }
    const stateSubjects = buildStatePSCSubjects(state);
    for (const s of stateSubjects) { await seedSubject(id, s, existingSet); count++; }
    console.log(`[SEED] ${code} (${state}) subjects done.`);
  }

  console.log(`[SEED] competitive_subjects.seed.js — complete. Attempted ~${count} inserts.`);
  await pool.end();
}

run().catch(err => {
  console.error('[SEED] competitive_subjects.seed.js FAILED:', err.message);
  process.exit(1);
});
