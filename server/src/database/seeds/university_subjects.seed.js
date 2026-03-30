/**
 * Seed: university_subjects.seed.js
 * Seeds semester-wise subjects for top courses:
 *   B.Tech CS (8 sem), B.Tech Mechanical (8 sem), B.Tech Electrical (8 sem),
 *   MBBS (9 phases), MBA (4 sem), B.Com (6 sem), B.Sc Physics (6 sem)
 *
 * All subjects are seeded as common across universities (university_id = NULL).
 * Idempotent — INSERT IGNORE on (course_id, name, semester).
 *
 * Run from server/ directory:
 *   node src/database/seeds/university_subjects.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

async function getCourseId(shortName, spec) {
  let sql = `SELECT id FROM courses WHERE short_name = ?`;
  const params = [shortName];
  if (spec) { sql += ` AND specialization = ?`; params.push(spec); }
  else       { sql += ` AND (specialization IS NULL OR specialization = '')`; }
  sql += ` LIMIT 1`;
  const [rows] = await pool.execute(sql, params);
  if (!rows.length) throw new Error(`Course not found: ${shortName} / ${spec}`);
  return rows[0].id;
}

async function insertSubjects(courseId, subjects) {
  let count = 0;
  for (const s of subjects) {
    const [result] = await pool.execute(
      `INSERT IGNORE INTO university_subjects
         (course_id, university_id, name, subject_code, semester, year,
          subject_type, credits, is_common_across_uni, syllabus_body, is_active)
       VALUES (?,NULL,?,?,?,?,?,?,1,'Common',1)`,
      [courseId, s.name, s.code || null, s.sem || null,
       s.year || Math.ceil((s.sem || 1) / 2), s.type || 'core', s.credits || 4]
    );
    if (result.affectedRows > 0) count++;
  }
  return count;
}

async function run() {
  console.log('[SEED] university_subjects.seed.js — starting...');
  let total = 0;

  // ─── B.TECH COMPUTER SCIENCE ────────────────────────────────────────────────
  const btechCsId = await getCourseId('B.Tech', 'Computer Science and Engineering');
  const btechCsSubjects = [
    // Semester 1
    { sem: 1, name: 'Engineering Mathematics I',        code: 'MA101', credits: 4 },
    { sem: 1, name: 'Engineering Physics',              code: 'PH101', credits: 4 },
    { sem: 1, name: 'Engineering Chemistry',            code: 'CH101', credits: 4 },
    { sem: 1, name: 'Programming in C',                 code: 'CS101', credits: 4 },
    { sem: 1, name: 'Engineering Graphics',             code: 'ME101', credits: 3 },
    { sem: 1, name: 'English Communication',            code: 'HS101', credits: 2 },
    // Semester 2
    { sem: 2, name: 'Engineering Mathematics II',       code: 'MA102', credits: 4 },
    { sem: 2, name: 'Data Structures',                  code: 'CS201', credits: 4 },
    { sem: 2, name: 'Digital Electronics',              code: 'EC201', credits: 4 },
    { sem: 2, name: 'Object Oriented Programming',      code: 'CS202', credits: 4 },
    { sem: 2, name: 'Environmental Science',            code: 'EV201', credits: 2 },
    { sem: 2, name: 'Engineering Mechanics',            code: 'ME201', credits: 3 },
    // Semester 3
    { sem: 3, name: 'Discrete Mathematics',             code: 'MA301', credits: 4 },
    { sem: 3, name: 'Computer Organization and Architecture', code: 'CS301', credits: 4 },
    { sem: 3, name: 'Operating Systems',                code: 'CS302', credits: 4 },
    { sem: 3, name: 'Database Management Systems',      code: 'CS303', credits: 4 },
    { sem: 3, name: 'Software Engineering',             code: 'CS304', credits: 3 },
    { sem: 3, name: 'Theory of Computation',            code: 'CS305', credits: 4 },
    // Semester 4
    { sem: 4, name: 'Algorithm Analysis and Design',    code: 'CS401', credits: 4 },
    { sem: 4, name: 'Computer Networks',                code: 'CS402', credits: 4 },
    { sem: 4, name: 'Microprocessors and Interfacing',  code: 'CS403', credits: 4 },
    { sem: 4, name: 'Web Technologies',                 code: 'CS404', credits: 3 },
    { sem: 4, name: 'Probability and Statistics',       code: 'MA401', credits: 4 },
    { sem: 4, name: 'Compiler Design',                  code: 'CS405', credits: 4 },
    // Semester 5
    { sem: 5, name: 'Artificial Intelligence',          code: 'CS501', credits: 4 },
    { sem: 5, name: 'Machine Learning',                 code: 'CS502', credits: 4 },
    { sem: 5, name: 'Computer Graphics',                code: 'CS503', credits: 3 },
    { sem: 5, name: 'System Programming',               code: 'CS504', credits: 3 },
    { sem: 5, name: 'Information Security',             code: 'CS505', credits: 3 },
    { sem: 5, name: 'Elective I',                       code: 'CS506', credits: 3, type: 'elective' },
    // Semester 6
    { sem: 6, name: 'Big Data Analytics',               code: 'CS601', credits: 4 },
    { sem: 6, name: 'Cloud Computing',                  code: 'CS602', credits: 3 },
    { sem: 6, name: 'Mobile Computing',                 code: 'CS603', credits: 3 },
    { sem: 6, name: 'Software Testing and Quality',     code: 'CS604', credits: 3 },
    { sem: 6, name: 'Distributed Systems',              code: 'CS605', credits: 4 },
    { sem: 6, name: 'Elective II',                      code: 'CS606', credits: 3, type: 'elective' },
    // Semester 7
    { sem: 7, name: 'Deep Learning',                    code: 'CS701', credits: 4 },
    { sem: 7, name: 'Natural Language Processing',      code: 'CS702', credits: 4 },
    { sem: 7, name: 'Internet of Things',               code: 'CS703', credits: 3 },
    { sem: 7, name: 'Project Management',               code: 'CS704', credits: 2 },
    { sem: 7, name: 'Elective III',                     code: 'CS705', credits: 3, type: 'elective' },
    { sem: 7, name: 'Minor Project',                    code: 'CS706', credits: 4, type: 'project' },
    // Semester 8
    { sem: 8, name: 'Major Project',                    code: 'CS801', credits: 10, type: 'project' },
    { sem: 8, name: 'Industry Internship',              code: 'CS802', credits: 6,  type: 'internship' },
    { sem: 8, name: 'Technical Seminar',                code: 'CS803', credits: 2  },
    { sem: 8, name: 'Elective IV',                      code: 'CS804', credits: 3, type: 'elective' },
  ];
  total += await insertSubjects(btechCsId, btechCsSubjects);
  console.log('  ✓ B.Tech CS subjects inserted');

  // ─── B.TECH MECHANICAL ENGINEERING ──────────────────────────────────────────
  const btechMechId = await getCourseId('B.Tech', 'Mechanical Engineering');
  const btechMechSubjects = [
    // Semester 1 & 2 (common with CS)
    { sem: 1, name: 'Engineering Mathematics I',        code: 'MA101', credits: 4 },
    { sem: 1, name: 'Engineering Physics',              code: 'PH101', credits: 4 },
    { sem: 1, name: 'Engineering Chemistry',            code: 'CH101', credits: 4 },
    { sem: 1, name: 'Workshop Technology',              code: 'ME102', credits: 3 },
    { sem: 1, name: 'Engineering Graphics',             code: 'ME101', credits: 3 },
    { sem: 1, name: 'English Communication',            code: 'HS101', credits: 2 },
    { sem: 2, name: 'Engineering Mathematics II',       code: 'MA102', credits: 4 },
    { sem: 2, name: 'Programming in C',                 code: 'CS101', credits: 3 },
    { sem: 2, name: 'Environmental Science',            code: 'EV201', credits: 2 },
    { sem: 2, name: 'Engineering Mechanics',            code: 'ME201', credits: 4 },
    { sem: 2, name: 'Basic Electrical and Electronics', code: 'EE201', credits: 3 },
    // Semester 3
    { sem: 3, name: 'Engineering Thermodynamics',       code: 'ME301', credits: 4 },
    { sem: 3, name: 'Fluid Mechanics',                  code: 'ME302', credits: 4 },
    { sem: 3, name: 'Materials Science and Engineering',code: 'ME303', credits: 4 },
    { sem: 3, name: 'Manufacturing Technology I',       code: 'ME304', credits: 4 },
    { sem: 3, name: 'Kinematics of Machines',           code: 'ME305', credits: 4 },
    { sem: 3, name: 'Strength of Materials',            code: 'ME306', credits: 4 },
    // Semester 4
    { sem: 4, name: 'Heat Transfer',                    code: 'ME401', credits: 4 },
    { sem: 4, name: 'Machine Design I',                 code: 'ME402', credits: 4 },
    { sem: 4, name: 'Metrology and Quality Control',    code: 'ME403', credits: 3 },
    { sem: 4, name: 'Industrial Engineering',           code: 'ME404', credits: 3 },
    { sem: 4, name: 'Dynamics of Machines',             code: 'ME405', credits: 4 },
    { sem: 4, name: 'Manufacturing Technology II',      code: 'ME406', credits: 4 },
    // Semester 5
    { sem: 5, name: 'Advanced Manufacturing Technology',code:'ME501',  credits: 4 },
    { sem: 5, name: 'CAD/CAM',                          code: 'ME502', credits: 4 },
    { sem: 5, name: 'Internal Combustion Engines',      code: 'ME503', credits: 3 },
    { sem: 5, name: 'Machine Design II',                code: 'ME504', credits: 4 },
    { sem: 5, name: 'Refrigeration and Air Conditioning',code:'ME505', credits: 3 },
    { sem: 5, name: 'Elective I',                       code: 'ME506', credits: 3, type: 'elective' },
    // Semester 6
    { sem: 6, name: 'Robotics and Automation',          code: 'ME601', credits: 4 },
    { sem: 6, name: 'Finite Element Analysis',          code: 'ME602', credits: 4 },
    { sem: 6, name: 'Automobile Engineering',           code: 'ME603', credits: 3 },
    { sem: 6, name: 'Operations Research',              code: 'ME604', credits: 3 },
    { sem: 6, name: 'Turbomachinery',                   code: 'ME605', credits: 4 },
    { sem: 6, name: 'Elective II',                      code: 'ME606', credits: 3, type: 'elective' },
    // Semester 7
    { sem: 7, name: 'Power Plant Engineering',          code: 'ME701', credits: 4 },
    { sem: 7, name: 'Non-Destructive Testing',          code: 'ME702', credits: 3 },
    { sem: 7, name: 'Elective III',                     code: 'ME703', credits: 3, type: 'elective' },
    { sem: 7, name: 'Minor Project',                    code: 'ME704', credits: 4, type: 'project' },
    // Semester 8
    { sem: 8, name: 'Major Project',                    code: 'ME801', credits: 10, type: 'project' },
    { sem: 8, name: 'Industry Internship',              code: 'ME802', credits: 6,  type: 'internship' },
    { sem: 8, name: 'Elective IV',                      code: 'ME803', credits: 3, type: 'elective' },
  ];
  total += await insertSubjects(btechMechId, btechMechSubjects);
  console.log('  ✓ B.Tech Mechanical subjects inserted');

  // ─── B.TECH ELECTRICAL ENGINEERING ──────────────────────────────────────────
  const btechEeId = await getCourseId('B.Tech', 'Electrical Engineering');
  const btechEeSubjects = [
    { sem: 1, name: 'Engineering Mathematics I',           code: 'MA101', credits: 4 },
    { sem: 1, name: 'Engineering Physics',                 code: 'PH101', credits: 4 },
    { sem: 1, name: 'Engineering Chemistry',               code: 'CH101', credits: 4 },
    { sem: 1, name: 'Basic Electrical Engineering',        code: 'EE101', credits: 4 },
    { sem: 1, name: 'Engineering Graphics',                code: 'ME101', credits: 3 },
    { sem: 1, name: 'English Communication',               code: 'HS101', credits: 2 },
    { sem: 2, name: 'Engineering Mathematics II',          code: 'MA102', credits: 4 },
    { sem: 2, name: 'Circuit Theory',                      code: 'EE201', credits: 4 },
    { sem: 2, name: 'Programming in C',                    code: 'CS101', credits: 3 },
    { sem: 2, name: 'Environmental Science',               code: 'EV201', credits: 2 },
    { sem: 2, name: 'Engineering Mechanics',               code: 'ME201', credits: 3 },
    { sem: 3, name: 'Electromagnetic Theory',              code: 'EE301', credits: 4 },
    { sem: 3, name: 'Electrical Machines I',               code: 'EE302', credits: 4 },
    { sem: 3, name: 'Digital Electronics',                 code: 'EC301', credits: 4 },
    { sem: 3, name: 'Signals and Systems',                 code: 'EE303', credits: 4 },
    { sem: 3, name: 'Engineering Mathematics III',         code: 'MA301', credits: 4 },
    { sem: 4, name: 'Electrical Machines II',              code: 'EE401', credits: 4 },
    { sem: 4, name: 'Power Systems I',                     code: 'EE402', credits: 4 },
    { sem: 4, name: 'Control Systems',                     code: 'EE403', credits: 4 },
    { sem: 4, name: 'Microprocessors and Controllers',     code: 'EE404', credits: 4 },
    { sem: 4, name: 'Measurement and Instrumentation',     code: 'EE405', credits: 3 },
    { sem: 5, name: 'Power Electronics',                   code: 'EE501', credits: 4 },
    { sem: 5, name: 'Power Systems II',                    code: 'EE502', credits: 4 },
    { sem: 5, name: 'Signal Processing',                   code: 'EE503', credits: 4 },
    { sem: 5, name: 'High Voltage Engineering',            code: 'EE504', credits: 3 },
    { sem: 5, name: 'Elective I',                          code: 'EE505', credits: 3, type: 'elective' },
    { sem: 6, name: 'Electric Drives',                     code: 'EE601', credits: 4 },
    { sem: 6, name: 'Switchgear and Protection',           code: 'EE602', credits: 4 },
    { sem: 6, name: 'Renewable Energy Systems',            code: 'EE603', credits: 3 },
    { sem: 6, name: 'VLSI Design',                         code: 'EE604', credits: 3 },
    { sem: 6, name: 'Elective II',                         code: 'EE605', credits: 3, type: 'elective' },
    { sem: 7, name: 'Smart Grid Technology',               code: 'EE701', credits: 4 },
    { sem: 7, name: 'Elective III',                        code: 'EE702', credits: 3, type: 'elective' },
    { sem: 7, name: 'Minor Project',                       code: 'EE703', credits: 4, type: 'project' },
    { sem: 8, name: 'Major Project',                       code: 'EE801', credits: 10, type: 'project' },
    { sem: 8, name: 'Industry Internship',                 code: 'EE802', credits: 6,  type: 'internship' },
    { sem: 8, name: 'Elective IV',                         code: 'EE803', credits: 3, type: 'elective' },
  ];
  total += await insertSubjects(btechEeId, btechEeSubjects);
  console.log('  ✓ B.Tech Electrical subjects inserted');

  // ─── MBBS ────────────────────────────────────────────────────────────────────
  const mbbsId = await getCourseId('MBBS', null);
  const mbbsSubjects = [
    // Phase I
    { sem: 1, name: 'Anatomy',                              code: 'AN101', credits: 8 },
    { sem: 1, name: 'Physiology',                           code: 'PH101', credits: 8 },
    { sem: 1, name: 'Biochemistry',                         code: 'BC101', credits: 6 },
    { sem: 2, name: 'Anatomy II',                           code: 'AN201', credits: 8 },
    { sem: 2, name: 'Physiology II',                        code: 'PH201', credits: 8 },
    { sem: 2, name: 'Introduction to Community Medicine',   code: 'CM201', credits: 4 },
    // Phase II
    { sem: 3, name: 'Pathology',                            code: 'PT301', credits: 8 },
    { sem: 3, name: 'Pharmacology',                         code: 'PK301', credits: 8 },
    { sem: 3, name: 'Microbiology',                         code: 'MB301', credits: 8 },
    { sem: 4, name: 'Forensic Medicine and Toxicology',     code: 'FM401', credits: 6 },
    { sem: 4, name: 'Community Medicine I',                 code: 'CM401', credits: 6 },
    { sem: 4, name: 'Pathology II',                         code: 'PT402', credits: 6 },
    { sem: 5, name: 'Community Medicine II',                code: 'CM501', credits: 6 },
    { sem: 5, name: 'Pharmacology II',                      code: 'PK501', credits: 6 },
    // Phase III Part 1
    { sem: 6, name: 'Ophthalmology',                        code: 'OP601', credits: 6 },
    { sem: 6, name: 'Ear Nose and Throat (ENT)',            code: 'EN601', credits: 6 },
    { sem: 6, name: 'Community Medicine III',               code: 'CM601', credits: 4 },
    // Phase III Part 2
    { sem: 7, name: 'General Medicine',                     code: 'GM701', credits: 10 },
    { sem: 7, name: 'General Surgery',                      code: 'GS701', credits: 10 },
    { sem: 8, name: 'Obstetrics and Gynaecology',           code: 'OG801', credits: 10 },
    { sem: 8, name: 'Paediatrics',                          code: 'PE801', credits: 8  },
    { sem: 9, name: 'Orthopaedics',                         code: 'OR901', credits: 6  },
    { sem: 9, name: 'Psychiatry',                           code: 'PS901', credits: 4  },
    { sem: 9, name: 'Dermatology and Venereology',          code: 'DV901', credits: 4  },
    { sem: 9, name: 'Radiology',                            code: 'RD901', credits: 4  },
    { sem: 9, name: 'Internship',                           code: 'INT901',credits: 12, type: 'internship' },
  ];
  total += await insertSubjects(mbbsId, mbbsSubjects);
  console.log('  ✓ MBBS subjects inserted');

  // ─── MBA ─────────────────────────────────────────────────────────────────────
  const mbaId = await getCourseId('MBA', null);
  const mbaSubjects = [
    { sem: 1, name: 'Management Concepts and Organizational Behaviour', code: 'MB101', credits: 4 },
    { sem: 1, name: 'Managerial Economics',                             code: 'MB102', credits: 4 },
    { sem: 1, name: 'Financial Accounting for Managers',                code: 'MB103', credits: 4 },
    { sem: 1, name: 'Business Statistics and Analytics',                code: 'MB104', credits: 4 },
    { sem: 1, name: 'Business Communication',                           code: 'MB105', credits: 2 },
    { sem: 1, name: 'Marketing Management',                             code: 'MB106', credits: 4 },
    { sem: 2, name: 'Financial Management',                             code: 'MB201', credits: 4 },
    { sem: 2, name: 'Human Resource Management',                        code: 'MB202', credits: 4 },
    { sem: 2, name: 'Operations Management',                            code: 'MB203', credits: 4 },
    { sem: 2, name: 'Business Law and Ethics',                          code: 'MB204', credits: 3 },
    { sem: 2, name: 'Research Methodology',                             code: 'MB205', credits: 3 },
    { sem: 2, name: 'Summer Internship',                                code: 'MB206', credits: 6, type: 'internship' },
    { sem: 3, name: 'Strategic Management',                             code: 'MB301', credits: 4 },
    { sem: 3, name: 'Elective I - Finance/Marketing/HR/Operations',     code: 'MB302', credits: 4, type: 'elective' },
    { sem: 3, name: 'Elective II',                                      code: 'MB303', credits: 4, type: 'elective' },
    { sem: 3, name: 'Elective III',                                     code: 'MB304', credits: 4, type: 'elective' },
    { sem: 4, name: 'Elective IV',                                      code: 'MB401', credits: 4, type: 'elective' },
    { sem: 4, name: 'Elective V',                                       code: 'MB402', credits: 4, type: 'elective' },
    { sem: 4, name: 'Dissertation / Major Project',                     code: 'MB403', credits: 8, type: 'project' },
  ];
  total += await insertSubjects(mbaId, mbaSubjects);
  console.log('  ✓ MBA subjects inserted');

  // ─── B.COM ───────────────────────────────────────────────────────────────────
  const bcomId = await getCourseId('B.Com', null);
  const bcomSubjects = [
    { sem: 1, name: 'Financial Accounting',                 code: 'CO101', credits: 4 },
    { sem: 1, name: 'Business Economics',                   code: 'CO102', credits: 4 },
    { sem: 1, name: 'Business Law',                         code: 'CO103', credits: 4 },
    { sem: 1, name: 'Business Mathematics',                 code: 'CO104', credits: 4 },
    { sem: 1, name: 'English Communication',                code: 'CO105', credits: 2 },
    { sem: 2, name: 'Advanced Financial Accounting',        code: 'CO201', credits: 4 },
    { sem: 2, name: 'Macro Economics',                      code: 'CO202', credits: 4 },
    { sem: 2, name: 'Business Organization',                code: 'CO203', credits: 4 },
    { sem: 2, name: 'Banking and Financial Institutions',   code: 'CO204', credits: 4 },
    { sem: 3, name: 'Corporate Accounting',                 code: 'CO301', credits: 4 },
    { sem: 3, name: 'Cost Accounting',                      code: 'CO302', credits: 4 },
    { sem: 3, name: 'Income Tax I',                         code: 'CO303', credits: 4 },
    { sem: 3, name: 'Business Statistics',                  code: 'CO304', credits: 4 },
    { sem: 4, name: 'Advanced Cost Accounting',             code: 'CO401', credits: 4 },
    { sem: 4, name: 'Income Tax II',                        code: 'CO402', credits: 4 },
    { sem: 4, name: 'Company Law',                          code: 'CO403', credits: 4 },
    { sem: 4, name: 'Marketing Management',                 code: 'CO404', credits: 3 },
    { sem: 5, name: 'Auditing and Assurance',               code: 'CO501', credits: 4 },
    { sem: 5, name: 'Financial Management',                 code: 'CO502', credits: 4 },
    { sem: 5, name: 'Management Accounting',                code: 'CO503', credits: 4 },
    { sem: 5, name: 'E-Commerce',                           code: 'CO504', credits: 3 },
    { sem: 6, name: 'Indirect Tax (GST)',                   code: 'CO601', credits: 4 },
    { sem: 6, name: 'International Business',               code: 'CO602', credits: 4 },
    { sem: 6, name: 'Project Work',                         code: 'CO603', credits: 6, type: 'project' },
    { sem: 6, name: 'Elective',                             code: 'CO604', credits: 4, type: 'elective' },
  ];
  total += await insertSubjects(bcomId, bcomSubjects);
  console.log('  ✓ B.Com subjects inserted');

  // ─── B.SC PHYSICS ────────────────────────────────────────────────────────────
  const bscPhysicsId = await getCourseId('B.Sc', 'Physics');
  const bscPhysicsSubjects = [
    { sem: 1, name: 'Mechanics',                            code: 'PH101', credits: 4 },
    { sem: 1, name: 'Calculus and Geometry',                code: 'MA101', credits: 4 },
    { sem: 1, name: 'Chemistry I',                          code: 'CH101', credits: 4 },
    { sem: 1, name: 'English and Communication',            code: 'HS101', credits: 2 },
    { sem: 2, name: 'Thermodynamics',                       code: 'PH201', credits: 4 },
    { sem: 2, name: 'Optics and Waves',                     code: 'PH202', credits: 4 },
    { sem: 2, name: 'Differential Equations',               code: 'MA201', credits: 4 },
    { sem: 2, name: 'Chemistry II',                         code: 'CH201', credits: 3 },
    { sem: 3, name: 'Electromagnetism',                     code: 'PH301', credits: 4 },
    { sem: 3, name: 'Mathematical Physics',                 code: 'PH302', credits: 4 },
    { sem: 3, name: 'Digital Electronics',                  code: 'PH303', credits: 4 },
    { sem: 3, name: 'Electronics Lab',                      code: 'PH304', credits: 2, type: 'lab' },
    { sem: 4, name: 'Quantum Mechanics I',                  code: 'PH401', credits: 4 },
    { sem: 4, name: 'Classical Mechanics',                  code: 'PH402', credits: 4 },
    { sem: 4, name: 'Special Theory of Relativity',         code: 'PH403', credits: 3 },
    { sem: 4, name: 'Physics Lab II',                       code: 'PH404', credits: 2, type: 'lab' },
    { sem: 5, name: 'Nuclear and Particle Physics',         code: 'PH501', credits: 4 },
    { sem: 5, name: 'Solid State Physics',                  code: 'PH502', credits: 4 },
    { sem: 5, name: 'Statistical Mechanics',                code: 'PH503', credits: 4 },
    { sem: 5, name: 'Quantum Mechanics II',                 code: 'PH504', credits: 4 },
    { sem: 6, name: 'Atomic and Molecular Physics',         code: 'PH601', credits: 4 },
    { sem: 6, name: 'Electronics and Devices',              code: 'PH602', credits: 4 },
    { sem: 6, name: 'Project Work',                         code: 'PH603', credits: 6, type: 'project' },
    { sem: 6, name: 'Elective',                             code: 'PH604', credits: 4, type: 'elective' },
  ];
  total += await insertSubjects(bscPhysicsId, bscPhysicsSubjects);
  console.log('  ✓ B.Sc Physics subjects inserted');

  console.log(`[SEED] university_subjects.seed.js — done. Inserted ${total} subjects total.`);
  await pool.end();
}

run().catch(err => {
  console.error('[SEED] university_subjects.seed.js FAILED:', err.message);
  process.exit(1);
});
