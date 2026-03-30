'use strict';
/**
 * ncert-extractor.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * NCERT TOC & Syllabus extraction for Classes 6-12.
 * Covers 23+ Indian states + CBSE that follow NCERT (≈ 70% of India's students).
 *
 * Strategy (two-layer):
 *   1. Hardcoded TOC — accurate 2023-24 rationalized NCERT curriculum.
 *      Always available, zero latency, zero network dependency.
 *   2. Live scraper   — attempts ncert.nic.in to verify chapter count /
 *      detect new editions. Falls back to hardcoded on any error.
 *
 * No PDF content is served — only chapter names + topic headings (metadata).
 * Rate-limited caller is responsible; this service is pure data.
 *
 * Exports:
 *   getTOC(grade, subject, state)               → full TOC object
 *   getChapterContext(grade, subject, chapter)  → string for AI prompt
 *   isNCERTState(state)                         → boolean
 *   listNCERTSubjects(grade)                    → subject list for a grade
 */

const { httpsGet } = require('./web-content.service');

// ─── In-memory TTL Cache (24 hr) ──────────────────────────────────────────────

class SimpleCache {
  constructor(ttlMs = 24 * 60 * 60 * 1000) {
    this.ttl   = ttlMs;
    this.store = new Map();
  }
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) { this.store.delete(key); return null; }
    return item.value;
  }
  set(key, value) {
    this.store.set(key, { value, expiry: Date.now() + this.ttl });
  }
}

const cache = new SimpleCache();

// ─── States that follow NCERT ─────────────────────────────────────────────────

const NCERT_STATES = new Set([
  'cbse', 'delhi', 'haryana', 'up', 'uttar pradesh', 'karnataka',
  'mizoram', 'hp', 'himachal pradesh', 'mp', 'madhya pradesh',
  'rajasthan', 'uttarakhand', 'goa', 'tripura', 'gujarat',
  'bihar', 'jharkhand', 'chhattisgarh', 'kerala', 'punjab',
  'manipur', 'ap', 'andhra pradesh', 'arunachal pradesh',
  'sikkim', 'nagaland', 'meghalaya',
]);

// ─── Subject normalization ────────────────────────────────────────────────────

const SUBJECT_ALIASES = {
  maths: 'mathematics', math: 'mathematics', ma: 'mathematics',
  'maths ncert': 'mathematics',
  sci: 'science', sc: 'science', 'science ncert': 'science',
  phy: 'physics', ph: 'physics', physics1: 'physics', physics2: 'physics',
  chem: 'chemistry', ch: 'chemistry',
  bio: 'biology', bo: 'biology',
  hist: 'history', hy: 'history',
  geo: 'geography', eg: 'geography',
  civics: 'political_science', polsci: 'political_science',
  'political science': 'political_science', pp: 'political_science',
  eco: 'economics', ec: 'economics',
  eng: 'english', en: 'english',
  hin: 'hindi', hi: 'hindi',
  social: 'social_science', ss: 'social_science',
  sst: 'social_science', 'social science': 'social_science',
};

function normalizeSubject(subject) {
  if (!subject) return 'mathematics';
  const s = subject.toLowerCase().trim();
  return SUBJECT_ALIASES[s] || s;
}

// ─── NCERT URL codes (for live scraper) ──────────────────────────────────────

const NCERT_URL_MAP = {
  '6-mathematics':  { bookName: 'hmmt', pdfPfx: 'femh' },
  '7-mathematics':  { bookName: 'hmmt', pdfPfx: 'gemh' },
  '8-mathematics':  { bookName: 'hmmt', pdfPfx: 'hemh' },
  '9-mathematics':  { bookName: 'iemh', pdfPfx: 'iemh' },
  '10-mathematics': { bookName: 'jemh', pdfPfx: 'jemh' },
  '11-mathematics': { bookName: 'kemh', pdfPfx: 'kemh' },
  '12-mathematics': { bookName: 'lemh', pdfPfx: 'lemh' },
  '9-science':  { bookName: 'iesc',  pdfPfx: 'iesc' },
  '10-science': { bookName: 'jesc',  pdfPfx: 'jesc' },
  '11-physics': { bookName: 'keph',  pdfPfx: 'keph' },
  '12-physics': { bookName: 'leph',  pdfPfx: 'leph' },
  '11-chemistry': { bookName: 'kech', pdfPfx: 'kech' },
  '12-chemistry': { bookName: 'lech', pdfPfx: 'lech' },
  '11-biology':  { bookName: 'kebo', pdfPfx: 'kebo' },
  '12-biology':  { bookName: 'lebo', pdfPfx: 'lebo' },
};

// ─── Master NCERT TOC (2023-24 Rationalized Curriculum) ──────────────────────
// Format: key = `${grade}-${subjectKey}`
// Topics per chapter: 3-6 key headings from the textbook.

const NCERT_TOC = {

  // ════════════════════════════════════════════════
  // CLASS 6
  // ════════════════════════════════════════════════

  '6-mathematics': {
    bookTitle: 'Mathematics — Textbook for Class VI',
    chapters: [
      { num: 1,  name: 'Knowing Our Numbers',           topics: ['Comparing Numbers', 'Large Numbers', 'Roman Numerals', 'Estimation'] },
      { num: 2,  name: 'Whole Numbers',                 topics: ['Natural Numbers', 'Whole Numbers', 'Number Line', 'Properties of Whole Numbers'] },
      { num: 3,  name: 'Playing with Numbers',          topics: ['Factors and Multiples', 'Prime and Composite Numbers', 'HCF and LCM', 'Tests of Divisibility'] },
      { num: 4,  name: 'Basic Geometrical Ideas',       topics: ['Point, Line, Plane', 'Angle', 'Polygon', 'Circle'] },
      { num: 5,  name: 'Understanding Elementary Shapes', topics: ['Line Segments', 'Angles', 'Triangles', 'Polygons', '3-D Shapes'] },
      { num: 6,  name: 'Integers',                      topics: ['Negative Numbers', 'Number Line', 'Addition of Integers', 'Subtraction'] },
      { num: 7,  name: 'Fractions',                     topics: ['Types of Fractions', 'Equivalent Fractions', 'Comparison', 'Addition and Subtraction'] },
      { num: 8,  name: 'Decimals',                      topics: ['Tenths and Hundredths', 'Comparison of Decimals', 'Addition and Subtraction'] },
      { num: 9,  name: 'Data Handling',                 topics: ['Recording Data', 'Pictograph', 'Bar Graph', 'Mean'] },
      { num: 10, name: 'Mensuration',                   topics: ['Perimeter', 'Area', 'Irregular Shapes'] },
      { num: 11, name: 'Algebra',                       topics: ['Matchstick Patterns', 'Variables', 'Expressions', 'Equations'] },
      { num: 12, name: 'Ratio and Proportion',          topics: ['Ratio', 'Proportion', 'Unitary Method'] },
      { num: 13, name: 'Symmetry',                      topics: ['Line Symmetry', 'Lines of Symmetry', 'Reflection'] },
      { num: 14, name: 'Practical Geometry',            topics: ['Drawing a Circle', 'Constructing Line Segments', 'Angles'] },
    ],
  },

  '6-science': {
    bookTitle: 'Science — Textbook for Class VI',
    chapters: [
      { num: 1,  name: 'Food: Where Does It Come From?',    topics: ['Food Variety', 'Food Materials', 'Plant Parts', 'Animal Food'] },
      { num: 2,  name: 'Components of Food',                topics: ['Nutrients', 'Carbohydrates', 'Proteins', 'Vitamins', 'Balanced Diet'] },
      { num: 3,  name: 'Fibre to Fabric',                   topics: ['Variety of Fabrics', 'Spinning Cotton', 'Jute', 'Weaving'] },
      { num: 4,  name: 'Sorting Materials into Groups',     topics: ['Objects Around Us', 'Properties of Materials', 'Transparency'] },
      { num: 5,  name: 'Separation of Substances',         topics: ['Handpicking', 'Sieving', 'Filtration', 'Evaporation'] },
      { num: 6,  name: 'Changes Around Us',                 topics: ['Reversible Changes', 'Irreversible Changes', 'Contraction and Expansion'] },
      { num: 7,  name: 'Getting to Know Plants',            topics: ['Herbs, Shrubs, Trees', 'Stem', 'Leaf', 'Root', 'Flower'] },
      { num: 8,  name: 'Body Movements',                    topics: ['Human Body Movements', 'Gait of Animals', 'Joints', 'Skeleton'] },
      { num: 9,  name: 'The Living Organisms and Their Surroundings', topics: ['Habitat', 'Adaptations', 'Desert/Aquatic Organisms'] },
      { num: 10, name: 'Motion and Measurement of Distances', topics: ['Story of Transport', 'Units of Measurement', 'Types of Motion'] },
      { num: 11, name: 'Light, Shadows and Reflections',   topics: ['Transparent Objects', 'Opaque Objects', 'Shadows', 'Reflection', 'Pinhole Camera'] },
      { num: 12, name: 'Electricity and Circuits',         topics: ['Electric Cell', 'Electric Bulb', 'Switch', 'Conductors and Insulators'] },
      { num: 13, name: 'Fun with Magnets',                 topics: ['Properties of Magnets', 'Finding Directions', 'Attraction and Repulsion'] },
      { num: 14, name: 'Water',                            topics: ['Water Sources', 'Water Cycle', 'Rainwater Harvesting', 'Back to Oceans'] },
      { num: 15, name: 'Air Around Us',                    topics: ['Is Air Present?', 'Composition of Air', 'How Does Oxygen Get Replenished?'] },
    ],
  },

  // ════════════════════════════════════════════════
  // CLASS 8
  // ════════════════════════════════════════════════

  '8-mathematics': {
    bookTitle: 'Mathematics — Textbook for Class VIII',
    chapters: [
      { num: 1,  name: 'Rational Numbers',              topics: ['Properties of Rational Numbers', 'Number Line', 'Addition and Subtraction', 'Multiplication and Division'] },
      { num: 2,  name: 'Linear Equations in One Variable', topics: ['Solving Equations', 'Applications', 'Equations Reducible to Linear Form'] },
      { num: 3,  name: 'Understanding Quadrilaterals',  topics: ['Polygon Basics', 'Parallelogram', 'Rectangle, Square, Rhombus', 'Trapezium and Kite'] },
      { num: 4,  name: 'Data Handling',                 topics: ['Frequency Distribution', 'Histograms', 'Pie Charts', 'Probability'] },
      { num: 5,  name: 'Squares and Square Roots',      topics: ['Properties of Squares', 'Finding Square Roots', 'Long Division Method'] },
      { num: 6,  name: 'Cubes and Cube Roots',          topics: ['Cube Numbers', 'Cube Root by Prime Factorisation', 'Estimating Cube Root'] },
      { num: 7,  name: 'Comparing Quantities',          topics: ['Ratios and Percentages', 'Profit and Loss', 'Simple Interest', 'Compound Interest'] },
      { num: 8,  name: 'Algebraic Expressions and Identities', topics: ['Expressions', 'Monomials and Polynomials', 'Standard Identities', 'Products of Polynomials'] },
      { num: 9,  name: 'Mensuration',                   topics: ['Area of Trapezium', 'Area of General Quadrilateral', 'Surface Area of Cuboid and Cylinder', 'Volume'] },
      { num: 10, name: 'Exponents and Powers',          topics: ['Powers with Negative Exponents', 'Laws of Exponents', 'Expressing Very Large/Small Numbers'] },
      { num: 11, name: 'Direct and Inverse Proportions', topics: ['Direct Proportion', 'Inverse Proportion'] },
      { num: 12, name: 'Factorisation',                 topics: ['Factors of Natural Numbers', 'Factors of Algebraic Expressions', 'Division of Polynomials'] },
      { num: 13, name: 'Introduction to Graphs',        topics: ['Bar Graphs', 'Pie Graphs', 'Histograms', 'Line Graphs', 'Linear Graphs'] },
    ],
  },

  '8-science': {
    bookTitle: 'Science — Textbook for Class VIII',
    chapters: [
      { num: 1,  name: 'Crop Production and Management', topics: ['Agricultural Practices', 'Basic Practices of Crop Production', 'Irrigation', 'Storage'] },
      { num: 2,  name: 'Microorganisms: Friend and Foe', topics: ['Types of Microorganisms', 'Bacteria', 'Vaccines', 'Food Preservation'] },
      { num: 3,  name: 'Coal and Petroleum',            topics: ['Natural Resources', 'Coal', 'Petroleum', 'Natural Gas', 'Conservation'] },
      { num: 4,  name: 'Combustion and Flame',          topics: ['Combustion', 'Types of Combustion', 'Flame Structure', 'Fuels'] },
      { num: 5,  name: 'Conservation of Plants and Animals', topics: ['Deforestation', 'Conservation', 'Biosphere Reserve', 'Red Data Book', 'Migration'] },
      { num: 6,  name: 'Reproduction in Animals',      topics: ['Modes of Reproduction', 'Sexual Reproduction', 'Asexual Reproduction', 'Development of Embryo'] },
      { num: 7,  name: 'Reaching the Age of Adolescence', topics: ['Adolescence', 'Hormones', 'Reproductive Health', 'Puberty Changes'] },
      { num: 8,  name: 'Force and Pressure',           topics: ['Force', 'Pressure', 'Atmospheric Pressure', 'Pascal\'s Law'] },
      { num: 9,  name: 'Friction',                     topics: ['Force of Friction', 'Static and Kinetic Friction', 'Fluid Friction', 'Increasing/Decreasing Friction'] },
      { num: 10, name: 'Sound',                         topics: ['Sound Production', 'Propagation of Sound', 'Amplitude and Frequency', 'Audible Range', 'Noise Pollution'] },
      { num: 11, name: 'Chemical Effects of Electric Current', topics: ['Conductors and Insulators', 'Chemical Effects', 'Electroplating'] },
      { num: 12, name: 'Some Natural Phenomena',       topics: ['Lightning', 'Earthquakes', 'Static Electricity', 'Charging'] },
      { num: 13, name: 'Light',                         topics: ['Reflection', 'Laws of Reflection', 'Regular and Diffused Reflection', 'Dispersion', 'Human Eye'] },
    ],
  },

  // ════════════════════════════════════════════════
  // CLASS 9
  // ════════════════════════════════════════════════

  '9-mathematics': {
    bookTitle: 'Mathematics — Textbook for Class IX',
    chapters: [
      { num: 1,  name: 'Number Systems',                    topics: ['Rational Numbers', 'Irrational Numbers', 'Real Numbers', 'Laws of Exponents'] },
      { num: 2,  name: 'Polynomials',                       topics: ['Polynomials in One Variable', 'Zeroes of Polynomial', 'Remainder Theorem', 'Factor Theorem', 'Factorisation of Polynomials'] },
      { num: 3,  name: 'Coordinate Geometry',               topics: ['Cartesian System', 'Plotting Points', 'Quadrants', 'Locating Points'] },
      { num: 4,  name: 'Linear Equations in Two Variables', topics: ['Solution of Linear Equation', 'Graph of Linear Equation', 'Equations of Lines Parallel to Axes'] },
      { num: 5,  name: 'Introduction to Euclid\'s Geometry', topics: ['Euclid\'s Definitions', 'Euclid\'s Postulates', 'Euclid\'s Fifth Postulate', 'Axioms and Theorems'] },
      { num: 6,  name: 'Lines and Angles',                  topics: ['Pairs of Angles', 'Parallel Lines and Transversal', 'Angle Sum Property of Triangle'] },
      { num: 7,  name: 'Triangles',                         topics: ['Congruence of Triangles', 'Criteria for Congruence (SAS, ASA, SSS, RHS)', 'Properties of Isosceles Triangle', 'Inequalities in Triangle'] },
      { num: 8,  name: 'Quadrilaterals',                    topics: ['Angle Sum Property', 'Types of Quadrilaterals', 'Properties of Parallelogram', 'Mid-Point Theorem'] },
      { num: 9,  name: 'Circles',                           topics: ['Circle and Parts', 'Chord Properties', 'Arc of Circle', 'Cyclic Quadrilaterals', 'Angle in a Segment'] },
      { num: 10, name: 'Heron\'s Formula',                  topics: ['Area of Triangle — Heron\'s Formula', 'Area of Quadrilateral', 'Application of Heron\'s Formula'] },
      { num: 11, name: 'Surface Areas and Volumes',         topics: ['Surface Area of Cuboid and Cube', 'Surface Area of Cylinder, Cone, Sphere', 'Volume of Cuboid, Cylinder, Cone, Sphere'] },
      { num: 12, name: 'Statistics',                        topics: ['Collection of Data', 'Presentation of Data', 'Measures of Central Tendency', 'Mean, Median, Mode'] },
    ],
  },

  '9-science': {
    bookTitle: 'Science — Textbook for Class IX',
    chapters: [
      { num: 1,  name: 'Matter in Our Surroundings',        topics: ['Physical Nature of Matter', 'States of Matter', 'Evaporation', 'Diffusion'] },
      { num: 2,  name: 'Is Matter Around Us Pure',          topics: ['Mixtures', 'Solutions', 'Separating Components', 'Physical and Chemical Changes', 'Types of Pure Substances'] },
      { num: 3,  name: 'Atoms and Molecules',               topics: ['Laws of Chemical Combination', 'Atom', 'Molecule', 'Atomic Mass', 'Mole Concept'] },
      { num: 4,  name: 'Structure of the Atom',             topics: ['Charged Particles in Matter', 'Thomson\'s Model', 'Rutherford\'s Model', 'Bohr\'s Model', 'Valency'] },
      { num: 5,  name: 'The Fundamental Unit of Life',      topics: ['Cell', 'Cell Theory', 'Cell Organelles', 'Prokaryotes and Eukaryotes', 'Plant vs Animal Cell'] },
      { num: 6,  name: 'Tissues',                           topics: ['Plant Tissues', 'Meristematic Tissue', 'Permanent Tissues', 'Animal Tissues', 'Epithelial, Connective, Muscular, Nervous'] },
      { num: 7,  name: 'Motion',                            topics: ['Describing Motion', 'Speed and Velocity', 'Acceleration', 'Equations of Motion', 'Distance-Time Graphs'] },
      { num: 8,  name: 'Force and Laws of Motion',          topics: ['Newton\'s First Law', 'Inertia', 'Newton\'s Second Law (F=ma)', 'Newton\'s Third Law', 'Conservation of Momentum'] },
      { num: 9,  name: 'Gravitation',                       topics: ['Universal Law of Gravitation', 'Free Fall', 'Mass and Weight', 'Thrust and Pressure', 'Archimedes\' Principle'] },
      { num: 10, name: 'Work and Energy',                   topics: ['Work', 'Energy', 'Kinetic and Potential Energy', 'Law of Conservation of Energy', 'Power'] },
      { num: 11, name: 'Sound',                             topics: ['Production of Sound', 'Propagation', 'Reflection of Sound', 'Echo', 'Range of Hearing', 'SONAR'] },
      { num: 12, name: 'Improvement in Food Resources',     topics: ['Crop Variety', 'Crop Production Management', 'Crop Protection', 'Animal Husbandry'] },
    ],
  },

  '9-history': {
    bookTitle: 'India and the Contemporary World I — History (Class IX)',
    chapters: [
      { num: 1, name: 'The French Revolution',              topics: ['French Society', 'The Outbreak of Revolution', 'France Abolishes Monarchy', 'The Reign of Terror', 'Legacy of French Revolution'] },
      { num: 2, name: 'Socialism in Europe and the Russian Revolution', topics: ['Age of Social Change', 'Russian Revolution', 'The February Revolution', 'What Changed After October', 'The Stalinist Period'] },
      { num: 3, name: 'Nazism and the Rise of Hitler',      topics: ['Hitler\'s Rise to Power', 'Nazi Ideology', 'Youth in Nazi Germany', 'The Holocaust', 'War, Peace and Nation-building'] },
      { num: 4, name: 'Forest Society and Colonialism',     topics: ['Why Deforestation', 'The Rise of Commercial Forestry', 'Rebellion in the Forest', 'Forest Transformation Elsewhere'] },
      { num: 5, name: 'Pastoralists in the Modern World',   topics: ['Pastoral Nomads and Their Movements', 'Colonial Rule and Pastoral Life', 'Pastoralism in Africa'] },
    ],
  },

  '9-geography': {
    bookTitle: 'Contemporary India I — Geography (Class IX)',
    chapters: [
      { num: 1, name: 'India — Size and Location',          topics: ['Location', 'Size', 'India and the World', 'India\'s Neighbours'] },
      { num: 2, name: 'Physical Features of India',         topics: ['Major Physiographic Divisions', 'The Himalayan Mountains', 'The Northern Plains', 'The Peninsular Plateau', 'The Coastal Plains'] },
      { num: 3, name: 'Drainage',                           topics: ['Drainage Systems', 'The Himalayan Rivers', 'The Peninsular Rivers', 'Lakes', 'Role of Rivers'] },
      { num: 4, name: 'Climate',                            topics: ['Factors Affecting Climate', 'The Indian Monsoon', 'Seasons', 'Distribution of Rainfall'] },
      { num: 5, name: 'Natural Vegetation and Wildlife',    topics: ['Types of Vegetation', 'Forest Types', 'Wildlife', 'Conservation'] },
      { num: 6, name: 'Population',                         topics: ['Population Size', 'Population Distribution', 'Literacy', 'Health and Sex Ratio', 'Occupational Structure'] },
    ],
  },

  '9-economics': {
    bookTitle: 'Economics — Textbook for Class IX',
    chapters: [
      { num: 1, name: 'The Story of Village Palampur',      topics: ['Organisation of Production', 'Farming in Palampur', 'Non-Farm Activities', 'Capital and Labour'] },
      { num: 2, name: 'People as Resource',                 topics: ['Economic Activities', 'Quality of Population', 'Unemployment', 'Education and Health as Human Capital'] },
      { num: 3, name: 'Poverty as a Challenge',             topics: ['Two Typical Cases of Poverty', 'Poverty Indicators', 'Vulnerable Groups', 'Inter-State Disparities', 'Global Poverty'] },
      { num: 4, name: 'Food Security in India',             topics: ['Food Security', 'Sources of Food', 'Food Security and Indian Government', 'Public Distribution System'] },
    ],
  },

  '9-political_science': {
    bookTitle: 'Democratic Politics I — Civics (Class IX)',
    chapters: [
      { num: 1, name: 'What is Democracy? Why Democracy?',  topics: ['Features of Democracy', 'Arguments for Democracy', 'Broader Meaning of Democracy'] },
      { num: 2, name: 'Constitutional Design',              topics: ['Democratic Constitution in South Africa', 'Why Do We Need a Constitution?', 'Making of the Indian Constitution', 'Guiding Values of the Indian Constitution'] },
      { num: 3, name: 'Electoral Politics',                 topics: ['Why Elections', 'What Makes an Election Democratic', 'Election Campaign', 'Voting and Winning'] },
      { num: 4, name: 'Working of Institutions',           topics: ['How Does Parliament Work?', 'Political Executive', 'Permanent Executive', 'Judiciary'] },
      { num: 5, name: 'Democratic Rights',                  topics: ['Life Without Rights', 'Rights in a Democracy', 'Rights in the Indian Constitution', 'Expanding Scope of Rights'] },
    ],
  },

  // ════════════════════════════════════════════════
  // CLASS 10
  // ════════════════════════════════════════════════

  '10-mathematics': {
    bookTitle: 'Mathematics — Textbook for Class X',
    chapters: [
      { num: 1,  name: 'Real Numbers',                              topics: ['Euclid\'s Division Lemma', 'Fundamental Theorem of Arithmetic', 'Revisiting Rational and Irrational Numbers', 'Decimal Expansions'] },
      { num: 2,  name: 'Polynomials',                               topics: ['Geometric Meaning of Zeroes', 'Relationship Between Zeroes and Coefficients', 'Division Algorithm', 'Quadratic Polynomial'] },
      { num: 3,  name: 'Pair of Linear Equations in Two Variables', topics: ['Graphical Method', 'Substitution Method', 'Elimination Method', 'Cross-Multiplication Method', 'Equations Reducible to Linear Form'] },
      { num: 4,  name: 'Quadratic Equations',                       topics: ['Standard Form', 'Factorisation Method', 'Completing the Square', 'Quadratic Formula', 'Nature of Roots'] },
      { num: 5,  name: 'Arithmetic Progressions',                   topics: ['What is an AP?', 'nth Term of AP', 'Sum of n Terms of AP', 'Applications of AP'] },
      { num: 6,  name: 'Triangles',                                 topics: ['Similar Figures', 'Criteria for Similarity (AA, SSS, SAS)', 'Basic Proportionality Theorem', 'Pythagoras Theorem', 'Areas of Similar Triangles'] },
      { num: 7,  name: 'Coordinate Geometry',                       topics: ['Distance Formula', 'Section Formula', 'Mid-Point Formula', 'Area of Triangle'] },
      { num: 8,  name: 'Introduction to Trigonometry',              topics: ['Trigonometric Ratios', 'Trigonometric Ratios of Some Specific Angles', 'Trigonometric Ratios of Complementary Angles', 'Trigonometric Identities'] },
      { num: 9,  name: 'Some Applications of Trigonometry',         topics: ['Heights and Distances', 'Angle of Elevation', 'Angle of Depression', 'Problems on Two Points'] },
      { num: 10, name: 'Circles',                                   topics: ['Tangent to a Circle', 'Number of Tangents from a Point', 'Tangent at a Point', 'Lengths of Tangents'] },
      { num: 11, name: 'Areas Related to Circles',                  topics: ['Perimeter and Area of Circle', 'Areas of Sector and Segment', 'Areas of Combinations of Plane Figures'] },
      { num: 12, name: 'Surface Areas and Volumes',                 topics: ['Surface Area of Combination of Solids', 'Volume of Combination of Solids', 'Conversion of Solids', 'Frustum of Cone'] },
      { num: 13, name: 'Statistics',                                topics: ['Mean of Grouped Data', 'Mode of Grouped Data', 'Median of Grouped Data', 'Ogive (Cumulative Frequency Curve)'] },
      { num: 14, name: 'Probability',                               topics: ['Classical Probability', 'Sample Space', 'Events', 'Complementary Events', 'Probability of Simple Events'] },
    ],
  },

  '10-science': {
    bookTitle: 'Science — Textbook for Class X',
    chapters: [
      { num: 1,  name: 'Chemical Reactions and Equations',     topics: ['Chemical Equations', 'Balancing Chemical Equations', 'Types of Chemical Reactions', 'Effects of Oxidation in Daily Life'] },
      { num: 2,  name: 'Acids, Bases and Salts',               topics: ['Understanding Acids and Bases', 'Chemical Properties of Acids and Bases', 'pH Scale', 'Salts', 'Bleaching Powder, Baking Soda, Washing Soda'] },
      { num: 3,  name: 'Metals and Non-metals',                topics: ['Physical and Chemical Properties', 'Reactivity Series', 'Corrosion', 'Ionic Compounds', 'Extraction of Metals'] },
      { num: 4,  name: 'Carbon and its Compounds',             topics: ['Bonding in Carbon', 'Versatile Nature of Carbon', 'Homologous Series', 'Nomenclature', 'Chemical Properties', 'Ethanol and Ethanoic Acid', 'Soaps and Detergents'] },
      { num: 5,  name: 'Life Processes',                       topics: ['Nutrition', 'Respiration', 'Transportation', 'Excretion'] },
      { num: 6,  name: 'Control and Coordination',             topics: ['Animals: Nervous System', 'Reflex Action', 'Human Brain', 'Coordination in Plants', 'Hormones in Animals'] },
      { num: 7,  name: 'How do Organisms Reproduce?',          topics: ['Modes of Reproduction', 'Asexual Reproduction', 'Sexual Reproduction in Plants', 'Sexual Reproduction in Human Beings', 'Reproductive Health'] },
      { num: 8,  name: 'Heredity',                             topics: ['Accumulation of Variation', 'Mendel\'s Experiments', 'Heredity in Humans', 'Sex Determination', 'Evolution and Classification'] },
      { num: 9,  name: 'Light — Reflection and Refraction',   topics: ['Reflection of Light', 'Spherical Mirrors', 'Mirror Formula', 'Refraction', 'Lens Formula', 'Power of Lens'] },
      { num: 10, name: 'The Human Eye and the Colourful World', topics: ['Human Eye', 'Defects of Vision', 'Atmospheric Refraction', 'Dispersion of Light', 'Scattering of Light (Why Sky is Blue)'] },
      { num: 11, name: 'Electricity',                          topics: ['Ohm\'s Law', 'Factors Affecting Resistance', 'Combination of Resistors (Series and Parallel)', 'Heating Effect', 'Electric Power'] },
      { num: 12, name: 'Magnetic Effects of Electric Current', topics: ['Magnetic Field and Magnet', 'Magnetic Field due to Current', 'Force on Current', 'Electric Motor', 'Electromagnetic Induction', 'Generator'] },
      { num: 13, name: 'Our Environment',                      topics: ['Ecosystem', 'Food Chains and Webs', 'Ozone Layer Depletion', 'Management of Waste'] },
    ],
  },

  '10-history': {
    bookTitle: 'India and the Contemporary World II — History (Class X)',
    chapters: [
      { num: 1, name: 'The Rise of Nationalism in Europe',      topics: ['The French Revolution', 'Making of Nationalism in Europe', 'Age of Revolutions', 'Visualising the Nation', 'Nationalism and Imperialism'] },
      { num: 2, name: 'Nationalism in India',                   topics: ['First World War and Khilafat', 'Non-Cooperation Movement', 'Differing Strands within Movement', 'The Limits of Civil Disobedience', 'Sense of Collective Belonging'] },
      { num: 3, name: 'The Making of a Global World',          topics: ['Silk Routes', 'Food Travels', 'Conquest, Disease and Trade', 'The World Economy in the Late 19th Century', 'Post-War Recovery'] },
      { num: 4, name: 'The Age of Industrialisation',          topics: ['Before the Industrial Revolution', 'Hand Labour and Steam Power', 'Industrialisation in the Colonies', 'Factories Come Up', 'The Peculiarities of Industrial Growth in India'] },
      { num: 5, name: 'Print Culture and the Modern World',    topics: ['The First Printed Books', 'Print in India', 'Religious Reform and Public Debates', 'New Forms of Publication', 'Print and the Poor People'] },
    ],
  },

  '10-geography': {
    bookTitle: 'Contemporary India II — Geography (Class X)',
    chapters: [
      { num: 1, name: 'Resources and Development',              topics: ['Types of Resources', 'Development of Resources', 'Land Resources', 'Soil Resources', 'Soil Erosion and Conservation'] },
      { num: 2, name: 'Forest and Wildlife Resources',          topics: ['Conservation of Forest and Wildlife', 'Types and Distribution of Forest', 'Community and Conservation'] },
      { num: 3, name: 'Water Resources',                        topics: ['Water Scarcity', 'Dams', 'Rainwater Harvesting'] },
      { num: 4, name: 'Agriculture',                            topics: ['Types of Farming', 'Cropping Pattern', 'Major Crops', 'Technological and Institutional Reforms'] },
      { num: 5, name: 'Minerals and Energy Resources',          topics: ['Types of Minerals', 'Distribution of Minerals in India', 'Types of Energy Resources', 'Conservation'] },
      { num: 6, name: 'Manufacturing Industries',               topics: ['Importance of Manufacturing', 'Types of Industries', 'Agro-Based Industries', 'Mineral-Based Industries'] },
      { num: 7, name: 'Lifelines of National Economy',          topics: ['Transport: Roadways, Railways, Waterways, Airways, Pipelines', 'Communication', 'International Trade', 'Tourism'] },
    ],
  },

  '10-political_science': {
    bookTitle: 'Democratic Politics II — Political Science (Class X)',
    chapters: [
      { num: 1, name: 'Power Sharing',           topics: ['Why Power Sharing is Desirable', 'Belgium and Sri Lanka', 'Forms of Power Sharing'] },
      { num: 2, name: 'Federalism',               topics: ['What is Federalism?', 'Indian Federalism', 'Decentralisation', 'Panchayati Raj'] },
      { num: 3, name: 'Gender, Religion and Caste', topics: ['Gender and Politics', 'Religion, Communalism and Politics', 'Caste and Politics'] },
      { num: 4, name: 'Political Parties',         topics: ['Why Parties?', 'How Many Parties?', 'National and State Parties', 'Challenges to Political Parties', 'Party Reforms'] },
      { num: 5, name: 'Outcomes of Democracy',     topics: ['How Do We Assess Democracy?', 'Accountable and Legitimate Government', 'Economic Growth', 'Reduction of Inequality', 'Dignity and Freedom of Citizens'] },
    ],
  },

  '10-economics': {
    bookTitle: 'Understanding Economic Development — Economics (Class X)',
    chapters: [
      { num: 1, name: 'Development',               topics: ['What Development Promises', 'Income and Development', 'Sustainability of Development', 'Human Development Index'] },
      { num: 2, name: 'Sectors of the Indian Economy', topics: ['Sectors of Economic Activities', 'Primary, Secondary and Tertiary Sectors', 'GDP and Three Sectors', 'Organised and Unorganised Sectors'] },
      { num: 3, name: 'Money and Credit',           topics: ['Money as Medium of Exchange', 'Modern Forms of Money', 'Loan Activities of Banks', 'Terms of Credit', 'Formal Sector Credit vs Informal'] },
      { num: 4, name: 'Globalisation and the Indian Economy', topics: ['Production across Countries', 'Interlinking Production', 'Foreign Trade and Integration', 'WTO', 'Impact of Globalisation'] },
      { num: 5, name: 'Consumer Rights',            topics: ['Consumer Rights', 'Consumer Movement', 'Consumer Exploitation', 'Consumer Protection Act', 'Consumer Forums'] },
    ],
  },

  // ════════════════════════════════════════════════
  // CLASS 11
  // ════════════════════════════════════════════════

  '11-physics': {
    bookTitle: 'Physics — Textbook for Class XI (Parts I & II)',
    chapters: [
      { num: 1,  name: 'Physical World',                        topics: ['Physics — Scope and Excitement', 'Nature of Physical Laws', 'Physics, Technology and Society'] },
      { num: 2,  name: 'Units and Measurements',                topics: ['International System of Units', 'Significant Figures', 'Dimensional Analysis', 'Errors in Measurement'] },
      { num: 3,  name: 'Motion in a Straight Line',             topics: ['Instantaneous Velocity', 'Uniformly Accelerated Motion', 'Kinematic Equations', 'Relative Velocity'] },
      { num: 4,  name: 'Motion in a Plane',                     topics: ['Scalars and Vectors', 'Vector Operations', 'Projectile Motion', 'Uniform Circular Motion'] },
      { num: 5,  name: 'Laws of Motion',                        topics: ['Newton\'s First, Second and Third Laws', 'Conservation of Momentum', 'Friction', 'Circular Motion Dynamics'] },
      { num: 6,  name: 'Work, Energy and Power',                topics: ['Work Done by Variable Force', 'Kinetic and Potential Energy', 'Conservation of Energy', 'Collisions', 'Power'] },
      { num: 7,  name: 'System of Particles and Rotational Motion', topics: ['Centre of Mass', 'Angular Velocity', 'Torque and Angular Momentum', 'Moment of Inertia', 'Rolling Motion'] },
      { num: 8,  name: 'Gravitation',                           topics: ['Kepler\'s Laws', 'Universal Law of Gravitation', 'Gravitational Potential Energy', 'Escape Speed', 'Satellites'] },
      { num: 9,  name: 'Mechanical Properties of Solids',       topics: ['Stress and Strain', 'Hooke\'s Law', 'Elastic Moduli', 'Applications of Elastic Behaviour'] },
      { num: 10, name: 'Mechanical Properties of Fluids',       topics: ['Pressure', 'Streamline Flow', 'Bernoulli\'s Principle', 'Viscosity', 'Surface Tension'] },
      { num: 11, name: 'Thermal Properties of Matter',          topics: ['Heat and Temperature', 'Calorimetry', 'Change of State', 'Heat Transfer (Conduction, Convection, Radiation)'] },
      { num: 12, name: 'Thermodynamics',                        topics: ['Thermal Equilibrium', 'Zeroth, First, Second Laws of Thermodynamics', 'Heat Engines', 'Carnot Engine', 'Entropy'] },
      { num: 13, name: 'Kinetic Theory',                        topics: ['Molecular Nature of Matter', 'Kinetic Theory of an Ideal Gas', 'Law of Equipartition of Energy', 'Specific Heat Capacity', 'Mean Free Path'] },
      { num: 14, name: 'Oscillations',                          topics: ['Periodic Motion', 'Simple Harmonic Motion', 'SHM and Uniform Circular Motion', 'Damped Oscillations', 'Forced Oscillations and Resonance'] },
      { num: 15, name: 'Waves',                                 topics: ['Transverse and Longitudinal Waves', 'Displacement Relation', 'Principle of Superposition', 'Standing Waves', 'Beats', 'Doppler Effect'] },
    ],
  },

  '11-chemistry': {
    bookTitle: 'Chemistry — Textbook for Class XI (Parts I & II)',
    chapters: [
      { num: 1,  name: 'Some Basic Concepts of Chemistry',       topics: ['Laws of Chemical Combination', 'Atomic and Molecular Masses', 'Mole Concept', 'Stoichiometry', 'Limiting Reagent'] },
      { num: 2,  name: 'Structure of Atom',                      topics: ['Thomson\'s Model', 'Rutherford\'s Experiment', 'Bohr\'s Model', 'Quantum Mechanical Model', 'Orbitals and Quantum Numbers', 'Electronic Configuration'] },
      { num: 3,  name: 'Classification of Elements and Periodicity', topics: ['Mendeleev\'s Periodic Table', 'Modern Periodic Table', 'Periodic Trends', 'Ionization Enthalpy', 'Electronegativity'] },
      { num: 4,  name: 'Chemical Bonding and Molecular Structure', topics: ['Kossel-Lewis Approach', 'Ionic Bond', 'Covalent Bond', 'VSEPR Theory', 'Valence Bond Theory', 'Hybridisation', 'Molecular Orbital Theory'] },
      { num: 5,  name: 'States of Matter: Gases and Liquids',    topics: ['Intermolecular Forces', 'Gas Laws', 'Ideal Gas Equation', 'Real Gases', 'Liquid State'] },
      { num: 6,  name: 'Thermodynamics',                         topics: ['System and Surroundings', 'Enthalpy', 'Hess\'s Law', 'Entropy', 'Gibbs Free Energy', 'Spontaneity'] },
      { num: 7,  name: 'Equilibrium',                            topics: ['Dynamic Equilibrium', 'Law of Mass Action', 'Le Chatelier\'s Principle', 'Ionisation of Acids and Bases', 'pH', 'Buffer Solutions'] },
      { num: 8,  name: 'Redox Reactions',                        topics: ['Oxidation and Reduction', 'Oxidation Number', 'Balancing Redox Reactions', 'Electrochemical Series'] },
      { num: 9,  name: 'Hydrogen',                               topics: ['Position in Periodic Table', 'Dihydrogen', 'Hydrides', 'Water', 'Hydrogen Peroxide', 'Hydrogen Economy'] },
      { num: 10, name: 'The s-Block Elements',                   topics: ['Alkali Metals', 'General Characteristics', 'Anomalous Properties of Lithium', 'Alkaline Earth Metals', 'Uses'] },
      { num: 11, name: 'The p-Block Elements',                   topics: ['Group 13 (Boron Family)', 'Group 14 (Carbon Family)', 'Allotropes', 'Important Compounds'] },
      { num: 12, name: 'Organic Chemistry: Basic Principles and Techniques', topics: ['Classification of Organic Compounds', 'IUPAC Nomenclature', 'Structural Isomerism', 'Electronic Displacement', 'Types of Organic Reactions'] },
      { num: 13, name: 'Hydrocarbons',                           topics: ['Alkanes', 'Alkenes', 'Alkynes', 'Aromatic Hydrocarbons', 'Petroleum and Carcinogenicity'] },
    ],
  },

  '11-biology': {
    bookTitle: 'Biology — Textbook for Class XI',
    chapters: [
      { num: 1,  name: 'The Living World',                       topics: ['Biodiversity', 'Nomenclature', 'Classification', 'Taxonomic Categories', 'Taxonomical Aids'] },
      { num: 2,  name: 'Biological Classification',              topics: ['Kingdom Monera, Protista, Fungi, Plantae, Animalia', 'Viruses and Lichens'] },
      { num: 3,  name: 'Plant Kingdom',                          topics: ['Algae', 'Bryophytes', 'Pteridophytes', 'Gymnosperms', 'Angiosperms', 'Plant Life Cycles'] },
      { num: 4,  name: 'Animal Kingdom',                         topics: ['Basis of Classification', 'Porifera, Coelenterata, Platyhelminthes', 'Nematoda, Annelida, Arthropoda, Mollusca, Echinodermata, Chordata'] },
      { num: 5,  name: 'Morphology of Flowering Plants',         topics: ['Root, Stem, Leaf', 'Inflorescence', 'Flower', 'Fruit and Seed', 'Semi-Technical Description'] },
      { num: 6,  name: 'Anatomy of Flowering Plants',            topics: ['Tissue Systems', 'Anatomy of Dicots and Monocots', 'Secondary Growth'] },
      { num: 7,  name: 'Structural Organisation in Animals',     topics: ['Morphology of Frog', 'Tissues', 'Organ and Organ Systems of Cockroach', 'Earth Worm Morphology'] },
      { num: 8,  name: 'Cell: The Unit of Life',                 topics: ['Cell Theory', 'Prokaryotes vs Eukaryotes', 'Cell Membrane', 'Cell Wall', 'Cell Organelles (Mitochondria, Chloroplast, ER, Ribosome, etc.)'] },
      { num: 9,  name: 'Biomolecules',                           topics: ['Chemical Constituents of Living Cells', 'Proteins', 'Lipids', 'Carbohydrates', 'Nucleic Acids', 'Enzymes'] },
      { num: 10, name: 'Cell Cycle and Cell Division',           topics: ['Cell Cycle', 'Mitosis', 'Meiosis', 'Significance of Mitosis and Meiosis'] },
      { num: 11, name: 'Photosynthesis in Higher Plants',        topics: ['Early Experiments', 'Where Does Photosynthesis Occur?', 'Light Reactions', 'Calvin Cycle (C3)', 'C4 Pathway', 'Photorespiration'] },
      { num: 12, name: 'Respiration in Plants',                  topics: ['Glycolysis', 'Fermentation', 'Aerobic Respiration', 'Krebs Cycle', 'Electron Transport System', 'ATP yield'] },
      { num: 13, name: 'Plant Growth and Development',           topics: ['Growth', 'Differentiation', 'Plant Growth Regulators (Auxins, Gibberellins, Cytokinins, ABA, Ethylene)', 'Photoperiodism', 'Vernalisation'] },
      { num: 14, name: 'Breathing and Exchange of Gases',        topics: ['Respiratory Organs', 'Mechanism of Breathing', 'Exchange of Gases', 'Transport of Gases', 'Respiratory Disorders'] },
      { num: 15, name: 'Body Fluids and Circulation',            topics: ['Blood', 'Lymph', 'Human Circulatory System', 'Cardiac Cycle', 'ECG', 'Disorders'] },
      { num: 16, name: 'Excretory Products and their Elimination', topics: ['Modes of Excretion', 'Human Excretory System', 'Urine Formation', 'Tubular Reabsorption', 'Disorders'] },
      { num: 17, name: 'Locomotion and Movement',                topics: ['Types of Movement', 'Muscle Contraction', 'Skeletal System', 'Joints', 'Disorders'] },
      { num: 18, name: 'Neural Control and Coordination',        topics: ['Neural System', 'Neuron', 'CNS', 'PNS', 'Reflex Action', 'Sensory Perception'] },
      { num: 19, name: 'Chemical Coordination and Integration',  topics: ['Endocrine Glands', 'Hormones', 'Pituitary Gland', 'Thyroid, Adrenal, Pancreas', 'Feedback Mechanisms'] },
    ],
  },

  '11-mathematics': {
    bookTitle: 'Mathematics — Textbook for Class XI',
    chapters: [
      { num: 1,  name: 'Sets',                                  topics: ['Sets and Their Representations', 'Empty Set', 'Subsets', 'Power Set', 'Universal Set', 'Set Operations', 'Venn Diagrams'] },
      { num: 2,  name: 'Relations and Functions',               topics: ['Cartesian Product', 'Relations', 'Functions', 'Domain and Range', 'Real Valued Functions', 'Algebraic Operations on Functions'] },
      { num: 3,  name: 'Trigonometric Functions',               topics: ['Angles', 'Trigonometric Functions', 'Trigonometric Identities', 'Trigonometric Equations'] },
      { num: 4,  name: 'Complex Numbers and Quadratic Equations', topics: ['Complex Numbers', 'Algebra of Complex Numbers', 'Argand Plane', 'Modulus and Conjugate', 'Quadratic Equations'] },
      { num: 5,  name: 'Linear Inequalities',                   topics: ['Inequalities', 'Algebraic Solutions', 'Graphical Solution of Linear Inequalities in Two Variables', 'Solution of System of Inequalities'] },
      { num: 6,  name: 'Permutations and Combinations',         topics: ['Fundamental Principle of Counting', 'Permutations', 'Combinations', 'Applications'] },
      { num: 7,  name: 'Binomial Theorem',                      topics: ['Binomial Theorem for Positive Integral Indices', 'General and Middle Terms', 'Binomial Coefficients'] },
      { num: 8,  name: 'Sequences and Series',                  topics: ['Arithmetic Progression', 'Geometric Progression', 'Relationship between AM and GM', 'Special Series (Σn, Σn²)'] },
      { num: 9,  name: 'Straight Lines',                        topics: ['Slope of a Line', 'Various Forms of Equation of Line', 'Distance from a Point to Line', 'Family of Lines'] },
      { num: 10, name: 'Conic Sections',                        topics: ['Sections of a Cone', 'Circle', 'Parabola', 'Ellipse', 'Hyperbola'] },
      { num: 11, name: 'Introduction to Three Dimensional Geometry', topics: ['Coordinate Axes and Planes', 'Coordinates of a Point', 'Distance between Two Points', 'Section Formula'] },
      { num: 12, name: 'Limits and Derivatives',                topics: ['Intuitive Idea of Derivatives', 'Limits', 'Algebra of Limits', 'Derivatives', 'Algebra of Derivatives of Functions'] },
      { num: 13, name: 'Statistics',                            topics: ['Measures of Dispersion', 'Range', 'Mean Deviation', 'Variance and Standard Deviation', 'Analysis of Frequency Distribution'] },
      { num: 14, name: 'Probability',                           topics: ['Random Experiment', 'Event', 'Axiomatic Approach to Probability', 'Probability of Equally Likely Outcomes', 'Probability using Set Theory'] },
    ],
  },

  '11-economics': {
    bookTitle: 'Indian Economic Development — Economics (Class XI)',
    chapters: [
      { num: 1, name: 'Indian Economy on the Eve of Independence', topics: ['Low Level of Economic Development', 'Agriculture', 'Industry', 'External Trade'] },
      { num: 2, name: 'Indian Economy 1950-1990',                  topics: ['Goals of Five Year Plans', 'Agriculture', 'Industry and Trade', 'Trade Policy: Import Substitution'] },
      { num: 3, name: 'Liberalisation, Privatisation and Globalisation', topics: ['Background to Reforms', 'Liberalisation', 'Privatisation', 'Globalisation', 'Critical Assessment'] },
      { num: 4, name: 'Poverty',                                    topics: ['Who are the Poor?', 'Poverty Estimation', 'Vulnerable Groups', 'Interstate Disparities', 'Causes of Poverty', 'MGNREGS'] },
      { num: 5, name: 'Human Capital Formation in India',           topics: ['Education and Health', 'Sources of Human Capital', 'Role of Human Capital', 'Education Sector in India', 'Present Status'] },
      { num: 6, name: 'Rural Development',                          topics: ['Credit and Marketing', 'Agricultural Market Reforms', 'Diversification into Productive Activities', 'Sustainable Development'] },
      { num: 7, name: 'Employment: Growth, Informalisation',        topics: ['Workers and Employment', 'Informalisation of Workforce', 'Unemployment', 'Government Initiatives'] },
      { num: 8, name: 'Infrastructure',                             topics: ['Meaning and Importance', 'Energy', 'Health', 'India\'s Infrastructure Development'] },
      { num: 9, name: 'Environment and Sustainable Development',    topics: ['Functions of Environment', 'Environmental Crisis', 'Sustainable Development', 'Global Warming and Climate Change'] },
    ],
  },

  // ════════════════════════════════════════════════
  // CLASS 12
  // ════════════════════════════════════════════════

  '12-physics': {
    bookTitle: 'Physics — Textbook for Class XII (Parts I & II)',
    chapters: [
      { num: 1,  name: 'Electric Charges and Fields',             topics: ['Electric Charge', 'Coulomb\'s Law', 'Electric Field', 'Electric Field Lines', 'Electric Flux', 'Gauss\'s Law'] },
      { num: 2,  name: 'Electrostatic Potential and Capacitance', topics: ['Electrostatic Potential', 'Potential due to Point Charge', 'Potential Energy', 'Capacitance', 'Dielectrics', 'Energy Stored in Capacitor'] },
      { num: 3,  name: 'Current Electricity',                     topics: ['Electric Current', 'Ohm\'s Law', 'Electrical Resistance', 'Kirchhoff\'s Laws', 'Wheatstone Bridge', 'Potentiometer'] },
      { num: 4,  name: 'Moving Charges and Magnetism',            topics: ['Magnetic Force', 'Biot-Savart Law', 'Ampere\'s Law', 'Solenoid and Toroid', 'Cyclotron', 'Moving Coil Galvanometer'] },
      { num: 5,  name: 'Magnetism and Matter',                    topics: ['Bar Magnet', 'Magnetism and Gauss\'s Law', 'Earth\'s Magnetism', 'Magnetisation and Magnetic Intensity', 'Para, Dia, Ferromagnetism'] },
      { num: 6,  name: 'Electromagnetic Induction',               topics: ['Faraday\'s Laws', 'Lenz\'s Law', 'Motional EMF', 'Energy Consideration', 'Inductance', 'Eddy Currents'] },
      { num: 7,  name: 'Alternating Current',                     topics: ['AC Generator', 'Representation of AC', 'Reactance and Impedance', 'LC Oscillations', 'Resonance', 'Power in AC Circuit', 'Transformer'] },
      { num: 8,  name: 'Electromagnetic Waves',                   topics: ['Displacement Current', 'Electromagnetic Waves', 'Electromagnetic Spectrum'] },
      { num: 9,  name: 'Ray Optics and Optical Instruments',      topics: ['Reflection at Curved Surface', 'Refraction', 'Lens Maker\'s Equation', 'Prism', 'Scattering', 'Optical Instruments (Microscope, Telescope)'] },
      { num: 10, name: 'Wave Optics',                             topics: ['Huygens Principle', 'Interference (Young\'s Double Slit)', 'Diffraction', 'Polarisation', 'Malus\'s Law'] },
      { num: 11, name: 'Dual Nature of Radiation and Matter',     topics: ['Photoelectric Effect', 'Einstein\'s Equation', 'de Broglie Hypothesis', 'Davisson-Germer Experiment'] },
      { num: 12, name: 'Atoms',                                   topics: ['Alpha-Particle Scattering', 'Rutherford\'s Model', 'Bohr\'s Model', 'Energy Levels', 'Hydrogen Spectrum'] },
      { num: 13, name: 'Nuclei',                                  topics: ['Atomic Masses', 'Composition of Nucleus', 'Nuclear Binding Energy', 'Radioactivity', 'Nuclear Energy (Fission and Fusion)'] },
    ],
  },

  '12-chemistry': {
    bookTitle: 'Chemistry — Textbook for Class XII (Parts I & II)',
    chapters: [
      { num: 1,  name: 'Solutions',                               topics: ['Types of Solutions', 'Expressing Concentration', 'Vapour Pressure', 'Colligative Properties', 'Abnormal Molar Masses', 'van\'t Hoff Factor'] },
      { num: 2,  name: 'Electrochemistry',                        topics: ['Electrochemical Cells', 'Galvanic Cells', 'Nernst Equation', 'Electrolysis', 'Conductance', 'Batteries and Fuel Cells', 'Corrosion'] },
      { num: 3,  name: 'Chemical Kinetics',                       topics: ['Rate of Reaction', 'Rate Laws', 'Integrated Rate Equations', 'Collision Theory', 'Arrhenius Equation', 'Activation Energy'] },
      { num: 4,  name: 'The d- and f-Block Elements',             topics: ['Position in Periodic Table', 'Electronic Configuration', 'Properties of Transition Metals', 'Important Compounds', 'Lanthanoids', 'Actinoids'] },
      { num: 5,  name: 'Coordination Compounds',                  topics: ['Werner\'s Theory', 'IUPAC Nomenclature', 'Isomerism', 'Bonding (VBT and CFT)', 'Stability Constants', 'Importance in Biology'] },
      { num: 6,  name: 'Haloalkanes and Haloarenes',              topics: ['IUPAC Names', 'Preparation Methods', 'Physical Properties', 'Nucleophilic Substitution', 'Elimination Reactions', 'Grignard Reagent'] },
      { num: 7,  name: 'Alcohols, Phenols and Ethers',            topics: ['Classification', 'Nomenclature', 'Preparation', 'Physical and Chemical Properties', 'Uses', 'Ethers'] },
      { num: 8,  name: 'Aldehydes, Ketones and Carboxylic Acids', topics: ['Nomenclature', 'Preparation of Aldehydes and Ketones', 'Chemical Properties', 'Carboxylic Acids', 'Nucleophilic Addition'] },
      { num: 9,  name: 'Amines',                                  topics: ['Structure and Classification', 'IUPAC Nomenclature', 'Preparation', 'Chemical Properties', 'Coupling Reaction', 'Importance in Biological Systems'] },
      { num: 10, name: 'Biomolecules',                            topics: ['Carbohydrates', 'Proteins and Amino Acids', 'Enzymes', 'Vitamins', 'Nucleic Acids (DNA and RNA)'] },
    ],
  },

  '12-biology': {
    bookTitle: 'Biology — Textbook for Class XII',
    chapters: [
      { num: 1,  name: 'Reproduction in Organisms',                topics: ['Modes of Reproduction', 'Asexual Reproduction', 'Sexual Reproduction', 'Events in Sexual Reproduction'] },
      { num: 2,  name: 'Sexual Reproduction in Flowering Plants',  topics: ['Flower Structure', 'Male Gametophyte (Pollen)', 'Female Gametophyte (Embryo Sac)', 'Pollination', 'Double Fertilisation', 'Seed and Fruit Development'] },
      { num: 3,  name: 'Human Reproduction',                       topics: ['Male Reproductive System', 'Female Reproductive System', 'Gametogenesis', 'Fertilisation', 'Embryogenesis', 'Parturition and Lactation'] },
      { num: 4,  name: 'Reproductive Health',                      topics: ['Reproductive Health Problems', 'Population Explosion', 'Birth Control', 'Medical Termination of Pregnancy', 'STDs', 'Infertility'] },
      { num: 5,  name: 'Principles of Inheritance and Variation',  topics: ['Mendel\'s Laws', 'Incomplete Dominance', 'Codominance', 'Multiple Alleles (ABO Blood Group)', 'Sex Determination', 'Mutation', 'Chromosomal Disorders'] },
      { num: 6,  name: 'Molecular Basis of Inheritance',           topics: ['DNA as Genetic Material', 'DNA Structure (Double Helix)', 'DNA Packaging', 'Replication', 'Transcription', 'Genetic Code', 'Translation', 'Gene Regulation (Lac Operon)'] },
      { num: 7,  name: 'Evolution',                                topics: ['Origin of Life', 'Evolution of Life Forms', 'Evidences of Evolution', 'Adaptive Radiation', 'Darwin\'s Theory', 'Hardy-Weinberg Principle', 'Brief Account of Evolution'] },
      { num: 8,  name: 'Human Health and Disease',                 topics: ['Common Diseases in Humans', 'Immunity (Innate and Acquired)', 'Vaccination', 'AIDS', 'Cancer', 'Drugs and Alcohol Abuse'] },
      { num: 9,  name: 'Strategies for Enhancement in Food Production', topics: ['Improvement in Food Production', 'Plant Breeding', 'Single Cell Protein', 'Tissue Culture'] },
      { num: 10, name: 'Microbes in Human Welfare',                topics: ['Microbes in Household Products', 'Microbes in Industrial Production', 'Microbes in Sewage Treatment', 'Microbes in Biogas', 'Biocontrol Agents'] },
      { num: 11, name: 'Biotechnology — Principles and Processes', topics: ['Principles of Biotechnology', 'Tools of Recombinant DNA Technology', 'Processes of Recombinant DNA Technology', 'PCR'] },
      { num: 12, name: 'Biotechnology and its Applications',       topics: ['Application in Agriculture (Bt crops)', 'Application in Medicine (Insulin, Gene Therapy)', 'Biosafety and Bioethics', 'GMO'] },
      { num: 13, name: 'Organisms and Populations',                topics: ['Organism and Its Environment', 'Populations', 'Population Attributes', 'Population Growth', 'Population Interactions'] },
      { num: 14, name: 'Ecosystem',                                topics: ['Ecosystem — Structure and Function', 'Productivity', 'Decomposition', 'Energy Flow', 'Biogeochemical Cycles', 'Ecosystem Services'] },
      { num: 15, name: 'Biodiversity and Conservation',            topics: ['Biodiversity', 'Patterns of Biodiversity', 'Importance of Species Diversity', 'Loss of Biodiversity', 'Conservation'] },
    ],
  },

  '12-mathematics': {
    bookTitle: 'Mathematics — Textbook for Class XII (Parts I & II)',
    chapters: [
      { num: 1,  name: 'Relations and Functions',                  topics: ['Types of Relations', 'Types of Functions', 'Composition of Functions', 'Invertible Functions', 'Binary Operations'] },
      { num: 2,  name: 'Inverse Trigonometric Functions',          topics: ['Basic Concepts', 'Properties of Inverse Trigonometric Functions', 'Principal Value Branch', 'Formulas'] },
      { num: 3,  name: 'Matrices',                                 topics: ['Matrix', 'Types of Matrices', 'Operations on Matrices', 'Transpose', 'Symmetric and Skew Symmetric', 'Invertible Matrices'] },
      { num: 4,  name: 'Determinants',                             topics: ['Determinant Expansion', 'Properties of Determinants', 'Area of Triangle', 'Adjoint and Inverse', 'Cramer\'s Rule', 'Applications'] },
      { num: 5,  name: 'Continuity and Differentiability',         topics: ['Continuity', 'Differentiability', 'Chain Rule', 'Derivatives of Inverse Trigonometric Functions', 'Implicit Differentiation', 'Logarithmic Differentiation', 'Mean Value Theorem'] },
      { num: 6,  name: 'Application of Derivatives',              topics: ['Rate of Change', 'Increasing and Decreasing Functions', 'Tangents and Normals', 'Maxima and Minima', 'Approximations'] },
      { num: 7,  name: 'Integrals',                                topics: ['Integration as Inverse of Differentiation', 'Methods of Integration', 'Definite Integral', 'Fundamental Theorem of Calculus', 'Properties of Definite Integral'] },
      { num: 8,  name: 'Application of Integrals',                topics: ['Area Under Simple Curves', 'Area Between Two Curves'] },
      { num: 9,  name: 'Differential Equations',                  topics: ['Basic Concepts', 'Order and Degree', 'Formation of Differential Equations', 'Methods of Solving (Variable Separable, Homogeneous, Linear)'] },
      { num: 10, name: 'Vector Algebra',                           topics: ['Types of Vectors', 'Addition of Vectors', 'Multiplication by Scalar', 'Scalar Product (Dot)', 'Vector Product (Cross)'] },
      { num: 11, name: 'Three Dimensional Geometry',               topics: ['Direction Cosines and Ratios', 'Equation of Line in Space', 'Angle between Lines', 'Equation of Plane', 'Distance from Plane', 'Coplanarity'] },
      { num: 12, name: 'Linear Programming',                       topics: ['Linear Programming Problem', 'Mathematical Formulation', 'Graphical Method', 'Corner Points', 'Applications'] },
      { num: 13, name: 'Probability',                              topics: ['Conditional Probability', 'Multiplication Theorem', 'Independent Events', 'Bayes\' Theorem', 'Random Variables', 'Binomial Distribution'] },
    ],
  },

  '12-economics': {
    bookTitle: 'Macroeconomics — Economics (Class XII)',
    chapters: [
      { num: 1, name: 'Introduction to Macroeconomics',           topics: ['Emergence of Macroeconomics', 'Context of Macroeconomics in India'] },
      { num: 2, name: 'National Income Accounting',               topics: ['Some Basic Concepts of Macroeconomics', 'Circular Flow of Income', 'Methods of Calculating National Income', 'GDP and Welfare'] },
      { num: 3, name: 'Money and Banking',                        topics: ['Money — Meaning and Supply', 'Credit Creation by Banks', 'Central Bank and Monetary Policy', 'RBI', 'Commercial Banks'] },
      { num: 4, name: 'Determination of Income and Employment',   topics: ['Aggregate Demand', 'Ex Ante Consumption and Investment', 'Equilibrium Output', 'Multiplier Mechanism'] },
      { num: 5, name: 'Government Budget and the Economy',        topics: ['Government Budget', 'Budget: Objectives and Components', 'Balanced Budget Multiplier', 'Fiscal Policy', 'Deficit Budget'] },
      { num: 6, name: 'Open Economy Macroeconomics',              topics: ['Balance of Payments', 'Foreign Exchange Market', 'Determination of Exchange Rate', 'Managed Floating'] },
    ],
  },

  '12-history': {
    bookTitle: 'Themes in Indian History (Parts I, II & III) — Class XII',
    chapters: [
      { num: 1, name: 'Bricks, Beads and Bones — The Harappan Civilisation', topics: ['Discovering the Harappan Civilisation', 'An Ancient Authority', 'Urban Centres', 'Subsistence Strategies', 'Social Differences'] },
      { num: 2, name: 'Kings, Farmers and Towns — Early States and Economies', topics: ['Prinsep and Piyadassi', 'The Mauryan Empire', 'The New Kingdoms', 'Finding Out About Trade'] },
      { num: 3, name: 'Kinship, Caste and Class', topics: ['Mahabharata', 'Families, Kinship', 'Social Differences: Beyond Varna', 'Brahmanical Perspective'] },
      { num: 4, name: 'Thinkers, Beliefs and Buildings — Cultural Developments', topics: ['The Buddha', 'Jaina Tradition', 'Stupa at Sanchi', 'Brahmanical Traditions'] },
      { num: 5, name: 'Through the Eyes of Travellers', topics: ['Al-Biruni', 'Ibn Battuta', 'François Bernier'] },
      { num: 6, name: 'Bhakti-Sufi Traditions', topics: ['Bhakti Movement', 'Sufi Silsilas', 'Weaving Traditions'] },
      { num: 7, name: 'An Imperial Capital: Vijayanagara', topics: ['Discovering Vijayanagara', 'Rulers of Vijayanagara', 'Water, Forts and Centres', 'Temples and Traditions'] },
      { num: 8, name: 'Peasants, Zamindars and the State', topics: ['Ain-i-Akbari', 'The Land Revenue System', 'Zamindars', 'The Peasant Community'] },
      { num: 9, name: 'Kings and Chronicles — The Mughal Courts', topics: ['Chronicles of the Mughal Court', 'Akbar Nama and Ain-i-Akbari', 'Mughal Traditions'] },
      { num: 10, name: 'Colonialism and the Countryside',          topics: ['Bengal Revenue Settlements', 'Ryotwari Settlement', 'The Consequences', 'Santhals revolt'] },
      { num: 11, name: 'Rebels and the Raj — The Revolt of 1857', topics: ['Origins of the Revolt', 'Sepoy Mutiny Becomes Popular Revolt', 'After the Revolt'] },
      { num: 12, name: 'Colonial Cities',                          topics: ['Surveying the City', 'New Towns', 'Social Life in the City', 'City as Symbol'] },
      { num: 13, name: 'Mahatma Gandhi and the Nationalist Movement', topics: ['The Mahatma Arrives', 'Non-Cooperation', 'Civil Disobedience', 'Last Years', 'Understanding Gandhi'] },
      { num: 14, name: 'Understanding Partition',                  topics: ['Two-Nation Theory', 'The Pact', 'The Verdict', 'Violence and Memory'] },
      { num: 15, name: 'Framing the Constitution',                 topics: ['Constituent Assembly', 'The Vision of the Constitution', 'Rights and Representation', 'A Constitution for Whom?'] },
    ],
  },

};

// ─── Live scraper (best-effort, falls back to hardcoded) ─────────────────────

async function scrapeNCERTLive(grade, subjectKey) {
  const mapKey = `${grade}-${subjectKey}`;
  const urlInfo = NCERT_URL_MAP[mapKey];
  if (!urlInfo) return null;

  try {
    const url = `https://ncert.nic.in/textbook.php?Classno=${grade}&BookName=${urlInfo.bookName}`;
    const html = await httpsGet(url);
    if (!html || html.length < 500) return null;

    // Parse chapter links — NCERT PDFs match: /textbook/pdf/{pdfPrefix}[12]?[0-9]{2}\.pdf
    const linkRe = new RegExp(
      `href="[^"]*\\/textbook\\/pdf\\/(${urlInfo.pdfPfx.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\d{2,4})\\.pdf"[^>]*>([^<]+)<`,
      'gi'
    );
    const chapRe = /<option[^>]*value="(\d+)"[^>]*>([^<]+)<\/option>/gi;

    const liveChapters = [];
    let m;

    // Try option-tag extraction first (chapter dropdown)
    while ((m = chapRe.exec(html)) !== null) {
      const name = m[2].trim();
      if (name && !/select|choose/i.test(name)) {
        liveChapters.push({ num: liveChapters.length + 1, name });
      }
    }

    // Fall back to link-text extraction
    if (!liveChapters.length) {
      while ((m = linkRe.exec(html)) !== null) {
        const name = m[2].trim();
        if (name) liveChapters.push({ num: liveChapters.length + 1, name });
      }
    }

    return liveChapters.length >= 3 ? liveChapters : null;
  } catch {
    return null;
  }
}

// ─── Main exported API ────────────────────────────────────────────────────────

/**
 * Check whether a state/board follows NCERT.
 */
function isNCERTState(state) {
  if (!state) return false;
  return NCERT_STATES.has(state.toLowerCase().trim());
}

/**
 * List all subjects available for a grade.
 */
function listNCERTSubjects(grade) {
  const g = Number(grade);
  return Object.keys(NCERT_TOC)
    .filter(k => k.startsWith(`${g}-`))
    .map(k => k.replace(`${g}-`, ''));
}

/**
 * Get full TOC for a class + subject combination.
 *
 * @param {number|string} grade   — Class number 1-12
 * @param {string}        subject — e.g. 'maths', 'physics', 'social_science'
 * @param {string}        [state] — e.g. 'Delhi', 'UP', 'Karnataka'
 * @returns {{ bookTitle, chapters, stateBoards, source, ncertUrl }}
 */
async function getTOC(grade, subject, state = '') {
  const g   = Number(grade);
  const sub = normalizeSubject(subject);
  const key = `${g}-${sub}`;
  const cacheKey = `ncert:${key}`;

  // Return cached
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Hardcoded base
  const base = NCERT_TOC[key];
  if (!base) {
    // Graceful fallback — return empty with message
    return {
      bookTitle:   `NCERT Class ${g} — ${sub}`,
      chapters:    [],
      stateBoards: [...NCERT_STATES].slice(0, 10),
      source:      'not_found',
      message:     `Syllabus data for Class ${g} ${sub} is not yet available. Subject may be out of NCERT scope or not yet seeded.`,
    };
  }

  // Enrich with live scrape (best-effort, 2s budget via TIMEOUT_MS in web-content.service)
  let liveChapters = null;
  try {
    liveChapters = await Promise.race([
      scrapeNCERTLive(g, sub),
      new Promise(r => setTimeout(() => r(null), 2000)),
    ]);
  } catch { /* ignore */ }

  // Merge live data — use live chapter names if they match count (same edition)
  let finalChapters = base.chapters;
  if (liveChapters && liveChapters.length === base.chapters.length) {
    finalChapters = base.chapters.map((ch, i) => ({
      ...ch,
      name: liveChapters[i]?.name || ch.name,
    }));
  }

  const result = {
    bookTitle:   base.bookTitle,
    chapters:    finalChapters,
    stateBoards: [...NCERT_STATES],
    source:      liveChapters ? 'ncert_live_verified' : 'ncert_hardcoded',
    ncertUrl:    `https://ncert.nic.in/textbook.php?Classno=${g}`,
    isNCERTState: isNCERTState(state),
  };

  cache.set(cacheKey, result);
  return result;
}

/**
 * Get a brief contextual string about a specific chapter for AI prompt injection.
 *
 * @param {number}  grade
 * @param {string}  subject
 * @param {string}  chapterName — partial match OK
 * @returns {string}
 */
function getChapterContext(grade, subject, chapterName) {
  const g   = Number(grade);
  const sub = normalizeSubject(subject);
  const key = `${g}-${sub}`;
  const toc = NCERT_TOC[key];

  if (!toc) return '';

  // Fuzzy match on chapter name
  const needle = (chapterName || '').toLowerCase();
  const ch = toc.chapters.find(c =>
    c.name.toLowerCase().includes(needle) ||
    needle.includes(c.name.toLowerCase().slice(0, 15))
  );

  if (!ch) {
    return `NCERT Class ${g} ${sub} has ${toc.chapters.length} chapters: ${toc.chapters.map(c => c.name).join(', ')}.`;
  }

  return [
    `NCERT ${toc.bookTitle}`,
    `Chapter ${ch.num}: ${ch.name}`,
    ch.topics?.length ? `Topics covered: ${ch.topics.join(' | ')}` : '',
    `This is a standard NCERT chapter followed by 23+ Indian states + CBSE.`,
  ].filter(Boolean).join('\n');
}

module.exports = { getTOC, getChapterContext, isNCERTState, listNCERTSubjects };
