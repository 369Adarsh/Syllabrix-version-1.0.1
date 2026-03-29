/**
 * Seed: exam_categories.seed.js
 * Seeds all competitive exam categories: Engineering, Medical, Civil Services,
 * State PSC, Banking, SSC, Defence.
 * Idempotent — uses INSERT IGNORE on unique code.
 *
 * Run from server/ directory:
 *   node src/database/seeds/exam_categories.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

const categories = [
  // ─── ENGINEERING ──────────────────────────────────────────────────────────────
  {
    code: 'JEE_MAIN', name: 'Joint Entrance Examination Main',
    type: 'engineering', level: 'national', state: null,
    conducting_body: 'NTA',
    official_website: 'https://jeemain.nta.nic.in',
  },
  {
    code: 'JEE_ADV', name: 'Joint Entrance Examination Advanced',
    type: 'engineering', level: 'national', state: null,
    conducting_body: 'IIT (Joint Admission Board)',
    official_website: 'https://jeeadv.ac.in',
  },
  {
    code: 'BITSAT', name: 'BITS Admission Test',
    type: 'engineering', level: 'national', state: null,
    conducting_body: 'BITS Pilani',
    official_website: 'https://www.bitsadmission.com',
  },
  {
    code: 'VITEEE', name: 'VIT Engineering Entrance Examination',
    type: 'engineering', level: 'national', state: null,
    conducting_body: 'VIT University',
    official_website: 'https://viteee.vit.ac.in',
  },
  {
    code: 'MHT_CET', name: 'Maharashtra Common Entrance Test (Engineering)',
    type: 'engineering', level: 'state', state: 'Maharashtra',
    conducting_body: 'State CET Cell Maharashtra',
    official_website: 'https://cetcell.mahacet.org',
  },

  // ─── MEDICAL ──────────────────────────────────────────────────────────────────
  {
    code: 'NEET_UG', name: 'National Eligibility cum Entrance Test (UG)',
    type: 'medical', level: 'national', state: null,
    conducting_body: 'NTA',
    official_website: 'https://neet.nta.nic.in',
  },
  {
    code: 'AIIMS', name: 'AIIMS MBBS Entrance (now merged with NEET)',
    type: 'medical', level: 'national', state: null,
    conducting_body: 'AIIMS New Delhi',
    official_website: 'https://aiimsexams.ac.in',
  },
  {
    code: 'JIPMER', name: 'JIPMER MBBS Entrance',
    type: 'medical', level: 'national', state: null,
    conducting_body: 'JIPMER Puducherry',
    official_website: 'https://jipmer.edu.in',
  },

  // ─── CIVIL SERVICES ───────────────────────────────────────────────────────────
  {
    code: 'UPSC_IAS', name: 'UPSC Civil Services Examination (IAS/IPS/IFS)',
    type: 'civil_services', level: 'national', state: null,
    conducting_body: 'UPSC',
    official_website: 'https://upsc.gov.in',
  },
  {
    code: 'UPSC_CDS', name: 'Combined Defence Services Examination',
    type: 'civil_services', level: 'national', state: null,
    conducting_body: 'UPSC',
    official_website: 'https://upsc.gov.in',
  },
  {
    code: 'UPSC_CAPF', name: 'Central Armed Police Forces Examination',
    type: 'civil_services', level: 'national', state: null,
    conducting_body: 'UPSC',
    official_website: 'https://upsc.gov.in',
  },

  // ─── STATE PSC ────────────────────────────────────────────────────────────────
  {
    code: 'GPSC',  name: 'Gujarat Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Gujarat',
    conducting_body: 'GPSC', official_website: 'https://gpsc.gujarat.gov.in',
  },
  {
    code: 'MPSC',  name: 'Maharashtra Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Maharashtra',
    conducting_body: 'MPSC', official_website: 'https://mpsc.gov.in',
  },
  {
    code: 'UPPSC', name: 'Uttar Pradesh Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Uttar Pradesh',
    conducting_body: 'UPPSC', official_website: 'https://uppsc.up.nic.in',
  },
  {
    code: 'TNPSC', name: 'Tamil Nadu Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Tamil Nadu',
    conducting_body: 'TNPSC', official_website: 'https://www.tnpsc.gov.in',
  },
  {
    code: 'KPSC',  name: 'Karnataka Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Karnataka',
    conducting_body: 'KPSC', official_website: 'https://kpsc.kar.nic.in',
  },
  {
    code: 'RPSC',  name: 'Rajasthan Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Rajasthan',
    conducting_body: 'RPSC', official_website: 'https://rpsc.rajasthan.gov.in',
  },
  {
    code: 'BPSC',  name: 'Bihar Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Bihar',
    conducting_body: 'BPSC', official_website: 'https://bpsc.bih.nic.in',
  },
  {
    code: 'MPPSC', name: 'Madhya Pradesh Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Madhya Pradesh',
    conducting_body: 'MPPSC', official_website: 'https://mppsc.mp.gov.in',
  },
  {
    code: 'WBPSC', name: 'West Bengal Public Service Commission',
    type: 'state_psc', level: 'state', state: 'West Bengal',
    conducting_body: 'WBPSC', official_website: 'https://pscwb.org.in',
  },
  {
    code: 'HPSC',  name: 'Haryana Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Haryana',
    conducting_body: 'HPSC', official_website: 'https://hpsc.gov.in',
  },
  {
    code: 'PPSC',  name: 'Punjab Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Punjab',
    conducting_body: 'PPSC', official_website: 'https://ppsc.gov.in',
  },
  {
    code: 'APPSC', name: 'Andhra Pradesh Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Andhra Pradesh',
    conducting_body: 'APPSC', official_website: 'https://psc.ap.gov.in',
  },
  {
    code: 'TSPSC', name: 'Telangana State Public Service Commission',
    type: 'state_psc', level: 'state', state: 'Telangana',
    conducting_body: 'TSPSC', official_website: 'https://www.tspsc.gov.in',
  },

  // ─── BANKING ──────────────────────────────────────────────────────────────────
  {
    code: 'SBI_PO',     name: 'SBI Probationary Officer',
    type: 'banking', level: 'national', state: null,
    conducting_body: 'State Bank of India',
    official_website: 'https://sbi.co.in/careers',
  },
  {
    code: 'IBPS_PO',    name: 'IBPS Probationary Officer',
    type: 'banking', level: 'national', state: null,
    conducting_body: 'IBPS',
    official_website: 'https://ibps.in',
  },
  {
    code: 'IBPS_CLERK', name: 'IBPS Clerk',
    type: 'banking', level: 'national', state: null,
    conducting_body: 'IBPS',
    official_website: 'https://ibps.in',
  },
  {
    code: 'RBI_GRADE_B', name: 'RBI Grade B Officer',
    type: 'banking', level: 'national', state: null,
    conducting_body: 'Reserve Bank of India',
    official_website: 'https://rbi.org.in',
  },
  {
    code: 'NABARD',     name: 'NABARD Grade A Officer',
    type: 'banking', level: 'national', state: null,
    conducting_body: 'NABARD',
    official_website: 'https://nabard.org',
  },

  // ─── SSC ──────────────────────────────────────────────────────────────────────
  {
    code: 'SSC_CGL',  name: 'SSC Combined Graduate Level',
    type: 'ssc', level: 'national', state: null,
    conducting_body: 'Staff Selection Commission',
    official_website: 'https://ssc.nic.in',
  },
  {
    code: 'SSC_CHSL', name: 'SSC Combined Higher Secondary Level',
    type: 'ssc', level: 'national', state: null,
    conducting_body: 'Staff Selection Commission',
    official_website: 'https://ssc.nic.in',
  },
  {
    code: 'SSC_GD',   name: 'SSC GD Constable',
    type: 'ssc', level: 'national', state: null,
    conducting_body: 'Staff Selection Commission',
    official_website: 'https://ssc.nic.in',
  },
  {
    code: 'SSC_CPO',  name: 'SSC Central Police Organisation',
    type: 'ssc', level: 'national', state: null,
    conducting_body: 'Staff Selection Commission',
    official_website: 'https://ssc.nic.in',
  },

  // ─── DEFENCE ──────────────────────────────────────────────────────────────────
  {
    code: 'NDA',   name: 'National Defence Academy',
    type: 'defence', level: 'national', state: null,
    conducting_body: 'UPSC',
    official_website: 'https://upsc.gov.in',
  },
  {
    code: 'CDS',   name: 'Combined Defence Services',
    type: 'defence', level: 'national', state: null,
    conducting_body: 'UPSC',
    official_website: 'https://upsc.gov.in',
  },
  {
    code: 'AFCAT', name: 'Air Force Common Admission Test',
    type: 'defence', level: 'national', state: null,
    conducting_body: 'Indian Air Force',
    official_website: 'https://afcat.cdac.in',
  },
  {
    code: 'MNS',   name: 'Military Nursing Service',
    type: 'defence', level: 'national', state: null,
    conducting_body: 'Indian Army',
    official_website: 'https://joinindianarmy.nic.in',
  },
];

async function run() {
  console.log('[SEED] exam_categories.seed.js — starting...');

  let inserted = 0;
  for (const cat of categories) {
    // slug must be unique & NOT NULL (PrepSmart schema requirement); derive from code
    const slug = cat.code.toLowerCase().replace(/_/g, '-');
    const [result] = await pool.execute(
      `INSERT IGNORE INTO exam_categories
         (code, slug, name, exam_type, exam_level, state, conducting_body, official_website, is_active)
       VALUES (?,?,?,?,?,?,?,?,1)`,
      [cat.code, slug, cat.name, cat.type, cat.level, cat.state || null, cat.conducting_body || null, cat.official_website || null]
    );
    if (result.affectedRows > 0) inserted++;
  }

  console.log(`[SEED] exam_categories.seed.js — done. Inserted ${inserted} / ${categories.length - inserted} already existed.`);
  await pool.end();
}

run().catch(err => {
  console.error('[SEED] exam_categories.seed.js FAILED:', err.message);
  process.exit(1);
});
