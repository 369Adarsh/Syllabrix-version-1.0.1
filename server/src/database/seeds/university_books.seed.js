/**
 * Seed: university_books.seed.js
 * Seeds prescribed + reference books for university subjects.
 * Inserts books into university_books and links via university_book_subject_links.
 * Idempotent — INSERT IGNORE on (title, author).
 *
 * Run from server/ directory:
 *   node src/database/seeds/university_books.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

async function getPublisherId(shortName) {
  const [rows] = await pool.execute(
    `SELECT id FROM publishers WHERE short_name = ? LIMIT 1`, [shortName]
  );
  return rows[0]?.id || null;
}

async function getSubjectId(subjectName, courseShort, courseSpec) {
  let sql = `
    SELECT us.id FROM university_subjects us
    JOIN courses c ON c.id = us.course_id
    WHERE us.name = ? AND c.short_name = ?
  `;
  const params = [subjectName, courseShort];
  if (courseSpec) {
    sql += ` AND c.specialization = ?`;
    params.push(courseSpec);
  } else {
    sql += ` AND (c.specialization IS NULL OR c.specialization = '')`;
  }
  sql += ` LIMIT 1`;
  const [rows] = await pool.execute(sql, params);
  return rows[0]?.id || null;
}

async function insertBook(book, publisherId, subjectId) {
  const [result] = await pool.execute(
    `INSERT IGNORE INTO university_books
       (publisher_id, university_subject_id, title, author, edition, publication_year,
        book_type, is_prescribed, is_available_free, priority_rank, usage_tip, is_active)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,1)`,
    [
      publisherId,
      subjectId,
      book.title,
      book.author || null,
      book.edition || null,
      book.year || null,
      book.type || 'textbook',
      book.prescribed ? 1 : 0,
      book.free ? 1 : 0,
      book.rank || 1,
      book.tip || null,
    ]
  );

  if (result.affectedRows > 0 && subjectId) {
    // Also link via university_book_subject_links
    const bookId = result.insertId;
    await pool.execute(
      `INSERT IGNORE INTO university_book_subject_links
         (university_book_id, university_subject_id, relevance)
       VALUES (?,?,?)`,
      [bookId, subjectId, book.relevance || 'primary']
    );
    return true;
  }
  return false;
}

async function run() {
  console.log('[SEED] university_books.seed.js — starting...');

  // Pre-load publisher IDs
  const pubMap = {};
  const pubShortNames = [
    'Khanna', 'Wiley', 'S.Chand', 'CareerMonk', 'MIT Press', 'Oxford',
    'Pearson', 'McGraw Hill', 'Elsevier', 'Jaypee', 'Laxmi', 'Himalaya',
    'Vikas', 'Springer', "O'Reilly", 'CBS', 'Wolters Kluwer', 'Books & Allied',
  ];
  for (const sn of pubShortNames) {
    const id = await getPublisherId(sn);
    pubMap[sn] = id;
    if (!id) console.warn(`  [WARN] Publisher not found: ${sn}`);
  }

  // Book definitions: { subjectName, courseShort, courseSpec, title, author, publisher, ... }
  const books = [
    // ─── ENGINEERING MATHEMATICS ──────────────────────────────────────────────
    {
      subjectName: 'Engineering Mathematics I', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', publisher: 'Khanna',
      edition: '44th', year: 2023, rank: 1, prescribed: true,
      tip: 'Standard for all engineering universities in India. Cover thoroughly.',
    },
    {
      subjectName: 'Engineering Mathematics I', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Advanced Engineering Mathematics', author: 'Erwin Kreyszig', publisher: 'Wiley',
      edition: '10th', year: 2015, rank: 2,
      tip: 'For deeper understanding, preferred in IITs.',
    },
    {
      subjectName: 'Engineering Mathematics I', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Engineering Mathematics', author: 'H.K. Dass', publisher: 'S.Chand',
      rank: 3, year: 2021,
      tip: 'Good for problem practice.',
    },
    // Also link to Mechanical and Electrical Sem 1
    {
      subjectName: 'Engineering Mathematics I', courseShort: 'B.Tech', courseSpec: 'Mechanical Engineering',
      title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', publisher: 'Khanna',
      edition: '44th', year: 2023, rank: 1, prescribed: true,
      tip: 'Standard for all engineering universities in India.',
    },
    {
      subjectName: 'Engineering Mathematics I', courseShort: 'B.Tech', courseSpec: 'Electrical Engineering',
      title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', publisher: 'Khanna',
      edition: '44th', year: 2023, rank: 1, prescribed: true,
      tip: 'Standard for all engineering universities in India.',
    },

    // ─── DATA STRUCTURES ──────────────────────────────────────────────────────
    {
      subjectName: 'Data Structures', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Data Structures and Algorithms Made Easy', author: 'Narasimha Karumanchi', publisher: 'CareerMonk',
      edition: '5th', year: 2020, rank: 1, prescribed: true,
      tip: 'Best for placements + conceptual understanding. Very readable.',
    },
    {
      subjectName: 'Data Structures', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen et al.', publisher: 'MIT Press',
      edition: '4th', year: 2022, rank: 2,
      tip: 'IIT standard. Dense but comprehensive. Use as reference.',
    },
    {
      subjectName: 'Data Structures', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Data Structures Using C and C++', author: 'Reema Thareja', publisher: 'Oxford',
      edition: '3rd', year: 2018, rank: 3,
      tip: 'Good for beginners with clear examples.',
    },

    // ─── OPERATING SYSTEMS ────────────────────────────────────────────────────
    {
      subjectName: 'Operating Systems', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Operating System Concepts (Dinosaur Book)', author: 'Abraham Silberschatz et al.', publisher: 'Wiley',
      edition: '10th', year: 2018, rank: 1, prescribed: true,
      tip: 'Standard OS book across all universities. Must-have.',
    },
    {
      subjectName: 'Operating Systems', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Modern Operating Systems', author: 'Andrew Tanenbaum', publisher: 'Pearson',
      edition: '4th', year: 2015, rank: 2,
      tip: 'More detailed theory, good for advanced understanding.',
    },

    // ─── DBMS ─────────────────────────────────────────────────────────────────
    {
      subjectName: 'Database Management Systems', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Database System Concepts', author: 'Abraham Silberschatz, Henry F. Korth', publisher: 'McGraw Hill',
      edition: '7th', year: 2019, rank: 1, prescribed: true,
      tip: 'Standard DBMS textbook in India and worldwide.',
    },
    {
      subjectName: 'Database Management Systems', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Fundamentals of Database Systems', author: 'Ramez Elmasri, Shamkant Navathe', publisher: 'Pearson',
      edition: '7th', year: 2015, rank: 2,
      tip: 'More detailed, great for understanding normalization.',
    },

    // ─── COMPUTER NETWORKS ────────────────────────────────────────────────────
    {
      subjectName: 'Computer Networks', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Computer Networks', author: 'Andrew Tanenbaum', publisher: 'Pearson',
      edition: '5th', year: 2011, rank: 1, prescribed: true,
      tip: 'Bible of networking. Every CS student must read.',
    },
    {
      subjectName: 'Computer Networks', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Data Communications and Networking', author: 'Behrouz Forouzan', publisher: 'McGraw Hill',
      edition: '5th', year: 2013, rank: 2,
      tip: 'Easier to understand than Tanenbaum, great diagrams.',
    },

    // ─── MACHINE LEARNING ─────────────────────────────────────────────────────
    {
      subjectName: 'Machine Learning', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: "Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow", author: 'Aurélien Géron', publisher: "O'Reilly",
      edition: '3rd', year: 2022, rank: 1, prescribed: true,
      tip: 'Best practical ML book. Highly hands-on with code examples.',
    },
    {
      subjectName: 'Machine Learning', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'Pattern Recognition and Machine Learning', author: 'Christopher Bishop', publisher: 'Springer',
      year: 2006, rank: 2, free: true,
      tip: 'Theory-heavy. Used in IIT courses. PDF available free on Springer.',
    },
    {
      subjectName: 'Machine Learning', courseShort: 'B.Tech', courseSpec: 'Computer Science and Engineering',
      title: 'An Introduction to Statistical Learning', author: 'Gareth James et al.', publisher: 'Springer',
      edition: '2nd', year: 2021, rank: 3, free: true,
      tip: 'Free PDF available. Great for statistical foundation of ML.',
    },

    // ─── FLUID MECHANICS ──────────────────────────────────────────────────────
    {
      subjectName: 'Fluid Mechanics', courseShort: 'B.Tech', courseSpec: 'Mechanical Engineering',
      title: 'Fluid Mechanics and Hydraulic Machines', author: 'R.K. Bansal', publisher: 'Laxmi',
      edition: '9th', year: 2019, rank: 1, prescribed: true,
      tip: 'Standard for Indian engineering colleges. Covers all exam topics.',
    },
    {
      subjectName: 'Fluid Mechanics', courseShort: 'B.Tech', courseSpec: 'Mechanical Engineering',
      title: 'Fluid Mechanics', author: 'Frank White', publisher: 'McGraw Hill',
      edition: '8th', year: 2016, rank: 2,
      tip: 'Global standard, more rigorous than Bansal.',
    },

    // ─── ENGINEERING THERMODYNAMICS ───────────────────────────────────────────
    {
      subjectName: 'Engineering Thermodynamics', courseShort: 'B.Tech', courseSpec: 'Mechanical Engineering',
      title: 'Engineering Thermodynamics', author: 'P.K. Nag', publisher: 'McGraw Hill',
      edition: '6th', year: 2020, rank: 1, prescribed: true,
      tip: 'Gold standard for Indian engineering students. Every Mech student uses this.',
    },
    {
      subjectName: 'Engineering Thermodynamics', courseShort: 'B.Tech', courseSpec: 'Mechanical Engineering',
      title: 'Thermodynamics: An Engineering Approach', author: 'Yunus Cengel, Michael Boles', publisher: 'McGraw Hill',
      edition: '9th', year: 2019, rank: 2,
      tip: 'Excellent explanations with real-world examples.',
    },

    // ─── ANATOMY (MBBS) ───────────────────────────────────────────────────────
    {
      subjectName: 'Anatomy', courseShort: 'MBBS', courseSpec: null,
      title: "Gray's Anatomy", author: 'Henry Gray', publisher: 'Elsevier',
      edition: '42nd', year: 2020, rank: 1, prescribed: true,
      tip: 'The global gold standard for anatomy. Very detailed.',
    },
    {
      subjectName: 'Anatomy', courseShort: 'MBBS', courseSpec: null,
      title: 'BD Chaurasia Human Anatomy (3 volumes)', author: 'B.D. Chaurasia', publisher: 'CBS',
      edition: '8th', year: 2019, rank: 1, prescribed: true,
      tip: 'Standard for Indian MBBS students. Clear, concise, exam-focused.',
    },
    {
      subjectName: 'Anatomy', courseShort: 'MBBS', courseSpec: null,
      title: "Snell's Clinical Anatomy by Regions", author: 'Richard Snell', publisher: 'Wolters Kluwer',
      edition: '9th', year: 2012, rank: 2,
      tip: 'Great for clinical correlations.',
    },

    // ─── PHYSIOLOGY (MBBS) ────────────────────────────────────────────────────
    {
      subjectName: 'Physiology', courseShort: 'MBBS', courseSpec: null,
      title: 'Textbook of Medical Physiology', author: 'Arthur Guyton, John Hall', publisher: 'Elsevier',
      edition: '14th', year: 2020, rank: 1, prescribed: true,
      tip: 'Bible of Physiology worldwide. The most comprehensive text.',
    },
    {
      subjectName: 'Physiology', courseShort: 'MBBS', courseSpec: null,
      title: 'Review of Medical Physiology', author: 'William Ganong', publisher: 'McGraw Hill',
      edition: '26th', year: 2019, rank: 2,
      tip: 'Concise with excellent clinical highlights.',
    },
    {
      subjectName: 'Physiology', courseShort: 'MBBS', courseSpec: null,
      title: 'Essentials of Medical Physiology', author: 'K. Sembulingam', publisher: 'Jaypee',
      edition: '8th', year: 2019, rank: 3, prescribed: true,
      tip: 'Most popular among Indian MBBS students for exam preparation.',
    },

    // ─── BIOCHEMISTRY (MBBS) ──────────────────────────────────────────────────
    {
      subjectName: 'Biochemistry', courseShort: 'MBBS', courseSpec: null,
      title: "Harper's Illustrated Biochemistry", author: 'Robert Murray et al.', publisher: 'McGraw Hill',
      edition: '32nd', year: 2023, rank: 1, prescribed: true,
      tip: 'Comprehensive with excellent clinical correlations.',
    },
    {
      subjectName: 'Biochemistry', courseShort: 'MBBS', courseSpec: null,
      title: 'Biochemistry', author: 'U. Satyanarayana', publisher: 'Books & Allied',
      edition: '5th', year: 2017, rank: 1, prescribed: true,
      tip: 'Standard for Indian MBBS. Covers all MCI exam topics clearly.',
    },

    // ─── PHARMACOLOGY (MBBS) ──────────────────────────────────────────────────
    {
      subjectName: 'Pharmacology', courseShort: 'MBBS', courseSpec: null,
      title: 'Essentials of Medical Pharmacology', author: 'K.D. Tripathi', publisher: 'Jaypee',
      edition: '8th', year: 2019, rank: 1, prescribed: true,
      tip: 'Most prescribed pharmacology book in India. Clear and comprehensive.',
    },
    {
      subjectName: 'Pharmacology', courseShort: 'MBBS', courseSpec: null,
      title: "Goodman & Gilman's The Pharmacological Basis of Therapeutics", author: 'Laurence Brunton et al.', publisher: 'McGraw Hill',
      edition: '13th', year: 2018, rank: 2,
      tip: 'Global standard reference. Use for deep understanding.',
    },

    // ─── PATHOLOGY (MBBS) ─────────────────────────────────────────────────────
    {
      subjectName: 'Pathology', courseShort: 'MBBS', courseSpec: null,
      title: "Robbins Basic Pathology", author: 'Vinay Kumar et al.', publisher: 'Elsevier',
      edition: '10th', year: 2017, rank: 1, prescribed: true,
      tip: 'Gold standard for pathology globally.',
    },
    {
      subjectName: 'Pathology', courseShort: 'MBBS', courseSpec: null,
      title: 'Textbook of Pathology', author: 'Harsh Mohan', publisher: 'Jaypee',
      edition: '7th', year: 2015, rank: 1, prescribed: true,
      tip: 'Standard Indian MBBS textbook, great for exam prep.',
    },

    // ─── FINANCIAL ACCOUNTING (B.COM) ─────────────────────────────────────────
    {
      subjectName: 'Financial Accounting', courseShort: 'B.Com', courseSpec: null,
      title: 'Financial Accounting', author: 'R.L. Gupta, V.K. Gupta', publisher: 'S.Chand',
      edition: '15th', year: 2019, rank: 1, prescribed: true,
      tip: 'Standard B.Com text widely used across Indian universities.',
    },
    {
      subjectName: 'Financial Accounting', courseShort: 'B.Com', courseSpec: null,
      title: 'Advanced Accountancy (Volume I & II)', author: 'S.N. Maheshwari, S.K. Maheshwari', publisher: 'Vikas',
      edition: '20th', year: 2021, rank: 1, prescribed: true,
      tip: 'Standard for B.Com across India. Comprehensive with solved problems.',
    },

    // ─── MARKETING MANAGEMENT (MBA) ───────────────────────────────────────────
    {
      subjectName: 'Marketing Management', courseShort: 'MBA', courseSpec: null,
      title: 'Marketing Management', author: 'Philip Kotler, Kevin Keller', publisher: 'Pearson',
      edition: '16th', year: 2021, rank: 1, prescribed: true,
      tip: 'Bible of Marketing globally. Must-read for every MBA student.',
    },
    {
      subjectName: 'Marketing Management', courseShort: 'MBA', courseSpec: null,
      title: 'Marketing Management: A South Asian Perspective', author: 'Philip Kotler, Rajan Saxena', publisher: 'Pearson',
      edition: '15th', year: 2019, rank: 2, prescribed: true,
      tip: 'India-specific edition with local case studies.',
    },

    // ─── HUMAN RESOURCE MANAGEMENT (MBA) ─────────────────────────────────────
    {
      subjectName: 'Human Resource Management', courseShort: 'MBA', courseSpec: null,
      title: 'Human Resource Management', author: 'Gary Dessler', publisher: 'Pearson',
      edition: '16th', year: 2019, rank: 1, prescribed: true,
      tip: 'Globally recognized text. Used in most Indian B-schools.',
    },
    {
      subjectName: 'Human Resource Management', courseShort: 'MBA', courseSpec: null,
      title: 'Personnel Management and Industrial Relations', author: 'C.B. Mamoria, S.V. Gankar', publisher: 'Himalaya',
      edition: '28th', year: 2018, rank: 2, prescribed: true,
      tip: 'Standard Indian HRM text for Mumbai University and affiliates.',
    },

    // ─── FINANCIAL MANAGEMENT (MBA) ───────────────────────────────────────────
    {
      subjectName: 'Financial Management', courseShort: 'MBA', courseSpec: null,
      title: 'Financial Management', author: 'I.M. Pandey', publisher: 'Vikas',
      edition: '11th', year: 2021, rank: 1, prescribed: true,
      tip: 'Standard for MBA Finance in India. Excellent examples.',
    },
    {
      subjectName: 'Financial Management', courseShort: 'MBA', courseSpec: null,
      title: 'Principles of Corporate Finance', author: 'Richard Brealey, Stewart Myers', publisher: 'McGraw Hill',
      edition: '13th', year: 2019, rank: 2,
      tip: 'Global standard. Used in IIM and top B-schools.',
    },

    // ─── MANAGERIAL ECONOMICS (MBA) ───────────────────────────────────────────
    {
      subjectName: 'Managerial Economics', courseShort: 'MBA', courseSpec: null,
      title: 'Microeconomics: Theory and Applications', author: 'Robert Pindyck, Daniel Rubinfeld', publisher: 'Pearson',
      edition: '8th', year: 2017, rank: 1, prescribed: true,
      tip: 'Standard text for managerial economics across Indian MBA programs.',
    },
    {
      subjectName: 'Managerial Economics', courseShort: 'MBA', courseSpec: null,
      title: 'Indian Economy', author: 'S.K. Misra, V.K. Puri', publisher: 'Himalaya',
      edition: '33rd', year: 2022, rank: 2, prescribed: true,
      tip: 'Best for Indian economic context. Updated with current data.',
    },
  ];

  let inserted = 0;
  for (const book of books) {
    const publisherId = pubMap[book.publisher] || null;
    const subjectId   = await getSubjectId(book.subjectName, book.courseShort, book.courseSpec || null);

    if (!subjectId) {
      console.warn(`  [WARN] Subject not found: "${book.subjectName}" in ${book.courseShort} (${book.courseSpec || 'no spec'})`);
    }

    const ok = await insertBook(book, publisherId, subjectId);
    if (ok) inserted++;
  }

  console.log(`[SEED] university_books.seed.js — done. Inserted ${inserted} / ${books.length} books.`);
  await pool.end();
}

run().catch(err => {
  console.error('[SEED] university_books.seed.js FAILED:', err.message);
  process.exit(1);
});
