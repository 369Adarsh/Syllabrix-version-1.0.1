require('dotenv').config({ path: '../.env' });
const { generateSchoolBoardSyllabus } = require('../src/services/ai-syllabus-generator.service');
const { pool } = require('../src/config/database');

const ncertReferenceText = `
Here is the complete detailed topic and subtopic breakdown for Classes 6, 7, and 8 NCERT (2025-26) — perfect for your Syllabrix RAG database structure.

📘 CLASS 6 — Detailed Topics & Subtopics
Mathematics (Ganit Prakash)
Ch 1 — Patterns in Mathematics
Number sequences (even, odd, squares, cubes, triangular)
Shape patterns and tiling
Repeating patterns in nature
Ch 2 — Lines and Angles
Point, line, line segment, ray
Types of angles: acute, obtuse, right, straight, reflex
Measuring angles using protractor
Complementary and supplementary angles
Ch 3 — Number Play
Interesting properties of numbers
Divisibility rules (2,3,5,9,10)
Games and puzzles with numbers
Ch 4 — Data Handling & Presentation
Tally marks, frequency tables
Pictographs and bar graphs
Reading and interpreting data
Ch 5 — Prime Time
Factors and multiples
Prime and composite numbers
HCF and LCM
Prime factorisation (factor tree)
Ch 6 — Perimeter and Area
Perimeter of rectangle, square, triangle
Area of rectangle and square
Units of measurement (cm², m²)
Ch 7 — Fractions
Fraction as part of whole
Types: proper, improper, mixed
Equivalent fractions
Comparison, addition, subtraction of fractions
Ch 8 — Playing with Constructions
Drawing line segments
Drawing angles using compass and ruler
Constructing circles
Constructing perpendicular bisectors
Ch 9 — Symmetry
Lines of symmetry
Reflection and mirror image
Symmetry in nature and art
Ch 10 — The Other Side of Zero
Introduction to negative numbers
Number line (positive and negative)
Integers — meaning and ordering
Addition and subtraction of integers

Science (Curiosity)
Ch 1 — The Wonderful World of Science
What is science; scientific curiosity
Scientific method — observation, hypothesis, experiment, conclusion
Science in everyday life
Ch 2 — Diversity in the Living World
Characteristics of living things
Classification: plants and animals
Local biodiversity observation activities
Ch 3 — Mindful Eating: A Path to Healthy Body
Macronutrients: carbohydrates, proteins, fats
Micronutrients: vitamins and minerals
Balanced diet and food groups
Deficiency diseases
Ch 4 — Exploring Magnets
Magnetic and non-magnetic materials
Poles of a magnet (N and S)
Attraction/repulsion between poles
Uses of magnets in daily life
Ch 5 — Measurement of Length and Motion
SI units of measurement
Measuring length using ruler/scale
Types of motion: linear, circular, periodic
Speed concept (introduction)
Ch 6 — Materials Around Us
States of matter: solid, liquid, gas
Properties: hardness, transparency, solubility
Changes: reversible and irreversible
Ch 7 — Temperature and Its Measurement
What is temperature
Types of thermometers
Celsius and Fahrenheit scales
Normal body temperature
Ch 8 — A Journey through States of Water
Water cycle: evaporation, condensation, precipitation
States of water: ice, water, steam
Importance of water conservation
Ch 9 — Methods of Separation in Everyday Life
Handpicking, winnowing, sieving
Filtration, evaporation, magnetic separation
Real-life applications of each method
Ch 10 — Living Creatures: Exploring their Characteristics
Cell as basic unit of life (introduction)
Life processes: nutrition, respiration, excretion, reproduction
Habitat and adaptation (brief)
Ch 11 — Nature's Treasures
Natural resources: soil, water, air, forests, minerals
Renewable vs non-renewable resources
Conservation and sustainability
Ch 12 — Beyond Earth (New)
Solar system: planets, sun, moon
Earth's place in the solar system
Day, night and seasons (introduction)

Social Science (Exploring Society)
Theme A — Geography
Ch 1 — The Earth and Its Wonders
Shape of earth; globe and maps
Rotation and revolution
Day, night, seasons
Ch 2 — Landforms and Their Evolution
Mountains, plateaus, plains, valleys, deserts
Formation of landforms
India's major landforms
Ch 3 — India: A Land of Diversity
Physical features of India
Climate zones
Rivers and drainage
Ch 4 — Maps and Navigation
Types of maps (political, physical, thematic)
Scale, directions, symbols
Latitude and longitude (introduction)
Theme B — History
Ch 5 — The Story of the Earliest People
Prehistoric life; hunter-gatherers
Stone age tools
Cave paintings; Bhimbetka
Ch 6 — The Beginnings of Indian Civilisation
Indus Valley Civilisation: Harappa, Mohenjo-daro
Town planning, drainage system
Trade and crafts
Ch 7 — In the Earliest Cities
Urban life in ancient India
Occupations and trade routes
Ch 8 — What Books and Burials Tell Us
Vedic period introduction
Rigveda (brief overview)
Burial practices and their meaning
Ch 9 — Kings, Kingdoms and the Early Republic
Janapadas and Mahajanapadas
Early democratic traditions: Vajji republic
Rise of Magadha
Theme C — Economics & Environment
Ch 10 — Natural Resources and Their Management
Soil types; water bodies; forest types
Over-exploitation and solutions
Ch 11 — Communities and Livelihoods
Rural vs urban occupations
Farming, crafts, services, industries
Ch 12 — Markets and Trade
Local haats and bazaars
National and global trade (introduction)
Theme D — Civics
Ch 13 — Village and Urban Local Governments
Gram Panchayat — structure, elections, functions
Municipal corporation — wards, councillors
Role of citizens
Ch 14 — Our Constitution and Rights
What is a constitution
Fundamental rights (7 categories)
Fundamental duties
Principle of equality

English (Poorvi)
Unit 1 — Fables and Folk Tales
Topics: Moral values, storytelling traditions, Indian folklore
Unit 2 — Friendship
Topics: Empathy, bonds, loyalty, trust; narrative writing
Unit 3 — Nurturing Nature
Topics: Environment, medicinal plants, nature writing
Unit 4 — Sports and Wellness
Topics: Yoga, sportsmanship, healthy lifestyle; persuasive writing
Unit 5 — India: Unity in Diversity
Topics: Regional cultures, festivals, unity; descriptive writing
Grammar Topics Across Units: Nouns, pronouns, adjectives, verbs, tenses (present/past/future), punctuation, article usage, prepositions, comprehension skills


📗 CLASS 7 — Detailed Topics & Subtopics
Science (Curiosity)
Ch 1 — The Ever-Evolving World of Science
Happy Exploring; how science evolves
Scientific discoveries and scientists
Ch 2 — Exploring Substances: Acidic, Basic, Neutral
Litmus as indicator; red rose as indicator; turmeric test
Neutralisation in daily life
Acid + base → salt + water reactions
Ch 3 — Electricity: Circuits and Their Components
Torchlight; simple electrical circuit
Electric cell, battery, lamp
Circuit diagrams; conductors and insulators
Electric switch and its role
Ch 4 — The World of Metals and Non-Metals
Properties: malleability, ductility, sonority, conductivity
Effect of air and water on iron (rusting)
Metals vs non-metals comparison
Essential non-metals in everyday life
Ch 5 — Changes Around Us: Physical and Chemical
Physical vs chemical changes
Rusting and combustion (chemical)
Weathering and erosion (slow natural changes)
Reversible and irreversible changes
Ch 6 — Adolescence: A Stage of Growth and Change
Teenage years: puberty changes
Reproductive capability signs
Emotional and behavioural changes
Nutrition, personal hygiene, physical activity
Avoiding harmful substances
Ch 7 — Heat Transfer in Nature
Conduction of heat
Convection; land and sea breeze
Radiation; water cycle
Seepage of water beneath Earth
Ch 8 — Measurement of Time and Motion
Measuring time; simple pendulum; SI unit
Speed: definition, formula, units
Uniform and non-uniform linear motion
Ch 9 — Life Processes in Animals
Nutrition: human digestive system
Digestion in other animals
Respiration in humans and other animals
Ch 10 — Life Processes in Plants
How plants grow; leaves as food factories
Photosynthesis: role of air, light, water
Transport of water and minerals; food in plants
Respiration in plants
Ch 11 — Light: Shadows and Reflections
Sources of light; straight-line travel
Transparent, translucent, opaque materials
Shadow formation
Laws of reflection; images in plane mirror
Pinhole camera; periscope; kaleidoscope
Ch 12 — Earth, Moon, and the Sun
Rotation and revolution of Earth
Changing night sky; seasons
Solar eclipse; lunar eclipse

Mathematics (Ganita Prakash)
Ch 1 — Large Numbers Around Us
Reading and writing large numbers (lakhs, crores)
Indian vs International number system
Exact and approximate values; rounding
Ch 2 — Arithmetic Expressions
Simple and complex expressions
BODMAS rule; brackets
Terms in expressions; swapping and grouping
Ch 3 — A Peek Beyond the Point
Tenths, hundredths, thousandths
Decimal place value system
Addition, subtraction, multiplication of decimals
Units of measurement using decimals
Ch 4 — Expressions Using Letter-Numbers
Introduction to algebra; letter-numbers
Algebraic expressions; omission of multiplication symbol
Simplification; formula detective
Patterns in calendar; matchstick patterns
Ch 5 — Parallel and Intersecting Lines
Perpendicular and parallel lines
Transversal; corresponding angles
Alternate angles; consecutive angles
Paper folding for constructions
Ch 6 — Number Play
Parity (odd/even); number explorations
Magic squares (3×3 and 4×4)
Virahanka-Fibonacci numbers
Ch 7 — A Tale of Three Intersecting Lines
Types of triangles; equilateral triangles
Constructing triangles (given sides and angles)
Triangle inequality; angle sum property
Exterior angles property; altitudes
Ch 8 — Working with Fractions
Multiplication of fractions; area connection
Simplifying to lowest form
Division of fractions; word problems

Social Science (Exploring Society)
Theme A — Geography
Ch 1 — Geographical Diversity of India
Himalayas; cold deserts; Gangetic plains; Thar desert
Aravalli hills; peninsular plateau
India's coastlines; islands; Sundarbans; NE hills
Ch 2 — Understanding the Weather
Weather elements; instruments; weather stations
Predicting the weather; weather maps
Ch 3 — Climate of India
Weather vs climate; seasons
Types of climates in India
Monsoons; climate change; climate disasters
Theme B — History
Ch 4 — New Beginnings: Cities and States
Janapadas and Mahajanapadas
Early democratic traditions
Varna-Jati system
Ch 5 — The Rise of Empires
Rise of Magadha; arrival of Greeks
Maurya Empire; Ashoka and peace
Life in Mauryan period
Ch 6 — The Age of Reorganisation
Shungas; Satavahanas; Chedis
Kingdoms in South India
Kushanas; Indo-Greeks
Ch 7 — The Gupta Era
Rise of Guptas; Classical Age
Science, art, literature in Gupta period
Decline of Guptas
Theme C — Cultural Heritage
Ch 8 — How the Land Becomes Sacred
Sacred geography; pilgrimages
Sacred ecology; mountains, forests, trees
Sacred groves; sacred traditions beyond India
Theme D — Governance & Democracy
Ch 9 — From the Rulers to the Ruled
What is government; functions
Types of government; democracy
Democratic governments worldwide
Ch 10 — The Constitution of India
What is a constitution; India's constitution
Preamble; fundamental rights
Constitution as a living document
Theme E — Economics
Ch 11 — From Barter to Money
Barter system; why money was needed
Functions of money; history of money
Ch 12 — Understanding Markets
What is a market; types
Wholesale and retail markets
Government's role in markets

English (Poorvi)
Unit 1: Learning Together (Texts: The Day the River Spoke; Try Again; Three Days to See) - Grammar: Tenses, comprehension
Unit 2: Wit and Humour (Texts: Animals, Birds & Dr Dolittle; A Funny Man) - Grammar: Reported speech, paragraphs
Unit 3: Dreams and Discoveries (Texts: My Brother's Great Invention; Paper Boats) - Grammar: Letter writing, descriptive
Unit 4: Travel and Adventure (Texts: The Tunnel; Conquering the Summit) - Grammar: Narrative writing, adjectives
Unit 5: Bravehearts (Texts: A Homage to Our Brave Soldiers; Rani Abbakka) - Grammar: Biography writing, adverbs


📕 CLASS 8 — Detailed Topics & Subtopics
Science (Curiosity)
Ch 1 — Exploring the Investigative World of Science
Scientific inquiry; hypothesis; experiments
Scientific tools; lab safety
Ch 2 — The Invisible Living World: Beyond Our Naked Eye
Microorganisms: bacteria, virus, fungi, protozoa
Useful and harmful microorganisms
Antibiotics and vaccines
Ch 3 — Health: The Ultimate Treasure
Diseases: communicable and non-communicable
Immune system; personal hygiene
Mental health awareness
Ch 4 — Electricity: Magnetic and Heating Effects
Magnetic effect: electromagnets; electric bell; motor
Heating effect: electric iron, fuse, filament bulb
Safety in electrical appliances
Ch 5 — Exploring Forces
Types of forces: contact, non-contact
Friction: static, kinetic, rolling
Gravitational force and weight
Ch 6 — Pressure, Winds, Storms, and Cyclones
Pressure in fluids; atmospheric pressure
High and low pressure areas
Cyclones: formation, effects, safety measures
Ch 7 — Particulate Nature of Matter
Matter made of particles; evidence
Particle size, movement, spacing in solids/liquids/gases
Diffusion; Brownian motion
Ch 8 — Nature of Matter: Elements, Compounds, Mixtures
Elements (metals, non-metals, metalloids)
Compounds vs mixtures
Chemical symbols; formulae (basic)
Ch 9 — The Amazing World of Solutes, Solvents, and Solutions
Solution, solute, solvent
Concentration; saturated and unsaturated solutions
Solubility; factors affecting solubility
Ch 10 — Light: Mirrors and Lenses
Reflection: laws, plane mirror, spherical mirrors
Mirror formula (introduction)
Refraction; lenses: convex and concave
Power of lens; real vs virtual images
Ch 11 — Keeping Time with the Skies
Historical timekeeping; sundials
Earth's rotation → day/night; revolution → year
Calendars; time zones; IST
Ch 12 — How Nature Works in Harmony
Ecosystems: biotic and abiotic components
Food chains and food webs
Nutrient cycles: carbon and nitrogen cycle
Ch 13 — Our Home: Earth, a Unique Life-Sustaining Planet
Earth's layers; atmosphere layers
Greenhouse effect; global warming
Ozone layer; climate change
Conservation of environment

Mathematics (Ganita Prakash)
Ch 1 — A Square and a Cube
Squares and square roots
Cubes and cube roots
Finding using prime factorisation; estimation methods
Ch 2 — Power Play
Exponents and powers
Laws of exponents
Very large and small numbers using powers of 10
Ch 3 — A Story of Numbers
Rational numbers; number line
Operations on rational numbers
Properties: closure, commutative, associative, distributive
Ch 4 — Quadrilaterals
Types of quadrilaterals
Properties: parallelogram, rectangle, rhombus, square, trapezium
Angle sum of quadrilateral
Ch 5 — Number Play
Divisibility; factors; HCF and LCM revisited
Algebraic factorisation basics
Number theory games
Ch 6 — We Distribute, Yet Things Multiply
Distributive property
Algebraic identities: (a+b)², (a-b)², (a+b)(a-b)
Factorisation using identities
Ch 7 — Proportional Reasoning-I
Direct and inverse proportion
Ratio and proportion applications
Percentage, profit, loss, discount, simple interest

Social Science (Exploring Society)
Theme A — Geography
Ch 1 — Natural Resources and Their Use
Renewable and non-renewable resources
Land, soil, water, forest, mineral resources
Conservation strategies
Theme B — History
Ch 2 — Reshaping India's Political Map
Post-1757 India; British expansion
Major battles; annexation policies
Reorganisation of Indian states
Ch 3 — The Rise of the Marathas
Shivaji and Maratha Kingdom
Maratha confederacy; Peshwas
Battles; decline of Marathas
Ch 4 — The Colonial Era in India
East India Company; Plassey and Buxar
Colonial administration; land revenue
Economic impact of British rule
Theme D — Governance & Democracy
Ch 5 — Universal Franchise and India's Electoral System
Universal adult franchise; voting rights
Election process; EVM; Model Code of Conduct
Role of Election Commission
Ch 6 — The Parliamentary System
Legislature: Lok Sabha and Rajya Sabha
Executive: President, PM, Cabinet
Law-making process; checks and balances
Theme E — Economics
Ch 7 — Factors of Production
Land, labour, capital, enterprise
Role of each factor in production
Interdependence in economic activity

English (Poorvi)
Unit 1: Wit and Wisdom | Texts: The Wit that Won Hearts; A Concrete Example | Grammar: Direct/indirect speech
Unit 2: Values & Dispositions | Texts: Major Somnath Sharma; Verghese Kurien | Grammar: Active/passive voice
Unit 3: Mystery and Magic | Texts: The Case of the Fifth Word; Magic Brush | Grammar: Clauses; complex sentences
Unit 4: Environment | Texts: The Cherry Tree; Harvest Hymn | Grammar: Formal letter writing
Unit 5: Science & Curiosity | Texts: Bibha Choudhuri; Feathered Friend | Grammar: Report writing; science vocabulary

Hindi (Malhar)
Ch 1: स्वदेश (Poem) - Gayaprasad Shukla 'Snehi'
Ch 2: दो गौरैयाँ (Story) - Bhisham Sahni
Ch 3: एक आशीर्वाद (Poem) - Dushyant Kumar
Ch 4: हरिद्वार (Letter) - Bhartendu Harishchandra
Ch 5: कबीर के दोहे (Dohe) - Kabir
Ch 6: एक टोकरी भर मिट्टी (Story) - Madhavrao Sapre
Ch 7: मात बंधु (Poem) - Mahadevi Varma
Ch 8: नए मेहमान (Play) - Udayshankar Bhatt
Ch 9: आदमी का अनपढ़ (Poem) - Nagarjuna
Ch 10: तरुण के स्वप्न (Speech) - Subhash Chandra Bose
`;

async function run() {
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  SYLLABRIX AI SEEDER: NCERT 2025-26 MIDDLE SCHOOL  ');
  console.log('─────────────────────────────────────────────────────────────────\n');

  try {
    console.log('=== SEEDING CBSE CLASSES 6, 7, 8 WITH STRICT RAG REFERENCE ===');
    console.log('Generating Syllabus for CBSE (Central Board of Secondary Education)...');
    
    // We pass the new referenceContext variable as the 4th argument.
    // The AI will extract exclusively from our giant text string above!
    await generateSchoolBoardSyllabus(
      'Central Board of Secondary Education', 
      'CBSE', 
      ['6', '7', '8'], 
      ncertReferenceText
    );
    
    console.log('\n=============================================');
    console.log('✓ Strict RAG syllabus mapping complete!');
    console.log('The AI successfully used your exact reference text for extraction.');
    console.log('=============================================');

  } catch (error) {
    console.error('\n✗ Seeder Error:', error);
  } finally {
    if (pool && pool.end) {
      pool.end();
    }
    process.exit(0);
  }
}

run();
