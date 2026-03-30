/**
 * Seed: course_categories.seed.js
 * Seeds 21 course categories covering all major Indian university disciplines.
 * Idempotent — INSERT IGNORE on name.
 *
 * Run from server/ directory:
 *   node src/database/seeds/course_categories.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

const categories = [
  { name: 'Engineering',          type: 'technical'   },
  { name: 'Medical',              type: 'medical'     },
  { name: 'Dental',               type: 'medical'     },
  { name: 'Nursing',              type: 'medical'     },
  { name: 'Pharmacy',             type: 'medical'     },
  { name: 'Ayurveda',             type: 'medical'     },
  { name: 'Homeopathy',           type: 'medical'     },
  { name: 'Science',              type: 'science'     },
  { name: 'Commerce',             type: 'commerce'    },
  { name: 'Arts',                 type: 'arts'        },
  { name: 'Law',                  type: 'law'         },
  { name: 'Education',            type: 'education'   },
  { name: 'Management',           type: 'management'  },
  { name: 'Agriculture',          type: 'agriculture' },
  { name: 'Design',               type: 'design'      },
  { name: 'Architecture',         type: 'technical'   },
  { name: 'Hotel Management',     type: 'management'  },
  { name: 'Media & Journalism',   type: 'arts'        },
  { name: 'Social Work',          type: 'arts'        },
  { name: 'Fine Arts',            type: 'design'      },
  { name: 'Physical Education',   type: 'other'       },
];

async function run() {
  console.log('[SEED] course_categories.seed.js — starting...');
  let inserted = 0;
  for (const cat of categories) {
    const [result] = await pool.execute(
      `INSERT IGNORE INTO course_categories (name, type, is_active) VALUES (?,?,1)`,
      [cat.name, cat.type]
    );
    if (result.affectedRows > 0) inserted++;
  }
  console.log(`[SEED] course_categories.seed.js — done. Inserted ${inserted} / ${categories.length}.`);
  await pool.end();
}

run().catch(err => {
  console.error('[SEED] course_categories.seed.js FAILED:', err.message);
  process.exit(1);
});
