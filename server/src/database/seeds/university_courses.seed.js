/**
 * Seed: university_courses.seed.js
 * Seeds which universities offer which courses.
 * Idempotent — INSERT IGNORE on (university_id, course_id).
 *
 * Run from server/ directory:
 *   node src/database/seeds/university_courses.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

async function getUniId(shortName) {
  const [rows] = await pool.execute(
    `SELECT id FROM universities WHERE short_name = ? LIMIT 1`, [shortName]
  );
  return rows[0]?.id || null;
}

async function getCourseId(shortName, spec) {
  let sql = `SELECT id FROM courses WHERE short_name = ?`;
  const params = [shortName];
  if (spec) { sql += ` AND specialization = ?`; params.push(spec); }
  else       { sql += ` AND (specialization IS NULL OR specialization = '')`; }
  sql += ` LIMIT 1`;
  const [rows] = await pool.execute(sql, params);
  return rows[0]?.id || null;
}

async function link(uniId, courseId, intake) {
  if (!uniId || !courseId) return;
  await pool.execute(
    `INSERT IGNORE INTO university_courses (university_id, course_id, intake, is_active) VALUES (?,?,?,1)`,
    [uniId, courseId, intake || null]
  );
}

async function run() {
  console.log('[SEED] university_courses.seed.js — starting...');

  // Pre-load commonly used course IDs
  const btechCS   = await getCourseId('B.Tech', 'Computer Science and Engineering');
  const btechMech = await getCourseId('B.Tech', 'Mechanical Engineering');
  const btechElec = await getCourseId('B.Tech', 'Electrical Engineering');
  const btechCivil= await getCourseId('B.Tech', 'Civil Engineering');
  const btechECE  = await getCourseId('B.Tech', 'Electronics and Communication Engineering');
  const btechChem = await getCourseId('B.Tech', 'Chemical Engineering');
  const barch     = await getCourseId('B.Arch', null);
  const mbbs      = await getCourseId('MBBS',   null);
  const mba       = await getCourseId('MBA',     null);
  const mtech     = await getCourseId('M.Tech',  null);
  const msc       = await getCourseId('M.Sc',    null);
  const bcom      = await getCourseId('B.Com',   null);
  const bsc       = await getCourseId('B.Sc',    null);
  const ba        = await getCourseId('BA',       null);
  const llb       = await getCourseId('LLB',      null);
  const bba       = await getCourseId('BBA',      null);
  const bca       = await getCourseId('BCA',      null);
  const bdes      = await getCourseId('B.Des',    null);
  const mba_iim   = await getCourseId('MBA',      null); // same as mba

  // ─── IITs — B.Tech + M.Tech ────────────────────────────────────────────────
  const iits = [
    'IIT Bombay','IIT Delhi','IIT Madras','IIT Kanpur','IIT Kharagpur',
    'IIT Roorkee','IIT Guwahati','IIT Hyderabad','IIT BHU','IIT Indore',
    'IIT Mandi','IIT Patna','IIT Jodhpur','IIT Gandhinagar','IIT Bhubaneswar',
    'IIT Ropar','IIT Tirupati','IIT Dhanbad','IIT Palakkad','IIT Jammu',
    'IIT Dharwad','IIT Bhilai','IIT Varanasi',
  ];
  for (const name of iits) {
    const uid = await getUniId(name);
    if (!uid) { console.warn(`  skip (not found): ${name}`); continue; }
    await link(uid, btechCS,    120);
    await link(uid, btechMech,  60);
    await link(uid, btechElec,  60);
    await link(uid, btechCivil, 40);
    await link(uid, btechECE,   60);
    await link(uid, btechChem,  40);
    await link(uid, mtech,      null);
    await link(uid, msc,        null);
  }

  // ─── NITs — B.Tech + M.Tech ────────────────────────────────────────────────
  const nits = [
    'NIT Trichy','NIT Warangal','NIT Surathkal','NIT Calicut','NIT Allahabad',
    'NIT Rourkela','NIT Jaipur','NIT Surat','NIT Kurukshetra','NIT Durgapur',
    'NIT Silchar','NIT Hamirpur','NIT Agartala','NIT Manipur','NIT Meghalaya',
    'NIT Mizoram','NIT Nagaland','NIT Sikkim','NIT Arunachal Pradesh',
    'NIT Goa','NIT Delhi','NIT Puducherry','NIT Uttarakhand','NIT Srinagar',
    'NIT Patna','NIT Raipur','NIT Bhopal','NIT Andhra Pradesh','NIT Nagpur',
    'NIT Jalandhar','NIT Yupia',
  ];
  for (const name of nits) {
    const uid = await getUniId(name);
    if (!uid) { console.warn(`  skip (not found): ${name}`); continue; }
    await link(uid, btechCS,    60);
    await link(uid, btechMech,  60);
    await link(uid, btechElec,  60);
    await link(uid, btechCivil, 60);
    await link(uid, btechECE,   60);
    await link(uid, btechChem,  30);
    await link(uid, mtech,      null);
  }

  // ─── AIIMS — MBBS ──────────────────────────────────────────────────────────
  const aiims = [
    'AIIMS Delhi','AIIMS Jodhpur','AIIMS Bhopal','AIIMS Patna',
    'AIIMS Raipur','AIIMS Rishikesh','AIIMS Bhubaneswar','AIIMS Nagpur',
  ];
  for (const name of aiims) {
    const uid = await getUniId(name);
    if (!uid) { console.warn(`  skip (not found): ${name}`); continue; }
    await link(uid, mbbs, 100);
  }

  // ─── IIMs — MBA ────────────────────────────────────────────────────────────
  const iims = [
    'IIM Ahmedabad','IIM Bangalore','IIM Calcutta','IIM Lucknow','IIM Kozhikode',
    'IIM Indore','IIM Shillong','IIM Rohtak','IIM Ranchi','IIM Raipur',
    'IIM Kashipur','IIM Trichy','IIM Udaipur','IIM Bodhgaya','IIM Amritsar',
    'IIM Nagpur','IIM Sambalpur','IIM Visakhapatnam','IIM Jammu','IIM Mumbai',
    'IIM Sirmaur',
  ];
  for (const name of iims) {
    const uid = await getUniId(name);
    if (!uid) { console.warn(`  skip (not found): ${name}`); continue; }
    await link(uid, mba, null);
  }

  // ─── Top Private — varied courses ──────────────────────────────────────────
  const privateMap = [
    { name: 'BITS Pilani',  courses: [btechCS, btechMech, btechElec, btechECE, btechChem, mtech] },
    { name: 'BITS Goa',     courses: [btechCS, btechMech, btechElec, btechECE] },
    { name: 'BITS Hyderabad',courses:[btechCS, btechMech, btechElec, btechECE, btechChem] },
    { name: 'VIT Vellore',  courses: [btechCS, btechMech, btechElec, btechECE, btechCivil, mtech, msc] },
    { name: 'VIT Chennai',  courses: [btechCS, btechMech, btechElec, btechECE] },
    { name: 'Manipal',      courses: [btechCS, btechMech, btechElec, btechECE, mbbs, bsc, mba] },
    { name: 'SRM',          courses: [btechCS, btechMech, btechElec, btechECE, btechCivil, mbbs] },
    { name: 'Amity',        courses: [btechCS, btechMech, btechElec, mba, bcom, ba, llb] },
    { name: 'SIU',          courses: [mba, llb, bba, bcom, ba] },
    { name: 'Christ',       courses: [bcom, ba, bca, bba, mba, msc] },
    { name: 'LPU',          courses: [btechCS, btechMech, btechElec, mba, bcom, bsc] },
    { name: 'CU',           courses: [btechCS, btechMech, btechElec, btechECE, mba] },
    { name: 'NMIMS',        courses: [mba, bcom, bba, btechCS] },
    { name: 'FLAME',        courses: [ba, bcom, bba, mba] },
    { name: 'Ashoka',       courses: [ba, bsc, mba] },
    { name: 'JGU',          courses: [llb, ba, bba, mba] },
    { name: 'SNU',          courses: [btechCS, btechMech, btechElec, msc, mba] },
    { name: 'APU',          courses: [ba, mba] },
    { name: 'NID',          courses: [bdes] },
    { name: 'MICA',         courses: [mba] },
  ];
  for (const entry of privateMap) {
    const uid = await getUniId(entry.name);
    if (!uid) { console.warn(`  skip (not found): ${entry.name}`); continue; }
    for (const cid of entry.courses) {
      if (cid) await link(uid, cid, null);
    }
  }

  // ─── State Universities ─────────────────────────────────────────────────────
  const stateMap = [
    { name: 'Mumbai Uni',  courses: [bcom, ba, bsc, llb, mba, msc] },
    { name: 'Pune Uni',    courses: [bcom, ba, bsc, llb, mba, btechCS] },
    { name: 'GU',          courses: [bcom, ba, bsc, llb, mba] },
    { name: 'Anna Uni',    courses: [btechCS, btechMech, btechElec, btechECE, btechCivil, mtech] },
    { name: 'OU',          courses: [ba, bcom, bsc, llb, mba] },
    { name: 'RU',          courses: [ba, bcom, bsc, llb, mba] },
    { name: 'LU',          courses: [ba, bcom, bsc, llb, mba] },
    { name: 'CU Kolkata',  courses: [ba, bcom, bsc, llb, mba] },
    { name: 'Madras Uni',  courses: [ba, bcom, bsc, llb, mba, msc] },
    { name: 'BU',          courses: [ba, bcom, bsc, llb, mba] },
    { name: 'Kerala Uni',  courses: [ba, bcom, bsc, llb, mba, msc] },
    { name: 'Mysore Uni',  courses: [ba, bcom, bsc, llb, mba] },
    { name: 'VU',          courses: [ba, bcom, bsc, llb] },
  ];
  for (const entry of stateMap) {
    const uid = await getUniId(entry.name);
    if (!uid) { console.warn(`  skip (not found): ${entry.name}`); continue; }
    for (const cid of entry.courses) {
      if (cid) await link(uid, cid, null);
    }
  }

  // ─── Central Universities ───────────────────────────────────────────────────
  const centralMap = [
    { name: 'DU',    courses: [ba, bcom, bsc, llb, mba, msc] },
    { name: 'JNU',   courses: [ba, msc, mba] },
    { name: 'BHU',   courses: [ba, bcom, bsc, btechCS, btechMech, mbbs, mba, llb] },
    { name: 'UoH',   courses: [ba, bsc, msc, mba] },
    { name: 'JU',    courses: [btechCS, btechMech, btechElec, btechECE, ba, msc] },
    { name: 'SPPU',  courses: [bcom, ba, bsc, llb, mba] },
    { name: 'JMI',   courses: [ba, bcom, bsc, btechCS, mba, llb] },
    { name: 'AMU',   courses: [ba, bcom, bsc, mbbs, llb, mba] },
    { name: 'TISS',  courses: [mba, ba] },
    { name: 'EFLU',  courses: [ba] },
  ];
  for (const entry of centralMap) {
    const uid = await getUniId(entry.name);
    if (!uid) { console.warn(`  skip (not found): ${entry.name}`); continue; }
    for (const cid of entry.courses) {
      if (cid) await link(uid, cid, null);
    }
  }

  console.log('[SEED] university_courses.seed.js — done.');
  await pool.end();
}

run().catch(err => {
  console.error('[SEED] university_courses.seed.js FAILED:', err.message);
  process.exit(1);
});
