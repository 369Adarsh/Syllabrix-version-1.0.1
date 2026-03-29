/**
 * Seed: competitive_books.seed.js
 * Seeds 48 competitive and school reference books with publisher links,
 * subject associations, and many-to-many exam links via book_exam_links.
 * Idempotent — uses INSERT IGNORE.
 *
 * Run from server/ directory (run publishers + exam_categories + competitive_subjects first):
 *   node src/database/seeds/competitive_books.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

// ── Helpers ───────────────────────────────────────────────────────────────────

async function loadMap(table, keyCol, valCol = 'id') {
  const [rows] = await pool.execute(`SELECT ${keyCol}, ${valCol} FROM ${table}`);
  return new Map(rows.map(r => [r[keyCol], r[valCol]]));
}

async function loadSubjectMap() {
  const [rows] = await pool.execute(
    `SELECT cs.id, cs.name, cs.exam_category_id, ec.code
     FROM competitive_subjects cs
     JOIN exam_categories ec ON ec.id = cs.exam_category_id`
  );
  // key: `${examCode}|${subjectName}`
  const map = new Map();
  for (const r of rows) {
    map.set(`${r.code}|${r.name}`, r.id);
  }
  return map;
}

async function seedBook(book, publisherMap, examMap, subjectMap) {
  const publisherId = publisherMap.get(book.publisher);
  if (!publisherId) {
    console.warn(`[SEED] Publisher not found: "${book.publisher}" — skipping "${book.title}"`);
    return;
  }

  // Resolve competitive_subject_id (optional)
  let subjectId = null;
  if (book.subject_key) {
    subjectId = subjectMap.get(book.subject_key) || null;
    if (!subjectId) console.warn(`[SEED] Subject not found: "${book.subject_key}" for "${book.title}"`);
  }

  // INSERT IGNORE the book
  await pool.execute(
    `INSERT IGNORE INTO competitive_books
       (publisher_id, competitive_subject_id, title, author, edition, publication_year,
        is_copyrighted, is_available_free, priority_rank, usage_tip, is_active)
     VALUES (?,?,?,?,?,?,1,0,?,?,1)`,
    [
      publisherId,
      subjectId,
      book.title,
      book.author  || null,
      book.edition || null,
      book.year    || null,
      book.priority_rank || 1,
      book.usage_tip     || null,
    ]
  );

  // Fetch book id
  const [rows] = await pool.execute(
    'SELECT id FROM competitive_books WHERE title = ? AND publisher_id = ? LIMIT 1',
    [book.title, publisherId]
  );
  if (!rows.length) return;
  const bookId = rows[0].id;

  // Insert exam links
  for (const examCode of (book.exams || [])) {
    const examId = examMap.get(examCode);
    if (!examId) { console.warn(`[SEED] Exam not found: "${examCode}"`); continue; }
    await pool.execute(
      `INSERT IGNORE INTO book_exam_links (competitive_book_id, exam_category_id, relevance)
       VALUES (?,?,'primary')`,
      [bookId, examId]
    );
  }
}

// ── Book definitions ──────────────────────────────────────────────────────────

// publisher key must match `short_name` in publishers table
// subject_key format: `${examCode}|${subjectName}` from competitive_subjects

const BOOKS = [
  // ── PHYSICS ────────────────────────────────────────────────────────────────
  {
    title: 'Concepts of Physics Vol 1',
    author: 'H.C. Verma',
    publisher: 'Bharati Bhawan',
    year: 2019, priority_rank: 1,
    subject_key: 'JEE_MAIN|Mechanics',
    exams: ['JEE_MAIN', 'JEE_ADV', 'NEET_UG'],
    usage_tip: 'Bible of Physics. Read cover to cover before any other book.',
  },
  {
    title: 'Concepts of Physics Vol 2',
    author: 'H.C. Verma',
    publisher: 'Bharati Bhawan',
    year: 2019, priority_rank: 1,
    subject_key: 'JEE_MAIN|Electromagnetism',
    exams: ['JEE_MAIN', 'JEE_ADV', 'NEET_UG'],
    usage_tip: 'Covers Electrostatics, Optics, Modern Physics thoroughly.',
  },
  {
    title: 'DC Pandey Physics — Mechanics Part 1',
    author: 'D.C. Pandey',
    publisher: 'DC Pandey',
    year: 2021, priority_rank: 2,
    subject_key: 'JEE_MAIN|Mechanics',
    exams: ['JEE_MAIN', 'JEE_ADV', 'NEET_UG'],
    usage_tip: 'Best for practice problems after HC Verma.',
  },
  {
    title: 'Lakhmir Singh Physics Class 9',
    author: 'Lakhmir Singh & Manjit Kaur',
    publisher: 'Lakhmir Singh',
    year: 2022, priority_rank: 1,
    subject_key: null,
    exams: [],
    usage_tip: 'Clear explanations for CBSE Class 9. Best alternative to NCERT.',
  },
  {
    title: 'Lakhmir Singh Physics Class 10',
    author: 'Lakhmir Singh & Manjit Kaur',
    publisher: 'Lakhmir Singh',
    year: 2022, priority_rank: 1,
    subject_key: null,
    exams: [],
    usage_tip: 'Best school Physics book for CBSE Class 10. Covers all NCERT topics.',
  },
  {
    title: 'Problems in General Physics',
    author: 'I.E. Irodov',
    publisher: 'Mir',
    year: 2010, priority_rank: 3,
    subject_key: 'JEE_ADV|Mechanics',
    exams: ['JEE_ADV'],
    usage_tip: 'Only for JEE Advanced aspirants. Very challenging. Attempt after HC Verma.',
  },

  // ── CHEMISTRY ──────────────────────────────────────────────────────────────
  {
    title: 'Numerical Chemistry',
    author: 'P. Bahadur',
    publisher: 'GRB',
    year: 2021, priority_rank: 2,
    subject_key: 'JEE_MAIN|Physical Chemistry',
    exams: ['JEE_MAIN', 'JEE_ADV'],
    usage_tip: 'Best for Physical Chemistry numericals. Exhaustive problem sets.',
  },
  {
    title: 'Organic Chemistry',
    author: 'M.S. Chauhan',
    publisher: 'Balaji',
    year: 2021, priority_rank: 1,
    subject_key: 'JEE_MAIN|Organic Chemistry',
    exams: ['JEE_MAIN', 'JEE_ADV', 'NEET_UG'],
    usage_tip: 'Best Organic Chemistry book for JEE and NEET. Named reactions and mechanisms explained well.',
  },
  {
    title: 'Concise Inorganic Chemistry',
    author: 'J.D. Lee',
    publisher: 'Wiley',
    year: 2020, priority_rank: 2,
    subject_key: 'JEE_ADV|Inorganic Chemistry',
    exams: ['JEE_ADV'],
    usage_tip: 'For JEE Advanced Inorganic. Read selected chapters only.',
  },
  {
    title: 'Problems in Physical Chemistry',
    author: 'O.P. Tandon',
    publisher: 'GRB',
    year: 2020, priority_rank: 2,
    subject_key: 'JEE_MAIN|Physical Chemistry',
    exams: ['JEE_MAIN', 'NEET_UG'],
    usage_tip: 'Strong on theory + numericals for Physical Chemistry.',
  },
  {
    title: 'Lakhmir Singh Chemistry Class 10',
    author: 'Lakhmir Singh & Manjit Kaur',
    publisher: 'Lakhmir Singh',
    year: 2022, priority_rank: 1,
    subject_key: null,
    exams: [],
    usage_tip: 'Best school Chemistry book for CBSE Class 10.',
  },

  // ── MATHEMATICS ────────────────────────────────────────────────────────────
  {
    title: 'Mathematics for Class 9',
    author: 'R.D. Sharma',
    publisher: 'Dhanpat Rai',
    year: 2023, priority_rank: 1,
    subject_key: null,
    exams: [],
    usage_tip: 'Most comprehensive school Maths book. Follow NCERT then this.',
  },
  {
    title: 'Mathematics for Class 10',
    author: 'R.D. Sharma',
    publisher: 'Dhanpat Rai',
    year: 2023, priority_rank: 1,
    subject_key: null,
    exams: [],
    usage_tip: 'Standard board exam Math reference. Extensive exercises.',
  },
  {
    title: 'Quantitative Aptitude for Competitive Examinations',
    author: 'R.S. Aggarwal',
    publisher: 'RS Aggarwal',
    year: 2022, priority_rank: 1,
    subject_key: 'SSC_CGL|Quantitative Aptitude',
    exams: ['SSC_CGL', 'SBI_PO', 'IBPS_PO', 'NDA'],
    usage_tip: 'Standard book for all aptitude exams. Start here before any other.',
  },
  {
    title: 'Fast Track Objective Arithmetic',
    author: 'Rajesh Verma',
    publisher: 'Arihant',
    year: 2022, priority_rank: 2,
    subject_key: 'SSC_CGL|Quantitative Aptitude',
    exams: ['SSC_CGL', 'SSC_CHSL'],
    usage_tip: 'Quick shortcuts and tricks. Good for revision after RS Aggarwal.',
  },
  {
    title: 'Advance Maths for SSC',
    author: 'Rakesh Yadav',
    publisher: 'Rakesh Yadav',
    year: 2022, priority_rank: 1,
    subject_key: 'SSC_CGL|Quantitative Aptitude',
    exams: ['SSC_CGL'],
    usage_tip: 'Best for SSC CGL Tier 2 Mathematics. Very exam-focused.',
  },

  // ── BIOLOGY ────────────────────────────────────────────────────────────────
  {
    title: "Trueman's Elementary Biology Vol 1",
    author: 'M.P. Tyagi & K.N. Bhatia',
    publisher: "Trueman's",
    year: 2022, priority_rank: 1,
    subject_key: 'NEET_UG|Botany',
    exams: ['NEET_UG'],
    usage_tip: 'Complete theory reference for NEET Biology. Covers Botany + Zoology.',
  },
  {
    title: "Trueman's Elementary Biology Vol 2",
    author: 'M.P. Tyagi & K.N. Bhatia',
    publisher: "Trueman's",
    year: 2022, priority_rank: 1,
    subject_key: 'NEET_UG|Zoology',
    exams: ['NEET_UG'],
    usage_tip: 'Must read for NEET Zoology. Comprehensive yet readable.',
  },
  {
    title: 'MTG Fingertips Biology',
    author: 'MTG Editorial Board',
    publisher: 'MTG',
    year: 2023, priority_rank: 2,
    subject_key: 'NEET_UG|Botany',
    exams: ['NEET_UG'],
    usage_tip: 'Best for quick revision and MCQ practice before NEET.',
  },

  // ── HISTORY (UPSC) ─────────────────────────────────────────────────────────
  {
    title: "India's Struggle for Independence",
    author: 'Bipan Chandra',
    publisher: 'Penguin',
    year: 2016, priority_rank: 1,
    subject_key: 'UPSC_IAS|Modern India',
    exams: ['UPSC_IAS', 'GPSC', 'MPSC'],
    usage_tip: 'Must read for Modern History. Non-negotiable for UPSC aspirants.',
  },
  {
    title: 'Spectrum Modern History of India',
    author: 'Rajiv Ahir',
    publisher: 'Spectrum',
    year: 2023, priority_rank: 1,
    subject_key: 'UPSC_IAS|Modern India',
    exams: ['UPSC_IAS', 'GPSC', 'MPSC', 'UPPSC', 'TNPSC', 'KPSC', 'RPSC', 'BPSC', 'MPPSC'],
    usage_tip: 'Best single book for Modern History revision. Very popular across all PSCs.',
  },
  {
    title: 'Medieval India',
    author: 'Satish Chandra',
    publisher: 'Orient BlackSwan',
    year: 2015, priority_rank: 1,
    subject_key: 'UPSC_IAS|Medieval India',
    exams: ['UPSC_IAS'],
    usage_tip: 'Standard reference for Medieval Indian history for UPSC Mains.',
  },
  {
    title: 'Ancient India (NCERT Old)',
    author: 'R.S. Sharma',
    publisher: 'NCERT',
    year: 2003, priority_rank: 1,
    subject_key: 'UPSC_IAS|Ancient India',
    exams: ['UPSC_IAS'],
    usage_tip: 'Old NCERT — must read for Ancient India. Free on NCERT website.',
    is_available_free: true,
  },
  {
    title: 'Indian Art & Culture',
    author: 'Nitin Singhania',
    publisher: 'TMH',
    year: 2023, priority_rank: 1,
    subject_key: 'UPSC_IAS|Indian Art & Culture',
    exams: ['UPSC_IAS', 'GPSC', 'MPSC', 'UPPSC', 'TNPSC', 'KPSC'],
    usage_tip: 'Only dedicated Art & Culture book for UPSC. Must read — no substitute.',
  },
  {
    title: 'World History',
    author: 'Jain & Mathur',
    publisher: 'New Age',
    year: 2018, priority_rank: 1,
    subject_key: 'UPSC_IAS|World History',
    exams: ['UPSC_IAS'],
    usage_tip: 'Most recommended World History book for UPSC Mains.',
  },

  // ── GEOGRAPHY (UPSC) ───────────────────────────────────────────────────────
  {
    title: 'Certificate Physical & Human Geography',
    author: 'G.C. Leong',
    publisher: 'GC Leong',
    year: 2020, priority_rank: 1,
    subject_key: 'UPSC_IAS|World Geography',
    exams: ['UPSC_IAS', 'GPSC', 'MPSC', 'UPPSC', 'TNPSC', 'KPSC'],
    usage_tip: 'Bible of Geography. Read fully before any other Geography book.',
  },
  {
    title: 'India: A Comprehensive Geography',
    author: 'Majid Husain',
    publisher: 'TMH',
    year: 2022, priority_rank: 1,
    subject_key: 'UPSC_IAS|Indian Geography',
    exams: ['UPSC_IAS', 'GPSC', 'MPSC'],
    usage_tip: 'Best for Indian Geography. Highly detailed and exam-relevant.',
  },

  // ── POLITY (UPSC) ──────────────────────────────────────────────────────────
  {
    title: 'Indian Polity',
    author: 'M. Laxmikanth',
    publisher: 'TMH',
    year: 2023, priority_rank: 1,
    subject_key: 'UPSC_IAS|Indian Constitution & Governance',
    exams: ['UPSC_IAS', 'GPSC', 'MPSC', 'UPPSC', 'TNPSC', 'KPSC', 'RPSC', 'BPSC', 'MPPSC'],
    usage_tip: 'THE Bible of Indian Polity. Read at least twice. No substitute exists.',
  },
  {
    title: 'Introduction to the Constitution of India',
    author: 'D.D. Basu',
    publisher: 'LexisNexis',
    year: 2021, priority_rank: 2,
    subject_key: 'UPSC_IAS|Indian Constitution & Governance',
    exams: ['UPSC_IAS'],
    usage_tip: 'Deep dive into constitutional provisions. Read after Laxmikanth.',
  },
  {
    title: 'Our Parliament',
    author: 'Subhash Kashyap',
    publisher: 'NBT',
    year: 2019, priority_rank: 2,
    subject_key: 'UPSC_IAS|Parliamentary System',
    exams: ['UPSC_IAS'],
    usage_tip: 'Authoritative source on Parliament. Essential for Polity Mains.',
  },

  // ── ECONOMY (UPSC) ─────────────────────────────────────────────────────────
  {
    title: 'Indian Economy',
    author: 'Ramesh Singh',
    publisher: 'TMH',
    year: 2023, priority_rank: 1,
    subject_key: 'UPSC_IAS|Indian Economy',
    exams: ['UPSC_IAS', 'GPSC', 'MPSC', 'UPPSC', 'TNPSC'],
    usage_tip: 'Most comprehensive economy book for UPSC. Updated annually.',
  },
  {
    title: 'Indian Economy: Key Concepts',
    author: 'Sanjiv Verma',
    publisher: 'Unique',
    year: 2022, priority_rank: 2,
    subject_key: 'UPSC_IAS|Indian Economy',
    exams: ['UPSC_IAS', 'GPSC'],
    usage_tip: 'Good supplementary economy book. Useful for state PSC too.',
  },

  // ── ENVIRONMENT (UPSC) ─────────────────────────────────────────────────────
  {
    title: 'Environment & Ecology',
    author: 'Shankar IAS Academy',
    publisher: 'Shankar IAS',
    year: 2023, priority_rank: 1,
    subject_key: 'UPSC_IAS|Environment & Ecology',
    exams: ['UPSC_IAS', 'GPSC', 'MPSC', 'UPPSC', 'TNPSC', 'KPSC', 'RPSC'],
    usage_tip: 'Most popular environment book. Covers everything for UPSC and state PSCs.',
  },

  // ── SCIENCE & TECH (UPSC) ──────────────────────────────────────────────────
  {
    title: 'Science & Technology for UPSC',
    author: 'Ravi Agrahari',
    publisher: 'TMH',
    year: 2023, priority_rank: 1,
    subject_key: 'UPSC_IAS|Science & Technology',
    exams: ['UPSC_IAS'],
    usage_tip: 'Best dedicated Science & Technology book for UPSC.',
  },

  // ── ETHICS (UPSC) ──────────────────────────────────────────────────────────
  {
    title: 'Lexicon for Ethics, Integrity & Aptitude',
    author: 'Chronicle Editorial Team',
    publisher: 'Chronicle',
    year: 2022, priority_rank: 1,
    subject_key: 'UPSC_IAS|Ethics, Integrity & Aptitude',
    exams: ['UPSC_IAS'],
    usage_tip: 'Best book for UPSC GS Paper 4 — Ethics. Must read.',
  },
  {
    title: 'Ethics in Governance (ARC 4th Report)',
    author: 'Second Administrative Reforms Commission',
    publisher: 'NBT',
    year: 2007, priority_rank: 2,
    subject_key: 'UPSC_IAS|Ethics, Integrity & Aptitude',
    exams: ['UPSC_IAS'],
    usage_tip: 'ARC Report on Ethics. Useful for Mains answers. Free on government website.',
  },

  // ── REASONING ─────────────────────────────────────────────────────────────
  {
    title: 'A Modern Approach to Verbal & Non-Verbal Reasoning',
    author: 'R.S. Aggarwal',
    publisher: 'RS Aggarwal',
    year: 2021, priority_rank: 1,
    subject_key: 'SSC_CGL|Verbal & Non-Verbal Reasoning',
    exams: ['SSC_CGL', 'SBI_PO', 'IBPS_PO', 'NDA', 'CDS'],
    usage_tip: 'Standard reasoning book. Cover fully before any exam.',
  },
  {
    title: 'Analytical Reasoning',
    author: 'M.K. Pandey',
    publisher: 'BSC',
    year: 2022, priority_rank: 2,
    subject_key: 'SBI_PO|Logical & Verbal Reasoning',
    exams: ['SBI_PO', 'IBPS_PO'],
    usage_tip: 'Strong on puzzles and seating arrangements. Good for Banking PO.',
  },

  // ── ENGLISH ────────────────────────────────────────────────────────────────
  {
    title: 'High School English Grammar & Composition',
    author: 'Wren & Martin',
    publisher: 'Wren & Martin',
    year: 2020, priority_rank: 1,
    subject_key: 'SSC_CGL|English Comprehension & Grammar',
    exams: ['SSC_CGL', 'SBI_PO'],
    usage_tip: 'Standard English grammar reference. Keep handy throughout preparation.',
  },
  {
    title: 'Objective General English',
    author: 'S.P. Bakshi',
    publisher: 'Arihant',
    year: 2022, priority_rank: 1,
    subject_key: 'SSC_CGL|English Comprehension & Grammar',
    exams: ['SSC_CGL', 'SBI_PO', 'IBPS_PO', 'UPSC_IAS'],
    usage_tip: 'Best for competitive exam English. Covers all question types.',
  },

  // ── GENERAL AWARENESS ──────────────────────────────────────────────────────
  {
    title: "Lucent's General Knowledge",
    author: 'Lucent Editorial Team',
    publisher: 'Lucent',
    year: 2023, priority_rank: 1,
    subject_key: 'SSC_CGL|General Awareness (History, Geo, Sci)',
    exams: ['SSC_CGL', 'SSC_CHSL', 'SBI_PO', 'NDA'],
    usage_tip: 'Most popular GK book. Must for any competitive exam preparation.',
  },

  // ── COMPUTER SCIENCE (SCHOOL) ──────────────────────────────────────────────
  {
    title: 'Computer Science with Python',
    author: 'Sumita Arora',
    publisher: 'Sumita Arora',
    year: 2023, priority_rank: 1,
    subject_key: null,
    exams: [],
    usage_tip: 'Standard CBSE Class 11-12 Computer Science book. Covers Python + theory.',
  },

  // ── DEFENCE ────────────────────────────────────────────────────────────────
  {
    title: 'Pathfinder NDA & NA Entrance Examination',
    author: 'Pathfinder Editorial Team',
    publisher: 'Pathfinder',
    year: 2023, priority_rank: 1,
    subject_key: 'NDA|Mathematics (Defence)',
    exams: ['NDA'],
    usage_tip: 'Complete NDA preparation in one book. Covers all sections.',
  },
  {
    title: 'Pathfinder CDS Entrance Examination',
    author: 'Pathfinder Editorial Team',
    publisher: 'Pathfinder',
    year: 2023, priority_rank: 1,
    subject_key: 'CDS|Mathematics (Defence)',
    exams: ['CDS'],
    usage_tip: 'Best single book for CDS preparation.',
  },

  // ── STATE PSC SPECIFIC ─────────────────────────────────────────────────────
  {
    title: 'GPSC Class 1-2 Competitive Exam Guide',
    author: 'Unique Publications Editorial',
    publisher: 'Unique',
    year: 2023, priority_rank: 1,
    subject_key: 'GPSC|Gujarat History & Culture',
    exams: ['GPSC'],
    usage_tip: 'Most comprehensive guide for GPSC Class 1-2. Gujarat-specific content.',
  },
  {
    title: 'MPSC Rajyaseva Examination Guide',
    author: 'Target Publications Editorial',
    publisher: 'Target',
    year: 2023, priority_rank: 1,
    subject_key: 'MPSC|Maharashtra History & Culture',
    exams: ['MPSC'],
    usage_tip: 'Best preparation guide for MPSC Rajyaseva. Maharashtra-specific.',
  },
  {
    title: 'TNPSC Group Exam Complete Guide',
    author: 'Sura Editorial Team',
    publisher: 'Sura',
    year: 2023, priority_rank: 1,
    subject_key: 'TNPSC|Tamil Nadu History & Culture',
    exams: ['TNPSC'],
    usage_tip: 'Most recommended guide for TNPSC. Tamil Nadu-specific questions covered.',
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log('[SEED] competitive_books.seed.js — starting...');

  // Load reference maps
  const publisherMap = await loadMap('publishers', 'short_name');
  const examMap      = await loadMap('exam_categories', 'code');
  const subjectMap   = await loadSubjectMap();

  console.log(`[SEED] Loaded ${publisherMap.size} publishers, ${examMap.size} exams, ${subjectMap.size} subjects.`);

  let bookCount = 0;
  for (const book of BOOKS) {
    await seedBook(book, publisherMap, examMap, subjectMap);
    bookCount++;
    if (bookCount % 10 === 0) console.log(`[SEED] Processed ${bookCount}/${BOOKS.length} books...`);
  }

  console.log(`[SEED] competitive_books.seed.js — complete. Processed ${bookCount} books.`);
  await pool.end();
}

run().catch(err => {
  console.error('[SEED] competitive_books.seed.js FAILED:', err.message);
  process.exit(1);
});
