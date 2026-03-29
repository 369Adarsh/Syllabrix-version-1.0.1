/**
 * Seed: publishers.seed.js
 * Seeds all school + competitive publishers.
 * Idempotent — uses INSERT IGNORE.
 *
 * Run from server/ directory:
 *   node src/database/seeds/publishers.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

const publishers = [
  // ─── SCHOOL PUBLISHERS ───────────────────────────────────────────────────────
  {
    name: 'S. Chand & Company',
    short_name: 'S.Chand',
    focus_area: 'School + Competitive',
    website: 'https://schandpublishing.com',
  },
  {
    name: 'R.S. Aggarwal (S. Chand)',
    short_name: 'RS Aggarwal',
    focus_area: 'Mathematics + Reasoning',
    website: 'https://schandpublishing.com',
  },
  {
    name: 'Dhanpat Rai Publications',
    short_name: 'Dhanpat Rai',
    focus_area: 'School Mathematics + Computer Science',
    website: null,
  },
  {
    name: 'Wren & Martin (S. Chand)',
    short_name: 'Wren & Martin',
    focus_area: 'English Grammar',
    website: 'https://schandpublishing.com',
  },
  {
    name: 'Sumita Arora (Dhanpat Rai)',
    short_name: 'Sumita Arora',
    focus_area: 'Computer Science',
    website: null,
  },
  {
    name: 'Lakhmir Singh (S. Chand)',
    short_name: 'Lakhmir Singh',
    focus_area: 'School Science',
    website: 'https://schandpublishing.com',
  },
  {
    name: "Trueman's Publication",
    short_name: "Trueman's",
    focus_area: 'Biology',
    website: null,
  },

  // ─── COMPETITIVE PUBLISHERS ───────────────────────────────────────────────────
  {
    name: 'Arihant Publications',
    short_name: 'Arihant',
    focus_area: 'All competitive exams',
    website: 'https://arihantbooks.com',
  },
  {
    name: 'Disha Publications',
    short_name: 'Disha',
    focus_area: 'UPSC + State PSC + Banking',
    website: 'https://dishapublication.com',
  },
  {
    name: 'MTG Learning Media',
    short_name: 'MTG',
    focus_area: 'NEET + JEE + Olympiad',
    website: 'https://mtg.in',
  },
  {
    name: 'Cengage Learning India',
    short_name: 'Cengage',
    focus_area: 'JEE Advanced',
    website: null,
  },
  {
    name: 'DC Pandey (Arihant)',
    short_name: 'DC Pandey',
    focus_area: 'Physics (JEE/NEET)',
    website: 'https://arihantbooks.com',
  },
  {
    name: 'Bharati Bhawan Publishers',
    short_name: 'Bharati Bhawan',
    focus_area: 'School + Competitive (HC Verma)',
    website: null,
  },
  {
    name: 'Lucent Publications',
    short_name: 'Lucent',
    focus_area: 'GK + SSC + Banking',
    website: null,
  },
  {
    name: 'Kiran Prakashan',
    short_name: 'Kiran',
    focus_area: 'SSC + Banking',
    website: null,
  },
  {
    name: 'Rakesh Yadav Readers Publication',
    short_name: 'Rakesh Yadav',
    focus_area: 'SSC Mathematics',
    website: null,
  },
  {
    name: 'Spectrum Books',
    short_name: 'Spectrum',
    focus_area: 'Modern History (UPSC)',
    website: null,
  },
  {
    name: 'Shankar IAS Academy',
    short_name: 'Shankar IAS',
    focus_area: 'Environment + UPSC',
    website: 'https://shankarias.in',
  },
  {
    name: 'Vision IAS',
    short_name: 'Vision IAS',
    focus_area: 'UPSC Current Affairs + GS',
    website: 'https://visionias.in',
  },
  {
    name: 'Insights IAS',
    short_name: 'Insights IAS',
    focus_area: 'UPSC',
    website: 'https://insightsonindia.com',
  },
  {
    name: 'Unique Publications',
    short_name: 'Unique',
    focus_area: 'GPSC + Gujarat State PSC',
    website: null,
  },
  {
    name: 'Target Publications',
    short_name: 'Target',
    focus_area: 'MPSC + Maharashtra',
    website: 'https://targetpublications.org',
  },
  {
    name: 'Sura Books',
    short_name: 'Sura',
    focus_area: 'TNPSC + Tamil Nadu',
    website: null,
  },
  {
    name: 'Sapna Book House',
    short_name: 'Sapna',
    focus_area: 'KPSC + Karnataka',
    website: null,
  },
  {
    name: 'GC Leong (ELBS/Longman)',
    short_name: 'GC Leong',
    focus_area: 'Geography',
    website: null,
  },
  {
    name: 'Orient BlackSwan',
    short_name: 'Orient BlackSwan',
    focus_area: 'History + Social Science',
    website: 'https://www.orientblackswan.com',
  },
  {
    name: 'Tata McGraw Hill (TMH)',
    short_name: 'TMH',
    focus_area: 'UPSC General Studies',
    website: null,
  },
  {
    name: 'Vajiram & Ravi',
    short_name: 'Vajiram & Ravi',
    focus_area: 'UPSC coaching notes',
    website: 'https://vajiramandravi.com',
  },
  {
    name: 'Pathfinder Academy (Arihant)',
    short_name: 'Pathfinder',
    focus_area: 'NDA + CDS',
    website: 'https://arihantbooks.com',
  },

  // ─── ADDITIONAL PUBLISHERS (required for competitive books seed) ──────────────
  {
    name: 'GRB Publishers',
    short_name: 'GRB',
    focus_area: 'JEE Chemistry (P Bahadur, OP Tandon)',
    website: null,
  },
  {
    name: 'Balaji Publications',
    short_name: 'Balaji',
    focus_area: 'JEE Chemistry — Organic',
    website: null,
  },
  {
    name: 'Wiley India',
    short_name: 'Wiley',
    focus_area: 'JEE Advanced Chemistry',
    website: null,
  },
  {
    name: 'Mir Publishers',
    short_name: 'Mir',
    focus_area: 'Advanced Physics (IE Irodov)',
    website: null,
  },
  {
    name: 'Penguin India',
    short_name: 'Penguin',
    focus_area: 'History + Literature',
    website: null,
  },
  {
    name: 'LexisNexis India',
    short_name: 'LexisNexis',
    focus_area: 'Law + Polity',
    website: null,
  },
  {
    name: 'National Book Trust (NBT)',
    short_name: 'NBT',
    focus_area: 'General reading + Reference',
    website: 'https://nbtindia.gov.in',
  },
  {
    name: 'New Age International',
    short_name: 'New Age',
    focus_area: 'Academic + UPSC',
    website: null,
  },
  {
    name: 'BSC Publishing',
    short_name: 'BSC',
    focus_area: 'Banking + Reasoning',
    website: null,
  },
  {
    name: 'Chronicle Publications',
    short_name: 'Chronicle',
    focus_area: 'UPSC Current Affairs + Ethics',
    website: null,
  },
  {
    name: 'NCERT',
    short_name: 'NCERT',
    focus_area: 'School textbooks — free official',
    website: 'https://ncert.nic.in',
    is_available_free: true,
  },
];

async function run() {
  console.log('[SEED] publishers.seed.js — starting...');

  let inserted = 0;
  for (const p of publishers) {
    const [result] = await pool.execute(
      `INSERT IGNORE INTO publishers (name, short_name, focus_area, website, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [p.name, p.short_name || null, p.focus_area || null, p.website || null]
    );
    if (result.affectedRows > 0) inserted++;
  }

  console.log(`[SEED] publishers.seed.js — done. Inserted ${inserted} new / ${publishers.length - inserted} already existed.`);
  await pool.end();
}

run().catch(err => {
  console.error('[SEED] publishers.seed.js FAILED:', err.message);
  process.exit(1);
});
