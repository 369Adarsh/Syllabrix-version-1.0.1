// Syllabrix PrepSmart — Seed Exam Categories + Sample Exams
// Run: cd server && node src/database/seed-prep.js

const { pool, testConnection } = require('./connection');

const seedPrep = async () => {
  console.log('\\n========================================');
  console.log('  PrepSmart Seed Runner');
  console.log('========================================\\n');

  const connected = await testConnection();
  if (!connected) { console.error('DB not reachable.'); process.exit(1); }

  // ---- CATEGORIES ----
  const cats = [
    { name: 'Government & Civil Services', slug: 'government', icon_emoji: '🏛️', level: 0, order: 1 },
    { name: 'Banking & Insurance', slug: 'banking', icon_emoji: '🏦', level: 0, order: 2 },
    { name: 'Board Exams', slug: 'board-exams', icon_emoji: '📝', level: 0, order: 3 },
    { name: 'Entrance Exams', slug: 'entrance-exams', icon_emoji: '🎓', level: 0, order: 4 },
    { name: 'Professional Exams', slug: 'professional', icon_emoji: '💼', level: 0, order: 5 },
  ];

  console.log('  Creating categories...');
  const catIds = {};
  for (const c of cats) {
    try {
      const [existing] = await pool.query('SELECT id FROM exam_categories WHERE slug = ?', [c.slug]);
      if (existing.length > 0) { catIds[c.slug] = existing[0].id; continue; }
      const [r] = await pool.query('INSERT INTO exam_categories (name,slug,icon_emoji,level,display_order) VALUES (?,?,?,?,?)',
        [c.name, c.slug, c.icon_emoji, c.level, c.order]);
      catIds[c.slug] = r.insertId;
      console.log('    \u2713 ' + c.name);
    } catch (e) { console.error('    \u2717 ' + c.name + ': ' + e.message); }
  }

  // Sub-categories
  const subCats = [
    { name: 'UPSC', slug: 'upsc', parent: 'government', icon_emoji: '🇮🇳', order: 1 },
    { name: 'SSC', slug: 'ssc', parent: 'government', icon_emoji: '📋', order: 2 },
    { name: 'Railway', slug: 'railway', parent: 'government', icon_emoji: '🚂', order: 3 },
    { name: 'State PSC', slug: 'state-psc', parent: 'government', icon_emoji: '🏢', order: 4 },
    { name: 'IBPS', slug: 'ibps', parent: 'banking', icon_emoji: '🏧', order: 1 },
    { name: 'SBI', slug: 'sbi', parent: 'banking', icon_emoji: '🏦', order: 2 },
    { name: 'RBI', slug: 'rbi', parent: 'banking', icon_emoji: '💰', order: 3 },
    { name: 'Class 10', slug: 'class-10', parent: 'board-exams', icon_emoji: '📖', order: 1 },
    { name: 'Class 12', slug: 'class-12', parent: 'board-exams', icon_emoji: '📚', order: 2 },
    { name: 'Engineering', slug: 'engineering', parent: 'entrance-exams', icon_emoji: '⚙️', order: 1 },
    { name: 'Medical', slug: 'medical', parent: 'entrance-exams', icon_emoji: '🩺', order: 2 },
    { name: 'Law', slug: 'law', parent: 'entrance-exams', icon_emoji: '⚖️', order: 3 },
    { name: 'MBA', slug: 'mba', parent: 'entrance-exams', icon_emoji: '📊', order: 4 },
    { name: 'Defence', slug: 'defence', parent: 'entrance-exams', icon_emoji: '🎖️', order: 5 },
    { name: 'Teaching', slug: 'teaching', parent: 'entrance-exams', icon_emoji: '👩‍🏫', order: 6 },
  ];

  for (const sc of subCats) {
    try {
      const [existing] = await pool.query('SELECT id FROM exam_categories WHERE slug = ?', [sc.slug]);
      if (existing.length > 0) { catIds[sc.slug] = existing[0].id; continue; }
      const [r] = await pool.query('INSERT INTO exam_categories (name,slug,parent_id,level,icon_emoji,display_order) VALUES (?,?,?,1,?,?)',
        [sc.name, sc.slug, catIds[sc.parent], sc.icon_emoji, sc.order]);
      catIds[sc.slug] = r.insertId;
      console.log('    \u2713 ' + sc.name);
    } catch (e) {}
  }

  // ---- EXAMS ----
  console.log('  Creating exams...');
  const exams = [
    { cat: 'upsc', name: 'UPSC CSE', slug: 'upsc-cse', full_name: 'Union Public Service Commission - Civil Services Examination', body: 'UPSC', desc: 'India\'s premier civil services exam for IAS, IPS, IFS officers.', web: 'https://upsc.gov.in', freq: 'yearly' },
    { cat: 'ssc', name: 'SSC CGL', slug: 'ssc-cgl', full_name: 'Staff Selection Commission - Combined Graduate Level', body: 'SSC', desc: 'For recruitment to Group B and C posts in government.', web: 'https://ssc.nic.in', freq: 'yearly' },
    { cat: 'ssc', name: 'SSC CHSL', slug: 'ssc-chsl', full_name: 'SSC Combined Higher Secondary Level', body: 'SSC', desc: 'For LDC, DEO, and other 12th-pass government posts.', web: 'https://ssc.nic.in', freq: 'yearly' },
    { cat: 'ibps', name: 'IBPS PO', slug: 'ibps-po', full_name: 'Institute of Banking Personnel Selection - Probationary Officer', body: 'IBPS', desc: 'Recruitment exam for Probationary Officers in public banks.', web: 'https://ibps.in', freq: 'yearly' },
    { cat: 'sbi', name: 'SBI PO', slug: 'sbi-po', full_name: 'State Bank of India Probationary Officer', body: 'SBI', desc: 'SBI PO recruitment exam.', web: 'https://sbi.co.in', freq: 'yearly' },
    { cat: 'rbi', name: 'RBI Grade B', slug: 'rbi-grade-b', full_name: 'Reserve Bank of India Grade B Officer', body: 'RBI', desc: 'Prestigious exam for RBI officers.', web: 'https://rbi.org.in', freq: 'yearly' },
    { cat: 'class-10', name: 'CBSE Class 10', slug: 'cbse-class-10', full_name: 'CBSE Board Examination Class 10', body: 'CBSE', desc: 'Central Board Class 10 board examination.', web: 'https://cbse.gov.in', freq: 'yearly' },
    { cat: 'class-12', name: 'CBSE Class 12', slug: 'cbse-class-12', full_name: 'CBSE Board Examination Class 12', body: 'CBSE', desc: 'Central Board Class 12 board examination.', web: 'https://cbse.gov.in', freq: 'yearly' },
    { cat: 'engineering', name: 'JEE Main', slug: 'jee-main', full_name: 'Joint Entrance Examination Main', body: 'NTA', desc: 'National-level engineering entrance exam.', web: 'https://jeemain.nta.nic.in', freq: 'half_yearly' },
    { cat: 'medical', name: 'NEET UG', slug: 'neet-ug', full_name: 'National Eligibility cum Entrance Test UG', body: 'NTA', desc: 'National medical entrance examination.', web: 'https://neet.nta.nic.in', freq: 'yearly' },
    { cat: 'law', name: 'CLAT', slug: 'clat', full_name: 'Common Law Admission Test', body: 'CNLU', desc: 'National-level law entrance exam for NLUs.', web: 'https://consortiumofnlus.ac.in', freq: 'yearly' },
    { cat: 'mba', name: 'CAT', slug: 'cat', full_name: 'Common Admission Test', body: 'IIMs', desc: 'Premier MBA entrance exam for IIMs.', web: 'https://iimcat.ac.in', freq: 'yearly' },
    { cat: 'defence', name: 'NDA', slug: 'nda', full_name: 'National Defence Academy Examination', body: 'UPSC', desc: 'Entrance exam for Army, Navy, Air Force training.', web: 'https://upsc.gov.in', freq: 'half_yearly' },
    { cat: 'teaching', name: 'CTET', slug: 'ctet', full_name: 'Central Teacher Eligibility Test', body: 'CBSE', desc: 'Eligibility test for central government school teachers.', web: 'https://ctet.nic.in', freq: 'half_yearly' },
    { cat: 'railway', name: 'RRB NTPC', slug: 'rrb-ntpc', full_name: 'Railway Recruitment Board NTPC', body: 'RRB', desc: 'Non-Technical Popular Categories railway exam.', web: 'https://www.rrbcdg.gov.in', freq: 'as_notified' },
  ];

  for (const e of exams) {
    try {
      const [existing] = await pool.query('SELECT id FROM exams WHERE slug = ?', [e.slug]);
      if (existing.length > 0) continue;
      await pool.query('INSERT INTO exams (category_id,name,slug,full_name,conducting_body,description,official_website,frequency) VALUES (?,?,?,?,?,?,?,?)',
        [catIds[e.cat], e.name, e.slug, e.full_name, e.body, e.desc, e.web, e.freq]);
      console.log('    \u2713 ' + e.name);
    } catch (err) { console.error('    \u2717 ' + e.name + ': ' + err.message); }
  }

  console.log('\\n  PrepSmart Seed Complete!');
  console.log('  Categories: ' + Object.keys(catIds).length);
  console.log('  Exams: ' + exams.length + '\\n');
  process.exit(0);
};

seedPrep();
