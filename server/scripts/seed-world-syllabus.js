require('dotenv').config({ path: '../.env' });
const { generateSchoolBoardSyllabus, generateCompetitiveExam, generateUniversityCourse } = require('../src/services/ai-syllabus-generator.service');
const { pool } = require('../src/config/database');

async function run() {
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  SYLLABRIX AI MASTER SYLLABUS SEEDER (Powered by AI Engine)  ');
  console.log('─────────────────────────────────────────────────────────────────\n');

  try {
    // 1. Seed Top School Boards
    console.log('\n=== SEEDING TOP SCHOOL BOARDS ===');
    await generateSchoolBoardSyllabus('Central Board of Secondary Education', 'CBSE', ['10', '11']);
    
    // 2. Seed Top Competitive Exams
    console.log('\n=== SEEDING TOP COMPETITIVE EXAMS ===');
    await generateCompetitiveExam('JEE-MAIN', 'Joint Entrance Examination Main', 'Engineering', 'Undergraduate');
    await generateCompetitiveExam('NEET-UG', 'National Eligibility Entrance Test', 'Medical', 'Undergraduate');

    // 3. Seed Top Universities
    console.log('\n=== SEEDING TOP UNIVERSITIES ===');
    await generateUniversityCourse('Delhi University', 'B.Com (Hons.)', 'UG');
    await generateUniversityCourse('IIT Bombay', 'B.Tech Computer Science', 'UG');
    
    console.log('\n=============================================');
    console.log('✓ Syllabus Global Seeding Complete!');
    console.log('You can easily add hundreds more by utilizing these generator functions!');
    console.log('=============================================');

  } catch (error) {
    console.error('\n✗ Seeder Error:', error);
  } finally {
    // Close DB pool to let script exit
    if (pool && pool.end) {
      pool.end();
    }
    process.exit(0);
  }
}

run();
