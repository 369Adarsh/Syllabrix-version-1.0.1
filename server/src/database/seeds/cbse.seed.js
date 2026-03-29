/**
 * Seed: cbse.seed.js
 * Seeds CBSE syllabus versions, classes 6-12, all subjects with NCERT books,
 * and full chapters for Class 9 & 10 Mathematics and Science.
 * NEP 2020 rationalization is marked (is_deleted_in_new_syllabus).
 * Idempotent — safe to run multiple times.
 *
 * Run from server/ directory (run boards.seed.js first):
 *   node src/database/seeds/cbse.seed.js
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { pool } = require('../connection');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getOrCreate(table, whereClause, whereValues, insertClause, insertValues) {
  const [rows] = await pool.execute(`SELECT id FROM ${table} WHERE ${whereClause}`, whereValues);
  if (rows.length) return rows[0].id;
  const [result] = await pool.execute(`INSERT INTO ${table} ${insertClause}`, insertValues);
  return result.insertId;
}

// ─── Syllabus versions ────────────────────────────────────────────────────────

const SYLLABUS_VERSIONS = [
  {
    version_name: 'NEP 2020',
    academic_year_start: 2020,
    academic_year_end: null,
    is_current: 1,
    changes_summary:
      'Rationalized syllabus under National Education Policy 2020. Several chapters and topics removed to reduce load. Emphasis on conceptual understanding and competency-based learning.',
  },
  {
    version_name: 'Pre-NEP',
    academic_year_start: 2014,
    academic_year_end: 2020,
    is_current: 0,
    changes_summary:
      'Legacy NCERT syllabus in use from 2014 to 2020. Full chapter set without rationalizations.',
  },
];

// ─── Classes per syllabus version ─────────────────────────────────────────────
// grades 6-12; 11-12 have streams

function buildClasses(syllabusVersionId, boardId) {
  const rows = [];
  for (let grade = 6; grade <= 10; grade++) {
    rows.push({ board_id: boardId, syllabus_version_id: syllabusVersionId, grade, grade_label: `Class ${grade}`, stream: 'general' });
  }
  // Class 11-12: three streams
  for (const grade of [11, 12]) {
    for (const stream of ['science', 'commerce', 'arts']) {
      rows.push({ board_id: boardId, syllabus_version_id: syllabusVersionId, grade, grade_label: `Class ${grade} (${stream.charAt(0).toUpperCase() + stream.slice(1)})`, stream });
    }
  }
  return rows;
}

// ─── Subjects per class ───────────────────────────────────────────────────────

function buildSubjects(grade, stream) {
  if (grade >= 6 && grade <= 8) {
    return [
      { name: 'Mathematics',    code: 'MATH',  subject_type: 'core',     language_medium: 'English' },
      { name: 'Science',        code: 'SCI',   subject_type: 'core',     language_medium: 'English' },
      { name: 'Social Science', code: 'SST',   subject_type: 'core',     language_medium: 'English' },
      { name: 'English',        code: 'ENG',   subject_type: 'language', language_medium: 'English' },
      { name: 'Hindi',          code: 'HIN',   subject_type: 'language', language_medium: 'Hindi'   },
      { name: 'Sanskrit',       code: 'SKT',   subject_type: 'elective', language_medium: 'Sanskrit'},
    ];
  }
  if (grade >= 9 && grade <= 10) {
    return [
      { name: 'Mathematics',    code: 'MATH',  subject_type: 'core',      language_medium: 'English' },
      { name: 'Science',        code: 'SCI',   subject_type: 'core',      language_medium: 'English' },
      { name: 'Social Science', code: 'SST',   subject_type: 'core',      language_medium: 'English' },
      { name: 'English',        code: 'ENG',   subject_type: 'language',  language_medium: 'English' },
      { name: 'Hindi',          code: 'HIN',   subject_type: 'language',  language_medium: 'Hindi'   },
      { name: 'Sanskrit',       code: 'SKT',   subject_type: 'elective',  language_medium: 'Sanskrit'},
      { name: 'Information Technology', code: 'IT', subject_type: 'vocational', language_medium: 'English' },
    ];
  }
  if (grade >= 11 && grade <= 12) {
    const base = [
      { name: 'English', code: 'ENG', subject_type: 'language', language_medium: 'English' },
    ];
    if (stream === 'science') {
      return [
        ...base,
        { name: 'Physics',          code: 'PHY',  subject_type: 'core',    language_medium: 'English' },
        { name: 'Chemistry',        code: 'CHEM', subject_type: 'core',    language_medium: 'English' },
        { name: 'Biology',          code: 'BIO',  subject_type: 'elective',language_medium: 'English' },
        { name: 'Mathematics',      code: 'MATH', subject_type: 'elective',language_medium: 'English' },
        { name: 'Computer Science', code: 'CS',   subject_type: 'elective',language_medium: 'English' },
      ];
    }
    if (stream === 'commerce') {
      return [
        ...base,
        { name: 'Accountancy',      code: 'ACC',  subject_type: 'core',    language_medium: 'English' },
        { name: 'Business Studies', code: 'BST',  subject_type: 'core',    language_medium: 'English' },
        { name: 'Economics',        code: 'ECO',  subject_type: 'core',    language_medium: 'English' },
        { name: 'Mathematics',      code: 'MATH', subject_type: 'elective',language_medium: 'English' },
      ];
    }
    if (stream === 'arts') {
      return [
        ...base,
        { name: 'History',          code: 'HIST', subject_type: 'core',    language_medium: 'English' },
        { name: 'Geography',        code: 'GEO',  subject_type: 'core',    language_medium: 'English' },
        { name: 'Political Science',code: 'POL',  subject_type: 'core',    language_medium: 'English' },
        { name: 'Economics',        code: 'ECO',  subject_type: 'elective',language_medium: 'English' },
      ];
    }
  }
  return [];
}

// ─── NCERT book titles ─────────────────────────────────────────────────────────

function getNCERTBookTitle(subjectName, grade) {
  const map = {
    'Mathematics':          { title: `Mathematics — Textbook for Class ${grade}`,               url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Mathematics` },
    'Science':              { title: `Science — Textbook for Class ${grade}`,                   url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Science` },
    'Social Science':       { title: `Social Science — Textbook for Class ${grade}`,            url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Social+Science` },
    'English':              { title: `English — Beehive/First Flight/Hornbill — Class ${grade}`,url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=English` },
    'Hindi':                { title: `Hindi — Textbook for Class ${grade}`,                     url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Hindi` },
    'Sanskrit':             { title: `Sanskrit — Textbook for Class ${grade}`,                  url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Sanskrit` },
    'Information Technology': { title: `Information Technology — Textbook for Class ${grade}`,  url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Information+Technology` },
    'Physics':              { title: `Physics Part I & II — Class ${grade}`,                    url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Physics` },
    'Chemistry':            { title: `Chemistry Part I & II — Class ${grade}`,                  url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Chemistry` },
    'Biology':              { title: `Biology — Textbook for Class ${grade}`,                   url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Biology` },
    'Computer Science':     { title: `Computer Science — Textbook for Class ${grade}`,          url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Computer+Science` },
    'Accountancy':          { title: `Accountancy — Textbook for Class ${grade}`,               url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Accountancy` },
    'Business Studies':     { title: `Business Studies — Textbook for Class ${grade}`,          url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Business+Studies` },
    'Economics':            { title: `Economics — Textbook for Class ${grade}`,                 url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Economics` },
    'History':              { title: `History (Themes in World History) — Class ${grade}`,      url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=History` },
    'Geography':            { title: `Geography — Fundamentals of Physical Geography — Class ${grade}`, url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Geography` },
    'Political Science':    { title: `Political Theory — Class ${grade}`,                       url: `https://ncert.nic.in/textbook.php?class=${grade}&subject=Political+Science` },
  };
  return map[subjectName] || { title: `${subjectName} — Class ${grade}`, url: 'https://ncert.nic.in' };
}

// ─── Chapters: Class 9 Mathematics ───────────────────────────────────────────

const CLASS9_MATH_CHAPTERS = [
  {
    chapter_number: 1, title: 'Number Systems',
    description: 'Explores real numbers, irrational numbers, and laws of exponents.',
    key_concepts: ['Rational and Irrational Numbers', 'Real Number Line', 'Laws of Exponents', 'Decimal Expansions', 'Rationalisation of Surds'],
    learning_outcomes: ['Represent real numbers on number line', 'Perform operations on irrational numbers', 'Apply laws of exponents'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 2, title: 'Polynomials',
    description: 'Introduces polynomials, their types, remainder theorem, and algebraic identities.',
    key_concepts: ['Degree of Polynomial', 'Zeroes of Polynomial', 'Remainder Theorem', 'Factor Theorem', 'Algebraic Identities'],
    learning_outcomes: ['Identify and classify polynomials', 'Apply Remainder and Factor Theorems', 'Use algebraic identities for factorisation'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 3, title: 'Coordinate Geometry',
    description: 'Introduction to Cartesian system, plotting points in a plane.',
    key_concepts: ['Cartesian Coordinate System', 'Quadrants', 'Coordinates of a Point', 'Plotting Points'],
    learning_outcomes: ['Plot points in a Cartesian plane', 'Identify coordinates of given points', 'Understand quadrant positions'],
    estimated_study_time_mins: 120,
    is_deleted: false,
  },
  {
    chapter_number: 4, title: 'Linear Equations in Two Variables',
    description: 'Solving and graphing linear equations in two variables.',
    key_concepts: ['Solution of Linear Equation', 'Graph of a Linear Equation', 'Equations Parallel to Axes'],
    learning_outcomes: ['Solve linear equations in two variables', 'Draw graphs of linear equations', 'Interpret the geometrical representation'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 5, title: "Introduction to Euclid's Geometry",
    description: "Euclid's definitions, axioms, postulates, and their significance.",
    key_concepts: ["Euclid's Definitions", "Axioms and Postulates", 'Equivalent Versions of Fifth Postulate'],
    learning_outcomes: ["State Euclid's axioms and postulates", 'Distinguish between axioms and theorems', 'Understand foundations of geometry'],
    estimated_study_time_mins: 120,
    is_deleted: false,
  },
  {
    chapter_number: 6, title: 'Lines and Angles',
    description: 'Properties of lines and angles including parallel lines and transversals.',
    key_concepts: ['Intersecting and Non-intersecting Lines', 'Pairs of Angles', 'Parallel Lines and Transversal', 'Angle Sum Property of Triangle'],
    learning_outcomes: ['Apply angle relationships', 'Prove properties of parallel lines', 'Use angle sum property'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 7, title: 'Triangles',
    description: 'Congruence of triangles and inequalities in a triangle.',
    key_concepts: ['Congruence of Triangles', 'SAS / ASA / SSS / AAS / RHS Criteria', 'CPCT', 'Inequalities in a Triangle'],
    learning_outcomes: ['Apply congruence criteria', 'Prove triangles congruent', 'Establish inequalities in triangles'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 8, title: 'Quadrilaterals',
    description: 'Properties of quadrilaterals and the Mid-Point Theorem.',
    key_concepts: ['Angle Sum Property', 'Properties of Parallelogram', 'Conditions for Parallelogram', 'Mid-Point Theorem'],
    learning_outcomes: ['Prove properties of quadrilaterals', 'Apply the Mid-Point Theorem', 'Classify quadrilaterals'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 9, title: 'Areas of Parallelograms and Triangles',
    description: 'Relationship between areas of parallelograms and triangles on the same base.',
    key_concepts: ['Area of Parallelogram', 'Triangles on Same Base', 'Figures between Parallel Lines'],
    learning_outcomes: ['Prove area theorems for parallelograms and triangles'],
    estimated_study_time_mins: 150,
    is_deleted: true,  // Deleted in NEP 2020 rationalisation
  },
  {
    chapter_number: 10, title: 'Circles',
    description: 'Properties of circles, chords, arcs, and cyclic quadrilaterals.',
    key_concepts: ['Chord and its Properties', 'Perpendicular from Centre', 'Equal Chords', 'Angle Subtended by Arc', 'Cyclic Quadrilateral'],
    learning_outcomes: ['Prove theorems on circles', 'Apply properties of chords and arcs', 'Solve problems on cyclic quadrilaterals'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 11, title: 'Constructions',
    description: 'Geometric constructions using compass and straightedge.',
    key_concepts: ['Bisecting a Line Segment', 'Bisecting an Angle', 'Constructing Triangles'],
    learning_outcomes: ['Perform basic geometric constructions'],
    estimated_study_time_mins: 120,
    is_deleted: true,  // Deleted in NEP 2020 rationalisation
  },
  {
    chapter_number: 12, title: "Heron's Formula",
    description: 'Computing area of triangles and quadrilaterals using Heron\'s Formula.',
    key_concepts: ['Semi-perimeter', "Heron's Formula", 'Area of Triangle', 'Area of Quadrilateral'],
    learning_outcomes: ["Apply Heron's Formula to find areas", 'Calculate area of quadrilaterals using triangulation'],
    estimated_study_time_mins: 120,
    is_deleted: false,
  },
  {
    chapter_number: 13, title: 'Surface Areas and Volumes',
    description: 'Surface area and volume of 3D shapes.',
    key_concepts: ['Cuboid and Cube', 'Right Circular Cylinder', 'Right Circular Cone', 'Sphere and Hemisphere'],
    learning_outcomes: ['Calculate surface area and volume of solids', 'Solve real-life mensuration problems'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 14, title: 'Statistics',
    description: 'Collection, presentation, and analysis of data.',
    key_concepts: ['Collection of Data', 'Presentation of Data', 'Graphical Representation', 'Measures of Central Tendency', 'Mean', 'Median', 'Mode'],
    learning_outcomes: ['Represent data graphically', 'Calculate mean, median, and mode', 'Interpret statistical graphs'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 15, title: 'Probability',
    description: 'Introduction to empirical probability through experiments.',
    key_concepts: ['Probability — Experimental Approach', 'Event', 'Empirical Probability', 'Complementary Events'],
    learning_outcomes: ['Define probability empirically', 'Calculate probability from experimental data', 'Apply complement rule'],
    estimated_study_time_mins: 120,
    is_deleted: false,
  },
];

// ─── Chapters: Class 9 Science ────────────────────────────────────────────────

const CLASS9_SCIENCE_CHAPTERS = [
  {
    chapter_number: 1, title: 'Matter in Our Surroundings',
    description: 'Physical nature of matter, states, and interconversion.',
    key_concepts: ['States of Matter', 'Characteristics of Particles', 'Evaporation', 'Sublimation', 'Boiling and Melting Points'],
    learning_outcomes: ['Describe properties of states of matter', 'Explain interconversion of states', 'Relate evaporation to cooling'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 2, title: 'Is Matter Around Us Pure?',
    description: 'Mixtures, solutions, colloids, and separation techniques.',
    key_concepts: ['Mixtures and Solutions', 'Colloids and Suspensions', 'Separation Methods', 'Physical and Chemical Changes', 'Elements and Compounds'],
    learning_outcomes: ['Distinguish pure substances from mixtures', 'Apply appropriate separation techniques', 'Classify matter'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 3, title: 'Atoms and Molecules',
    description: 'Laws of chemical combination, atomic and molecular masses, mole concept.',
    key_concepts: ['Laws of Chemical Combination', 'Atomic Mass', 'Molecular Mass', 'Mole Concept', 'Chemical Formulae'],
    learning_outcomes: ['Apply laws of chemical combination', 'Calculate molar mass', 'Write chemical formulae'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 4, title: 'Structure of the Atom',
    description: 'Atomic models from Thomson to Bohr, valency, isotopes and isobars.',
    key_concepts: ["Thomson's Model", "Rutherford's Model", "Bohr's Model", 'Valence Electrons', 'Isotopes', 'Isobars'],
    learning_outcomes: ['Describe evolution of atomic models', 'Determine valency from electronic configuration', 'Distinguish isotopes and isobars'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 5, title: 'The Fundamental Unit of Life',
    description: 'Cell theory, cell structure, and functions of cell organelles.',
    key_concepts: ['Cell Theory', 'Prokaryotic vs Eukaryotic', 'Cell Organelles', 'Cell Membrane', 'Osmosis and Diffusion'],
    learning_outcomes: ['Describe cell structure', 'Explain functions of organelles', 'Differentiate plant and animal cells'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 6, title: 'Tissues',
    description: 'Plant and animal tissues and their functions.',
    key_concepts: ['Meristematic Tissue', 'Permanent Tissue', 'Epithelial Tissue', 'Connective Tissue', 'Muscular Tissue', 'Nervous Tissue'],
    learning_outcomes: ['Classify tissues', 'Relate structure to function', 'Compare plant and animal tissues'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 7, title: 'Diversity in Living Organisms',
    description: 'Basis of classification and the five-kingdom classification.',
    key_concepts: ['Basis of Classification', 'Five-Kingdom Classification', 'Plant Kingdom', 'Animal Kingdom', 'Nomenclature'],
    learning_outcomes: ['Explain basis of biological classification', 'Classify organisms into kingdoms', 'Use binomial nomenclature'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 8, title: 'Motion',
    description: 'Describing motion, equations of motion, and graphical representation.',
    key_concepts: ['Distance and Displacement', 'Speed and Velocity', 'Acceleration', 'Equations of Motion', 'Velocity-Time Graphs'],
    learning_outcomes: ['Distinguish distance from displacement', 'Derive equations of motion', 'Interpret motion graphs'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 9, title: 'Force and Laws of Motion',
    description: "Newton's three laws of motion and conservation of momentum.",
    key_concepts: ['Force and Inertia', "Newton's First Law", "Newton's Second Law", "Newton's Third Law", 'Momentum', 'Law of Conservation of Momentum'],
    learning_outcomes: ["State Newton's laws", 'Calculate force using F = ma', 'Apply conservation of momentum'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 10, title: 'Gravitation',
    description: 'Universal law of gravitation, free fall, mass, weight, and buoyancy.',
    key_concepts: ['Universal Law of Gravitation', 'Gravitational Acceleration g', 'Free Fall', 'Weight vs Mass', 'Buoyancy', "Archimedes' Principle"],
    learning_outcomes: ['State universal law of gravitation', 'Differentiate mass and weight', "Apply Archimedes' Principle"],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 11, title: 'Work and Energy',
    description: 'Work, kinetic and potential energy, and the law of conservation of energy.',
    key_concepts: ['Work Done', 'Kinetic Energy', 'Potential Energy', 'Power', 'Law of Conservation of Energy'],
    learning_outcomes: ['Calculate work and energy', 'Apply energy conservation', 'Distinguish power from energy'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 12, title: 'Sound',
    description: 'Properties of sound waves, reflection, reverberation, and the human ear.',
    key_concepts: ['Nature of Sound', 'Characteristics of Sound', 'Speed of Sound', 'Reflection of Sound', 'Reverberation', 'Ultrasound', 'Human Ear'],
    learning_outcomes: ['Describe sound wave properties', 'Explain echo and reverberation', 'Understand range of hearing'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 13, title: 'Why Do We Fall Ill',
    description: 'Health, disease, causes of disease, and prevention.',
    key_concepts: ['Concepts of Health', 'Types of Diseases', 'Infectious Agents', 'Means of Spread', 'Principles of Prevention', 'Immune System'],
    learning_outcomes: ['Define health and disease', 'Classify diseases by cause', 'Describe principles of prevention'],
    estimated_study_time_mins: 120,
    is_deleted: false,
  },
  {
    chapter_number: 14, title: 'Natural Resources',
    description: 'Biogeochemical cycles and natural resources of the Earth.',
    key_concepts: ['Air', 'Water', 'Soil', 'Biogeochemical Cycles', 'Nitrogen Cycle', 'Carbon Cycle'],
    learning_outcomes: ['Describe importance of natural resources', 'Explain biogeochemical cycles'],
    estimated_study_time_mins: 120,
    is_deleted: true,  // Deleted in NEP 2020 rationalisation
  },
  {
    chapter_number: 15, title: 'Improvement in Food Resources',
    description: 'Crop improvement, animal husbandry, and food production techniques.',
    key_concepts: ['Crop Variety Improvement', 'Crop Production Improvement', 'Crop Protection', 'Animal Husbandry', 'Fisheries', 'Bee Keeping'],
    learning_outcomes: ['Describe crop improvement methods', 'Explain animal husbandry practices'],
    estimated_study_time_mins: 120,
    is_deleted: true,  // Deleted in NEP 2020 rationalisation
  },
];

// ─── Chapters: Class 10 Mathematics ──────────────────────────────────────────

const CLASS10_MATH_CHAPTERS = [
  {
    chapter_number: 1, title: 'Real Numbers',
    description: "Euclid's division lemma, fundamental theorem of arithmetic, and irrational numbers.",
    key_concepts: ["Euclid's Division Lemma", 'Fundamental Theorem of Arithmetic', 'HCF and LCM', 'Irrational Numbers', 'Decimal Expansions'],
    learning_outcomes: ["Apply Euclid's algorithm", 'Find HCF and LCM', 'Prove irrationality of numbers', 'Determine type of decimal expansion'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 2, title: 'Polynomials',
    description: 'Zeroes of polynomials, relationship with coefficients, and division algorithm.',
    key_concepts: ['Zeroes of Polynomial', 'Relationship Between Zeroes and Coefficients', 'Division Algorithm for Polynomials'],
    learning_outcomes: ['Find zeroes of quadratic polynomials', 'Verify relationship between zeroes and coefficients', 'Apply division algorithm'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 3, title: 'Pair of Linear Equations in Two Variables',
    description: 'Graphical and algebraic methods to solve pairs of linear equations.',
    key_concepts: ['Graphical Method', 'Substitution Method', 'Elimination Method', 'Cross-Multiplication Method', 'Conditions for Consistency'],
    learning_outcomes: ['Solve pairs of linear equations graphically and algebraically', 'Identify consistent/inconsistent systems', 'Solve word problems'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 4, title: 'Quadratic Equations',
    description: 'Solving quadratic equations by factorisation, completing the square, and the quadratic formula.',
    key_concepts: ['Standard Form', 'Factorisation Method', 'Completing the Square', 'Quadratic Formula', 'Discriminant', 'Nature of Roots'],
    learning_outcomes: ['Solve quadratic equations by multiple methods', 'Determine nature of roots using discriminant', 'Formulate and solve real-life problems'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 5, title: 'Arithmetic Progressions',
    description: 'Arithmetic progressions, nth term, and sum of n terms.',
    key_concepts: ['Arithmetic Progression (AP)', 'Common Difference', 'nth Term of AP', 'Sum of First n Terms'],
    learning_outcomes: ['Identify APs and find common difference', 'Calculate nth term', 'Find sum of n terms', 'Solve real-life AP problems'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 6, title: 'Triangles',
    description: 'Similar triangles, criteria for similarity, and the Pythagoras theorem.',
    key_concepts: ['Similar Figures', 'Basic Proportionality Theorem', 'Criteria for Similarity', 'Areas of Similar Triangles', 'Pythagoras Theorem'],
    learning_outcomes: ['State and apply BPT', 'Prove similarity criteria', 'Calculate areas of similar triangles', 'Apply Pythagoras theorem'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 7, title: 'Coordinate Geometry',
    description: 'Distance formula, section formula, and area of a triangle using coordinates.',
    key_concepts: ['Distance Formula', 'Section Formula', 'Midpoint Formula', 'Area of Triangle'],
    learning_outcomes: ['Find distance between two points', 'Divide a line segment in given ratio', 'Calculate area of a triangle with coordinates'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 8, title: 'Introduction to Trigonometry',
    description: 'Trigonometric ratios, identities, and values of specific angles.',
    key_concepts: ['Trigonometric Ratios', 'Values at 0°, 30°, 45°, 60°, 90°', 'Complementary Angle Relations', 'Trigonometric Identities'],
    learning_outcomes: ['Define and compute trig ratios', 'Apply trig identities', 'Use complementary angle relations'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 9, title: 'Some Applications of Trigonometry',
    description: 'Heights and distances using angles of elevation and depression.',
    key_concepts: ['Angle of Elevation', 'Angle of Depression', 'Line of Sight', 'Heights and Distances Problems'],
    learning_outcomes: ['Solve problems on heights and distances', 'Apply trig ratios to real-world scenarios'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 10, title: 'Circles',
    description: 'Tangent to a circle, number of tangents, and related theorems.',
    key_concepts: ['Tangent to a Circle', 'Number of Tangents from External Point', 'Tangent-Radius Relationship', 'Tangent-Chord Angle'],
    learning_outcomes: ['Prove tangent properties', 'Calculate lengths of tangents', 'Apply circle theorems'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 11, title: 'Constructions',
    description: 'Division of a line segment and construction of tangents to a circle.',
    key_concepts: ['Division of Line Segment', 'Construction of Similar Triangles', 'Tangents to a Circle'],
    learning_outcomes: ['Divide a line segment in given ratio', 'Construct tangents to a circle'],
    estimated_study_time_mins: 120,
    is_deleted: true,  // Deleted in NEP 2020 rationalisation
  },
  {
    chapter_number: 12, title: 'Areas Related to Circles',
    description: 'Perimeter and area of circles, sectors, and segments.',
    key_concepts: ['Perimeter and Area of Circle', 'Area of Sector', 'Area of Segment', 'Areas of Combinations of Figures'],
    learning_outcomes: ['Calculate area and perimeter of circle regions', 'Solve area problems for combined figures'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 13, title: 'Surface Areas and Volumes',
    description: 'Surface areas and volumes of combinations of solids and frustum.',
    key_concepts: ['Combinations of Solids', 'Conversion of Solids', 'Frustum of a Cone'],
    learning_outcomes: ['Find SA and volume of combined solids', 'Solve conversion problems', 'Calculate frustum dimensions'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 14, title: 'Statistics',
    description: 'Mean, median, and mode of grouped data, and cumulative frequency graphs.',
    key_concepts: ['Mean of Grouped Data', 'Mode of Grouped Data', 'Median of Grouped Data', 'Cumulative Frequency', 'Ogive'],
    learning_outcomes: ['Calculate measures of central tendency for grouped data', 'Draw and interpret ogives', 'Locate median graphically'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 15, title: 'Probability',
    description: 'Classical probability and solving problems based on equally likely outcomes.',
    key_concepts: ['Classical Definition of Probability', 'Equally Likely Outcomes', 'Complementary Events', 'Simple Probability Problems'],
    learning_outcomes: ['Define classical probability', 'Calculate probability for simple events', 'Apply complementary events rule'],
    estimated_study_time_mins: 120,
    is_deleted: false,
  },
];

// ─── Chapters: Class 10 Science ───────────────────────────────────────────────

const CLASS10_SCIENCE_CHAPTERS = [
  {
    chapter_number: 1, title: 'Chemical Reactions and Equations',
    description: 'Types of chemical reactions, equations, and oxidation-reduction.',
    key_concepts: ['Balanced Chemical Equations', 'Types of Reactions', 'Oxidation and Reduction', 'Rancidity', 'Corrosion'],
    learning_outcomes: ['Write and balance chemical equations', 'Classify chemical reactions', 'Explain oxidation and reduction'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 2, title: 'Acids, Bases and Salts',
    description: 'Properties, reactions, pH scale, and preparation of salts.',
    key_concepts: ['Properties of Acids and Bases', 'pH Scale', 'Preparation of Salts', 'Baking Soda', 'Washing Soda', 'Bleaching Powder', 'Plaster of Paris'],
    learning_outcomes: ['Compare properties of acids and bases', 'Use pH scale', 'Explain preparation and uses of salts'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 3, title: 'Metals and Non-metals',
    description: 'Physical and chemical properties, reactivity series, and extraction of metals.',
    key_concepts: ['Physical Properties', 'Chemical Properties', 'Reactivity Series', 'Ionic Bond Formation', 'Extraction of Metals', 'Corrosion'],
    learning_outcomes: ['Distinguish metals from non-metals', 'Explain reactivity series', 'Describe extraction process'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 4, title: 'Carbon and its Compounds',
    description: 'Covalent bonding in carbon, functional groups, and important compounds.',
    key_concepts: ['Covalent Bond in Carbon', 'Versatile Nature of Carbon', 'Homologous Series', 'Functional Groups', 'Ethanol and Ethanoic Acid', 'Properties of Soaps and Detergents'],
    learning_outcomes: ['Explain covalent bonding in carbon compounds', 'Name compounds using IUPAC rules', 'Distinguish soaps from detergents'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 5, title: 'Periodic Classification of Elements',
    description: 'History of periodic classification from Dobereiner to Mendeleev to the Modern Table.',
    key_concepts: ["Dobereiner's Triads", "Newlands' Law of Octaves", "Mendeleev's Periodic Table", 'Modern Periodic Table', 'Trends in Properties'],
    learning_outcomes: ['Trace history of periodic classification', 'Explain Modern Periodic Law', 'Describe periodic trends'],
    estimated_study_time_mins: 150,
    is_deleted: true,  // Deleted in NEP 2020 rationalisation
  },
  {
    chapter_number: 6, title: 'Life Processes',
    description: 'Nutrition, respiration, transportation, and excretion in plants and animals.',
    key_concepts: ['Autotrophic Nutrition', 'Heterotrophic Nutrition', 'Respiration', 'Transportation in Plants', 'Circulation in Humans', 'Excretion'],
    learning_outcomes: ['Describe life processes', 'Compare plant and human transportation', 'Explain excretory processes'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 7, title: 'Control and Coordination',
    description: 'Nervous system, reflex arcs, and endocrine system in animals and plants.',
    key_concepts: ['Nervous System', 'Neuron', 'Synapse', 'Reflex Action', 'Endocrine System', 'Hormones', 'Plant Hormones'],
    learning_outcomes: ['Describe structure and function of nervous system', 'Explain reflex actions', 'Identify key hormones and their functions'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 8, title: 'How Do Organisms Reproduce?',
    description: 'Modes of reproduction in plants and animals, and reproductive health.',
    key_concepts: ['Asexual Reproduction', 'Sexual Reproduction in Plants', 'Reproduction in Humans', 'Reproductive Health', 'Contraception'],
    learning_outcomes: ['Compare sexual and asexual reproduction', 'Describe human reproductive system', 'Explain reproductive health concepts'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 9, title: 'Heredity and Evolution',
    description: "Mendel's laws, sex determination, evolution, and speciation.",
    key_concepts: ["Mendel's Laws", 'Inheritance', 'Sex Determination', 'Evolution', 'Natural Selection', 'Speciation', 'Human Evolution'],
    learning_outcomes: ["Apply Mendel's laws to simple crosses", 'Explain sex determination', 'Describe theory of evolution'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 10, title: 'Light — Reflection and Refraction',
    description: 'Laws of reflection and refraction, mirror and lens formulae, and magnification.',
    key_concepts: ['Reflection of Light', 'Spherical Mirrors', 'Mirror Formula', 'Refraction of Light', 'Lens Formula', 'Power of Lens'],
    learning_outcomes: ['Apply mirror and lens formulae', 'Draw ray diagrams', 'Calculate magnification and power'],
    estimated_study_time_mins: 200,
    is_deleted: false,
  },
  {
    chapter_number: 11, title: 'Human Eye and the Colourful World',
    description: 'Structure of human eye, defects of vision, prism dispersion, and atmospheric phenomena.',
    key_concepts: ['Structure of Human Eye', 'Defects of Vision', 'Dispersion by Prism', 'Scattering of Light', 'Rainbow'],
    learning_outcomes: ['Describe human eye structure and function', 'Explain vision defects and corrections', 'Account for atmospheric optical phenomena'],
    estimated_study_time_mins: 150,
    is_deleted: false,
  },
  {
    chapter_number: 12, title: 'Electricity',
    description: "Electric current, Ohm's law, resistance, circuits, and heating effect.",
    key_concepts: ["Ohm's Law", 'Resistance', 'Series and Parallel Circuits', 'Joule Heating', 'Electric Power', 'Domestic Wiring'],
    learning_outcomes: ["Apply Ohm's law", 'Calculate equivalent resistance', 'Solve circuit problems', 'Explain safe electrical practices'],
    estimated_study_time_mins: 200,
    is_deleted: false,
  },
  {
    chapter_number: 13, title: 'Magnetic Effects of Electric Current',
    description: 'Magnetic field of current, force on conductor, electric motor, and generator.',
    key_concepts: ['Magnetic Field', 'Right-Hand Thumb Rule', "Fleming's Rules", 'Electric Motor', 'Electromagnetic Induction', 'Electric Generator', 'Domestic Wiring and Safety'],
    learning_outcomes: ['Describe magnetic field of current-carrying conductor', 'Explain working of motor and generator', 'Identify safety devices in domestic circuits'],
    estimated_study_time_mins: 180,
    is_deleted: false,
  },
  {
    chapter_number: 14, title: 'Sources of Energy',
    description: 'Conventional and non-conventional sources of energy and their impact.',
    key_concepts: ['Fossil Fuels', 'Thermal Power', 'Hydroelectric Power', 'Solar Energy', 'Wind Energy', 'Nuclear Energy', 'Environmental Impact'],
    learning_outcomes: ['Compare energy sources', 'Explain working of solar cells and biogas plants', 'Evaluate environmental impacts'],
    estimated_study_time_mins: 120,
    is_deleted: true,  // Deleted in NEP 2020 rationalisation
  },
  {
    chapter_number: 15, title: 'Our Environment',
    description: 'Ecosystems, food chains, ozone layer depletion, and waste management.',
    key_concepts: ['Ecosystem', 'Food Chain and Web', 'Trophic Levels', 'Ozone Layer', 'Waste Management'],
    learning_outcomes: ['Describe ecosystem structure', 'Trace flow of energy in food chains', 'Explain ozone depletion and its consequences'],
    estimated_study_time_mins: 120,
    is_deleted: false,
  },
  {
    chapter_number: 16, title: 'Sustainable Management of Natural Resources',
    description: 'Conservation of forests, water, coal, petroleum, and sustainable development.',
    key_concepts: ['Conservation of Forests and Wildlife', 'Water Harvesting', 'Conservation of Coal and Petroleum', 'Sustainable Development'],
    learning_outcomes: ['Explain need for resource conservation', 'Describe water harvesting methods', 'Evaluate sustainable practices'],
    estimated_study_time_mins: 120,
    is_deleted: true,  // Deleted in NEP 2020 rationalisation
  },
];

// ─── Main seed function ────────────────────────────────────────────────────────

async function run() {
  console.log('[Seed] cbse.seed.js — starting...');

  // Get CBSE board
  const [boards] = await pool.execute('SELECT id FROM boards WHERE code = ?', ['CBSE']);
  if (!boards.length) throw new Error('CBSE board not found. Run boards.seed.js first.');
  const boardId = boards[0].id;
  console.log(`[Seed] Found CBSE board id=${boardId}`);

  // ── Syllabus versions ──────────────────────────────────────────────────────
  const versionIds = {};
  for (const sv of SYLLABUS_VERSIONS) {
    const id = await getOrCreate(
      'syllabus_versions',
      'board_id = ? AND version_name = ?',
      [boardId, sv.version_name],
      '(board_id, version_name, academic_year_start, academic_year_end, is_current, changes_summary) VALUES (?,?,?,?,?,?)',
      [boardId, sv.version_name, sv.academic_year_start, sv.academic_year_end, sv.is_current, sv.changes_summary]
    );
    versionIds[sv.version_name] = id;
    console.log(`[Seed] Syllabus version "${sv.version_name}" id=${id}`);
  }

  // ── Classes 6–12 for each version ─────────────────────────────────────────
  const classIds = {};  // key: `${versionName}|${grade}|${stream}`
  for (const [versionName, svId] of Object.entries(versionIds)) {
    const classes = buildClasses(svId, boardId);
    for (const cls of classes) {
      const id = await getOrCreate(
        'classes',
        'board_id = ? AND syllabus_version_id = ? AND grade = ? AND stream = ?',
        [boardId, svId, cls.grade, cls.stream],
        '(board_id, syllabus_version_id, grade, grade_label, stream) VALUES (?,?,?,?,?)',
        [boardId, svId, cls.grade, cls.grade_label, cls.stream]
      );
      classIds[`${versionName}|${cls.grade}|${cls.stream}`] = id;
    }
    console.log(`[Seed] Classes for "${versionName}" done.`);
  }

  // ── Subjects + NCERT books ────────────────────────────────────────────────
  // For Class 11-12 with streams, subjects differ per stream.
  // For Class 6-10, stream is 'general'.
  let subjectCount = 0;
  let bookCount = 0;

  for (const [versionName, svId] of Object.entries(versionIds)) {
    for (let grade = 6; grade <= 10; grade++) {
      const clsId = classIds[`${versionName}|${grade}|general`];
      if (!clsId) continue;
      const subjects = buildSubjects(grade, 'general');
      for (const sub of subjects) {
        const subId = await getOrCreate(
          'subjects',
          'class_id = ? AND name = ?',
          [clsId, sub.name],
          '(class_id, name, code, subject_type, language_medium, is_active) VALUES (?,?,?,?,?,1)',
          [clsId, sub.name, sub.code, sub.subject_type, sub.language_medium]
        );
        subjectCount++;

        // NCERT book
        const book = getNCERTBookTitle(sub.name, grade);
        const pubYear = versionName === 'NEP 2020' ? 2021 : 2017;
        const bookId = await getOrCreate(
          'books',
          'subject_id = ? AND title = ?',
          [subId, book.title],
          '(subject_id, title, publisher, edition, publication_year, is_official, ncert_url, is_available_free) VALUES (?,?,?,?,?,1,?,1)',
          [subId, book.title, 'NCERT', versionName, pubYear, book.url]
        );
        bookCount++;

        // Seed chapters only for Class 9-10 Math and Science
        const isNEP = versionName === 'NEP 2020';
        let chaptersToSeed = null;
        if (grade === 9 && sub.name === 'Mathematics')  chaptersToSeed = CLASS9_MATH_CHAPTERS;
        if (grade === 9 && sub.name === 'Science')       chaptersToSeed = CLASS9_SCIENCE_CHAPTERS;
        if (grade === 10 && sub.name === 'Mathematics')  chaptersToSeed = CLASS10_MATH_CHAPTERS;
        if (grade === 10 && sub.name === 'Science')      chaptersToSeed = CLASS10_SCIENCE_CHAPTERS;

        if (chaptersToSeed) {
          for (const ch of chaptersToSeed) {
            const [existing] = await pool.execute(
              'SELECT id FROM chapters WHERE book_id = ? AND chapter_number = ?',
              [bookId, ch.chapter_number]
            );
            if (existing.length) continue;

            await pool.execute(
              `INSERT INTO chapters
                (book_id, chapter_number, title, description, key_concepts, learning_outcomes, estimated_study_time_mins)
               VALUES (?,?,?,?,?,?,?)`,
              [
                bookId,
                ch.chapter_number,
                ch.title,
                ch.description,
                JSON.stringify(ch.key_concepts),
                JSON.stringify(ch.learning_outcomes),
                ch.estimated_study_time_mins,
              ]
            );

            // Insert a single topic per chapter to capture NEP deletion flag
            // (Full topic breakdown can be added via additional seeds)
            const [chapterRow] = await pool.execute(
              'SELECT id FROM chapters WHERE book_id = ? AND chapter_number = ?',
              [bookId, ch.chapter_number]
            );
            const chapterId = chapterRow[0].id;

            const [existingTopic] = await pool.execute(
              'SELECT id FROM topics WHERE chapter_id = ? AND topic_order = 1',
              [chapterId]
            );
            if (!existingTopic.length) {
              await pool.execute(
                `INSERT INTO topics
                  (chapter_id, title, topic_order, bloom_levels, weightage_percent,
                   is_deleted_in_new_syllabus, is_new_in_current_syllabus)
                 VALUES (?,?,1,?,NULL,?,0)`,
                [
                  chapterId,
                  ch.title + ' — Overview',
                  JSON.stringify(['Remember', 'Understand', 'Apply']),
                  isNEP && ch.is_deleted ? 1 : 0,
                ]
              );
            }
          }
        }
      }
    }

    // Classes 11-12
    for (const grade of [11, 12]) {
      for (const stream of ['science', 'commerce', 'arts']) {
        const clsId = classIds[`${versionName}|${grade}|${stream}`];
        if (!clsId) continue;
        const subjects = buildSubjects(grade, stream);
        for (const sub of subjects) {
          await getOrCreate(
            'subjects',
            'class_id = ? AND name = ?',
            [clsId, sub.name],
            '(class_id, name, code, subject_type, language_medium, is_active) VALUES (?,?,?,?,?,1)',
            [clsId, sub.name, sub.code, sub.subject_type, sub.language_medium]
          );
          subjectCount++;

          const book = getNCERTBookTitle(sub.name, grade);
          const pubYear = versionName === 'NEP 2020' ? 2021 : 2017;
          await getOrCreate(
            'books',
            'subject_id = (SELECT id FROM subjects WHERE class_id = ? AND name = ? LIMIT 1) AND title = ?',
            [clsId, sub.name, book.title],
            '(subject_id, title, publisher, edition, publication_year, is_official, ncert_url, is_available_free) VALUES ((SELECT id FROM subjects WHERE class_id = ? AND name = ? LIMIT 1),?,?,?,?,1,?,1)',
            [clsId, sub.name, book.title, 'NCERT', versionName, pubYear, book.url]
          );
          bookCount++;
        }
      }
    }
    console.log(`[Seed] Subjects and books for "${versionName}" done.`);
  }

  console.log(`[Seed] cbse.seed.js — complete. subjects≈${subjectCount} books≈${bookCount}`);
  await pool.end();
}

run().catch(err => {
  console.error('[Seed] cbse.seed.js FAILED:', err.message);
  process.exit(1);
});
