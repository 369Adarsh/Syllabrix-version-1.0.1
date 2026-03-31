require('dotenv').config({ path: '../.env' });
const { pool } = require('../src/config/database');
const { generateSchoolBoardSyllabus } = require('../src/services/ai-syllabus-generator.service');

async function seedPrimary() {
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('🌱 SYLLABRIX AI SEEDER: PRIMARY SCHOOL (CLASSES 1-5)');
  console.log('─────────────────────────────────────────────────────────────────\n');
  try {
    const classes = ['1', '2', '3', '4', '5'];
    
    // Injecting strict context so the AI knows these are elementary topics
    const refContext = `
      STRICT REQUIREMENT: Generate curriculum for primary school students (Classes 1 to 5) under the CBSE/NCERT framework.
      Subjects MUST include at least: Mathematics, English, Hindi, and Environmental Studies (EVS).
      Do NOT hallucinate older standard subjects like Physics or Chemistry. Keep topic names playful and age-appropriate as per authentic Grade 1-5 structure.
    `.trim();

    await generateSchoolBoardSyllabus('Central Board of Secondary Education', 'CBSE', classes, refContext);
    console.log('\n✅ Successfully seeded primary classes (1-5) for CBSE!');
  } catch (err) {
    console.error('❌ Error seeding primary classes:', err);
  } finally {
    if (pool?.end) pool.end();
    process.exit(0);
  }
}

seedPrimary();
