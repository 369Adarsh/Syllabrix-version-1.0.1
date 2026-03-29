/**
 * Seed: boards.seed.js
 * Seeds all education boards (national, state, international).
 * Idempotent — safe to run multiple times (uses INSERT IGNORE).
 *
 * Run from server/ directory:
 *   node src/database/seeds/boards.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

const boards = [
  // ─── NATIONAL ────────────────────────────────────────────────────────────
  {
    code: 'CBSE',
    name: 'Central Board of Secondary Education',
    type: 'national',
    state: null,
    country: 'India',
    official_website: 'https://www.cbse.gov.in',
  },
  {
    code: 'ICSE',
    name: 'Indian Certificate of Secondary Education (Class 10)',
    type: 'national',
    state: null,
    country: 'India',
    official_website: 'https://www.cisce.org',
  },
  {
    code: 'ISC',
    name: 'Indian School Certificate (Class 12)',
    type: 'national',
    state: null,
    country: 'India',
    official_website: 'https://www.cisce.org',
  },
  {
    code: 'NIOS',
    name: 'National Institute of Open Schooling',
    type: 'national',
    state: null,
    country: 'India',
    official_website: 'https://www.nios.ac.in',
  },

  // ─── STATE BOARDS ─────────────────────────────────────────────────────────
  {
    code: 'GSEB',
    name: 'Gujarat Secondary and Higher Secondary Education Board',
    type: 'state',
    state: 'Gujarat',
    country: 'India',
    official_website: 'https://www.gseb.org',
  },
  {
    code: 'MSBSHSE',
    name: 'Maharashtra State Board of Secondary and Higher Secondary Education',
    type: 'state',
    state: 'Maharashtra',
    country: 'India',
    official_website: 'https://www.msbshse.co.in',
  },
  {
    code: 'UPMSP',
    name: 'Uttar Pradesh Madhyamik Shiksha Parishad',
    type: 'state',
    state: 'Uttar Pradesh',
    country: 'India',
    official_website: 'https://upmsp.edu.in',
  },
  {
    code: 'RBSE',
    name: 'Rajasthan Board of Secondary Education',
    type: 'state',
    state: 'Rajasthan',
    country: 'India',
    official_website: 'https://rajeduboard.rajasthan.gov.in',
  },
  {
    code: 'TNSB',
    name: 'Tamil Nadu State Board (TNDGE)',
    type: 'state',
    state: 'Tamil Nadu',
    country: 'India',
    official_website: 'https://www.dge.tn.gov.in',
  },
  {
    code: 'KSEEB',
    name: 'Karnataka Secondary Education Examination Board',
    type: 'state',
    state: 'Karnataka',
    country: 'India',
    official_website: 'https://kseab.karnataka.gov.in',
  },
  {
    code: 'SCERT-KL',
    name: 'State Council of Educational Research and Training Kerala',
    type: 'state',
    state: 'Kerala',
    country: 'India',
    official_website: 'https://www.keralapareekshabhavan.in',
  },
  {
    code: 'WBBSE',
    name: 'West Bengal Board of Secondary Education (Class 10)',
    type: 'state',
    state: 'West Bengal',
    country: 'India',
    official_website: 'https://www.wbbse.wb.gov.in',
  },
  {
    code: 'WBCHSE',
    name: 'West Bengal Council of Higher Secondary Education (Class 12)',
    type: 'state',
    state: 'West Bengal',
    country: 'India',
    official_website: 'https://www.wbchse.wb.gov.in',
  },
  {
    code: 'BSEB',
    name: 'Bihar School Examination Board',
    type: 'state',
    state: 'Bihar',
    country: 'India',
    official_website: 'https://biharboardonline.bihar.gov.in',
  },
  {
    code: 'MPBSE',
    name: 'Madhya Pradesh Board of Secondary Education',
    type: 'state',
    state: 'Madhya Pradesh',
    country: 'India',
    official_website: 'https://www.mpbse.nic.in',
  },
  {
    code: 'PSEB',
    name: 'Punjab School Education Board',
    type: 'state',
    state: 'Punjab',
    country: 'India',
    official_website: 'https://www.pseb.ac.in',
  },
  {
    code: 'HBSE',
    name: 'Haryana Board of School Education',
    type: 'state',
    state: 'Haryana',
    country: 'India',
    official_website: 'https://bseh.org.in',
  },
  {
    code: 'BSEAP',
    name: 'Board of Secondary Education Andhra Pradesh',
    type: 'state',
    state: 'Andhra Pradesh',
    country: 'India',
    official_website: 'https://bse.ap.gov.in',
  },
  {
    code: 'BSETS',
    name: 'Telangana State Board of Secondary Education',
    type: 'state',
    state: 'Telangana',
    country: 'India',
    official_website: 'https://bse.telangana.gov.in',
  },
  {
    code: 'CHSE',
    name: 'Council of Higher Secondary Education Odisha',
    type: 'state',
    state: 'Odisha',
    country: 'India',
    official_website: 'https://chseodisha.nic.in',
  },
  {
    code: 'SEBA',
    name: 'Board of Secondary Education Assam (Class 10)',
    type: 'state',
    state: 'Assam',
    country: 'India',
    official_website: 'https://sebaonline.org',
  },
  {
    code: 'AHSEC',
    name: 'Assam Higher Secondary Education Council (Class 12)',
    type: 'state',
    state: 'Assam',
    country: 'India',
    official_website: 'https://ahsec.assam.gov.in',
  },
  {
    code: 'JAC',
    name: 'Jharkhand Academic Council',
    type: 'state',
    state: 'Jharkhand',
    country: 'India',
    official_website: 'https://jac.jharkhand.gov.in',
  },
  {
    code: 'CGBSE',
    name: 'Chhattisgarh Board of Secondary Education',
    type: 'state',
    state: 'Chhattisgarh',
    country: 'India',
    official_website: 'https://cgbse.nic.in',
  },
  {
    code: 'HPBOSE',
    name: 'Himachal Pradesh Board of School Education',
    type: 'state',
    state: 'Himachal Pradesh',
    country: 'India',
    official_website: 'https://hpbose.org',
  },
  {
    code: 'UBSE',
    name: 'Uttarakhand Board of School Education',
    type: 'state',
    state: 'Uttarakhand',
    country: 'India',
    official_website: 'https://ubse.uk.gov.in',
  },
  {
    code: 'GBSHSE',
    name: 'Goa Board of Secondary and Higher Secondary Education',
    type: 'state',
    state: 'Goa',
    country: 'India',
    official_website: 'https://gbshse.in',
  },
  {
    code: 'JKBOSE',
    name: 'Jammu and Kashmir Board of School Education',
    type: 'state',
    state: 'Jammu & Kashmir',
    country: 'India',
    official_website: 'https://jkbose.nic.in',
  },
  {
    code: 'MBSE',
    name: 'Manipur Board of Secondary Education',
    type: 'state',
    state: 'Manipur',
    country: 'India',
    official_website: 'https://bsem.nic.in',
  },
  {
    code: 'MBOSE',
    name: 'Meghalaya Board of School Education',
    type: 'state',
    state: 'Meghalaya',
    country: 'India',
    official_website: 'https://mbose.in',
  },
  {
    code: 'NBSE',
    name: 'Nagaland Board of School Education',
    type: 'state',
    state: 'Nagaland',
    country: 'India',
    official_website: 'https://nbsenagaland.com',
  },
  {
    code: 'TBSE',
    name: 'Tripura Board of Secondary Education',
    type: 'state',
    state: 'Tripura',
    country: 'India',
    official_website: 'https://tbse.in',
  },
  {
    code: 'BSEM',
    name: 'Board of Secondary Education Mizoram',
    type: 'state',
    state: 'Mizoram',
    country: 'India',
    official_website: 'https://mbse.edu.in',
  },
  {
    code: 'COHSEM',
    name: 'Council of Higher Secondary Education Manipur',
    type: 'state',
    state: 'Manipur',
    country: 'India',
    official_website: 'https://cohsem.nic.in',
  },
  {
    code: 'SBSE-SK',
    name: 'Sikkim Board of Secondary Education',
    type: 'state',
    state: 'Sikkim',
    country: 'India',
    official_website: 'https://sikkim.gov.in/departments/human-resource-development-department',
  },

  // ─── INTERNATIONAL ────────────────────────────────────────────────────────
  {
    code: 'IB-PYP',
    name: 'International Baccalaureate — Primary Years Programme',
    type: 'international',
    state: null,
    country: 'International',
    official_website: 'https://www.ibo.org/programmes/primary-years-programme',
  },
  {
    code: 'IB-MYP',
    name: 'International Baccalaureate — Middle Years Programme',
    type: 'international',
    state: null,
    country: 'International',
    official_website: 'https://www.ibo.org/programmes/middle-years-programme',
  },
  {
    code: 'IB-DP',
    name: 'International Baccalaureate — Diploma Programme',
    type: 'international',
    state: null,
    country: 'International',
    official_website: 'https://www.ibo.org/programmes/diploma-programme',
  },
  {
    code: 'IGCSE',
    name: 'Cambridge IGCSE (International General Certificate of Secondary Education)',
    type: 'international',
    state: null,
    country: 'International',
    official_website: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse',
  },
  {
    code: 'CAL',
    name: 'Cambridge International A-Levels',
    type: 'international',
    state: null,
    country: 'International',
    official_website: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-levels',
  },
];

async function run() {
  console.log('[Seed] boards.seed.js — starting...');

  const sql = `
    INSERT IGNORE INTO boards (code, name, type, state, country, official_website, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `;

  let inserted = 0;
  for (const b of boards) {
    const [result] = await pool.execute(sql, [b.code, b.name, b.type, b.state || null, b.country, b.official_website || null]);
    if (result.affectedRows > 0) inserted++;
  }

  console.log(`[Seed] boards.seed.js — done. Inserted ${inserted} new boards (${boards.length - inserted} already existed).`);
  await pool.end();
}

run().catch(err => {
  console.error('[Seed] boards.seed.js FAILED:', err.message);
  process.exit(1);
});
