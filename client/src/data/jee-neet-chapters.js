// Complete chapter database for JEE & NEET
// Sources: NCERT 11 & 12, HC Verma Vol 1 & 2, RD Sharma, OP Tandon, Trueman's Biology

export const BOOKS = {
  jee: {
    physics:   ['ncert', 'hcverma'],
    chemistry: ['ncert', 'optandon'],
    maths:     ['ncert', 'rdsharma'],
  },
  neet: {
    physics:   ['ncert', 'hcverma'],
    chemistry: ['ncert', 'optandon'],
    biology:   ['ncert', 'trueman'],
  },
};

export const BOOK_META = {
  ncert:    { label: 'NCERT',          color: 'bg-blue-100 text-blue-700',    short: 'NCERT' },
  hcverma:  { label: 'HC Verma',       color: 'bg-rose-100 text-rose-700',    short: 'HCV' },
  rdsharma: { label: 'RD Sharma',      color: 'bg-violet-100 text-violet-700',short: 'RDS' },
  optandon: { label: 'OP Tandon',      color: 'bg-emerald-100 text-emerald-700', short: 'OPT' },
  trueman:  { label: "Trueman's Bio",  color: 'bg-amber-100 text-amber-700',  short: 'TRU' },
};

export const SUBJECT_META = {
  physics:   { icon: '⚛️',  color: 'from-blue-500 to-blue-600',    label: 'Physics'   },
  chemistry: { icon: '🧪',  color: 'from-emerald-500 to-teal-600', label: 'Chemistry' },
  maths:     { icon: '📐',  color: 'from-violet-500 to-purple-600',label: 'Maths'     },
  biology:   { icon: '🌿',  color: 'from-green-500 to-emerald-600',label: 'Biology'   },
};

// ─── PHYSICS ─────────────────────────────────────────────────────────────────

const PHYSICS_NCERT = {
  11: [
    { ch: 1,  name: 'Physical World',                              topics: ['Nature of physical laws', 'Fundamental forces', 'Scope of physics'] },
    { ch: 2,  name: 'Units and Measurements',                      topics: ['SI units', 'Dimensional analysis', 'Error analysis', 'Significant figures'] },
    { ch: 3,  name: 'Motion in a Straight Line',                   topics: ['Kinematics', 'Velocity', 'Acceleration', 'Equations of motion', 'Relative motion'] },
    { ch: 4,  name: 'Motion in a Plane',                           topics: ['Vectors', 'Projectile motion', 'Circular motion', 'Relative velocity in 2D'] },
    { ch: 5,  name: 'Laws of Motion',                              topics: ['Newton\'s laws', 'Friction', 'Circular dynamics', 'Pseudo force'] },
    { ch: 6,  name: 'Work, Energy and Power',                      topics: ['Work-energy theorem', 'Conservation of energy', 'Power', 'Collisions'] },
    { ch: 7,  name: 'System of Particles and Rotational Motion',   topics: ['Centre of mass', 'Angular momentum', 'Torque', 'MOI', 'Rolling motion'] },
    { ch: 8,  name: 'Gravitation',                                 topics: ['Kepler\'s laws', 'Gravitational potential', 'Satellites', 'Escape velocity'] },
    { ch: 9,  name: 'Mechanical Properties of Solids',             topics: ['Stress', 'Strain', 'Young\'s modulus', 'Bulk modulus', 'Shear modulus'] },
    { ch: 10, name: 'Mechanical Properties of Fluids',             topics: ['Pascal\'s law', 'Bernoulli\'s equation', 'Viscosity', 'Surface tension'] },
    { ch: 11, name: 'Thermal Properties of Matter',                topics: ['Specific heat', 'Calorimetry', 'Heat transfer', 'Thermal expansion'] },
    { ch: 12, name: 'Thermodynamics',                              topics: ['Laws of thermodynamics', 'Carnot engine', 'Entropy', 'Heat engines'] },
    { ch: 13, name: 'Kinetic Theory',                              topics: ['Ideal gas', 'Maxwell distribution', 'Mean free path', 'Degrees of freedom'] },
    { ch: 14, name: 'Oscillations',                                topics: ['SHM', 'Spring-mass system', 'Simple pendulum', 'Damped oscillations'] },
    { ch: 15, name: 'Waves',                                       topics: ['Wave equation', 'Standing waves', 'Superposition', 'Doppler effect'] },
  ],
  12: [
    { ch: 1,  name: 'Electric Charges and Fields',                 topics: ['Coulomb\'s law', 'Electric field', 'Gauss\'s law', 'Dipole'] },
    { ch: 2,  name: 'Electrostatic Potential and Capacitance',     topics: ['Potential', 'Capacitors', 'Dielectrics', 'Energy stored'] },
    { ch: 3,  name: 'Current Electricity',                         topics: ['Ohm\'s law', 'Kirchhoff\'s laws', 'Wheatstone bridge', 'Potentiometer'] },
    { ch: 4,  name: 'Moving Charges and Magnetism',                topics: ['Biot-Savart law', 'Ampere\'s law', 'Cyclotron', 'Force on current'] },
    { ch: 5,  name: 'Magnetism and Matter',                        topics: ['Bar magnet', 'Earth\'s magnetism', 'Dia/Para/Ferromagnetism'] },
    { ch: 6,  name: 'Electromagnetic Induction',                   topics: ['Faraday\'s laws', 'Lenz\'s law', 'Eddy currents', 'Self/Mutual inductance'] },
    { ch: 7,  name: 'Alternating Current',                         topics: ['RMS values', 'LCR circuit', 'Resonance', 'Power factor', 'Transformers'] },
    { ch: 8,  name: 'Electromagnetic Waves',                       topics: ['Displacement current', 'EM spectrum', 'Properties of EM waves'] },
    { ch: 9,  name: 'Ray Optics and Optical Instruments',          topics: ['Refraction', 'Lenses', 'Mirrors', 'Prism', 'Microscope', 'Telescope'] },
    { ch: 10, name: 'Wave Optics',                                 topics: ['Huygens principle', 'Interference', 'Diffraction', 'Polarization'] },
    { ch: 11, name: 'Dual Nature of Radiation and Matter',         topics: ['Photoelectric effect', 'de Broglie wavelength', 'Davisson-Germer'] },
    { ch: 12, name: 'Atoms',                                       topics: ['Bohr model', 'Hydrogen spectrum', 'Atomic spectra'] },
    { ch: 13, name: 'Nuclei',                                      topics: ['Nuclear binding energy', 'Radioactivity', 'Fission', 'Fusion'] },
    { ch: 14, name: 'Semiconductor Electronics',                   topics: ['p-n junction', 'Diodes', 'Transistors', 'Logic gates', 'Rectifiers'] },
  ],
};

const PHYSICS_HCVERMA = {
  1: [ // Vol 1 — Class 11 equivalent
    { ch: 1,  name: 'Introduction to Physics',                     topics: ['Physical quantities', 'Measurement', 'SI units'] },
    { ch: 2,  name: 'Physics and Mathematics',                     topics: ['Vectors', 'Calculus basics', 'Graphs'] },
    { ch: 3,  name: 'Rest and Motion: Kinematics',                 topics: ['Displacement', 'Velocity', 'Acceleration', 'Relative motion'] },
    { ch: 4,  name: 'The Forces',                                  topics: ['Gravitational', 'Electromagnetic', 'Nuclear forces', 'Weight'] },
    { ch: 5,  name: 'Newton\'s Laws of Motion',                    topics: ['Inertia', 'Impulse', 'Free body diagrams', 'Constraint motion'] },
    { ch: 6,  name: 'Friction',                                    topics: ['Static friction', 'Kinetic friction', 'Angle of repose', 'Rolling friction'] },
    { ch: 7,  name: 'Circular Motion',                             topics: ['Centripetal force', 'Conical pendulum', 'Banking of roads'] },
    { ch: 8,  name: 'Work and Energy',                             topics: ['Work done by variable force', 'Potential energy', 'Conservation'] },
    { ch: 9,  name: 'Centre of Mass, Linear Momentum, Collision',  topics: ['COM motion', 'Elastic/inelastic collision', 'Impulse'] },
    { ch: 10, name: 'Rotational Mechanics',                        topics: ['Torque', 'Angular momentum', 'Rolling', 'Gyroscope'] },
    { ch: 11, name: 'Gravitation',                                 topics: ['Universal gravitation', 'Orbital mechanics', 'Tides'] },
    { ch: 12, name: 'Simple Harmonic Motion',                      topics: ['Spring systems', 'Energy in SHM', 'Combinations of SHM'] },
    { ch: 13, name: 'Fluid Mechanics',                             topics: ['Archimedes\' principle', 'Flow continuity', 'Bernoulli'] },
    { ch: 14, name: 'Some Mechanical Properties of Matter',        topics: ['Elasticity', 'Surface energy', 'Viscosity', 'Stokes\' law'] },
    { ch: 15, name: 'Wave Motion and Waves on a String',           topics: ['Transverse waves', 'Standing waves', 'Resonance'] },
    { ch: 16, name: 'Sound Waves',                                 topics: ['Longitudinal waves', 'Beats', 'Doppler effect', 'Resonance tube'] },
    { ch: 17, name: 'Light Waves',                                 topics: ['Huygens\' principle', 'Coherent sources', 'Young\'s double slit'] },
    { ch: 18, name: 'Geometrical Optics',                          topics: ['Reflection', 'Refraction', 'Total internal reflection', 'Prism'] },
    { ch: 19, name: 'Optical Instruments',                         topics: ['Eye', 'Microscope', 'Telescope', 'Resolving power'] },
    { ch: 20, name: 'Dispersion and Spectra',                      topics: ['Dispersion by prism', 'Rainbow', 'Spectrometer'] },
    { ch: 22, name: 'Photometry',                                  topics: ['Luminous flux', 'Intensity', 'Illuminance'] },
  ],
  2: [ // Vol 2 — Class 12 equivalent
    { ch: 1,  name: 'Heat and Temperature',                        topics: ['Temperature scales', 'Thermal equilibrium', 'Expansion'] },
    { ch: 2,  name: 'Kinetic Theory of Gases',                     topics: ['Pressure of ideal gas', 'Mean speed', 'Equipartition'] },
    { ch: 3,  name: 'Calorimetry',                                 topics: ['Specific heat', 'Latent heat', 'Calorimeter'] },
    { ch: 4,  name: 'Laws of Thermodynamics',                      topics: ['First law', 'Second law', 'Heat engines', 'Carnot'] },
    { ch: 5,  name: 'Specific Heat Capacities of Gases',           topics: ['Cp and Cv', 'Ratio γ', 'Adiabatic process'] },
    { ch: 6,  name: 'Heat Transfer',                               topics: ['Conduction', 'Convection', 'Radiation', 'Newton\'s law of cooling'] },
    { ch: 7,  name: 'Electric Field and Potential',                topics: ['Electric field lines', 'Potential due to charges', 'Equipotential'] },
    { ch: 8,  name: 'Gauss\'s Law',                                topics: ['Electric flux', 'Applications of Gauss\'s law'] },
    { ch: 9,  name: 'Capacitors',                                  topics: ['Parallel plate capacitor', 'Series/parallel combination', 'Energy'] },
    { ch: 10, name: 'Electric Current in Conductors',              topics: ['Drift velocity', 'Resistivity', 'Temperature dependence'] },
    { ch: 11, name: 'Thermal and Chemical Effects of Current',     topics: ['Joule heating', 'Seebeck effect', 'Peltier effect', 'EMF'] },
    { ch: 12, name: 'Magnetic Field',                              topics: ['Lorentz force', 'Cyclotron motion', 'Hall effect'] },
    { ch: 13, name: 'Magnetic Field due to a Current',             topics: ['Biot-Savart', 'Ampere\'s circuital law', 'Solenoid', 'Toroid'] },
    { ch: 14, name: 'Permanent Magnets',                           topics: ['Magnetic dipole', 'Field of a bar magnet', 'Gauss\'s law for magnetism'] },
    { ch: 16, name: 'Electromagnetic Induction',                   topics: ['Faraday\'s law', 'Motional EMF', 'Eddy currents', 'AC generator'] },
    { ch: 17, name: 'Alternating Current',                         topics: ['Phasors', 'LC oscillations', 'Resonance', 'Power in AC'] },
    { ch: 20, name: 'Photoelectric Effect and Wave-Particle Duality', topics: ['Einstein equation', 'Work function', 'de Broglie', 'Matter waves'] },
    { ch: 21, name: 'Bohr\'s Model and Physics of the Atom',       topics: ['Bohr postulates', 'Energy levels', 'Hydrogen spectrum'] },
    { ch: 24, name: 'The Nucleus',                                 topics: ['Nuclear radius', 'Binding energy', 'Radioactive decay', 'Q-value'] },
    { ch: 23, name: 'Semiconductors and Semiconductor Devices',    topics: ['Band theory', 'p-n junction', 'Zener diode', 'Transistor'] },
  ],
};

// ─── CHEMISTRY ───────────────────────────────────────────────────────────────

const CHEMISTRY_NCERT = {
  11: [
    { ch: 1,  name: 'Some Basic Concepts of Chemistry',            topics: ['Mole concept', 'Stoichiometry', 'Empirical formula', 'Concentration'] },
    { ch: 2,  name: 'Structure of Atom',                           topics: ['Bohr model', 'Quantum numbers', 'Orbitals', 'Electronic configuration'] },
    { ch: 3,  name: 'Classification of Elements and Periodicity',  topics: ['Periodic table', 'Trends', 'Ionization energy', 'Electron affinity'] },
    { ch: 4,  name: 'Chemical Bonding and Molecular Structure',    topics: ['Ionic bond', 'Covalent bond', 'VSEPR', 'MOT', 'Hybridization'] },
    { ch: 5,  name: 'States of Matter: Gases and Liquids',         topics: ['Gas laws', 'Real gases', 'Liquid state', 'Vapour pressure'] },
    { ch: 6,  name: 'Thermodynamics',                              topics: ['Enthalpy', 'Hess\'s law', 'Entropy', 'Gibbs energy'] },
    { ch: 7,  name: 'Equilibrium',                                 topics: ['Le Chatelier\'s principle', 'Ka, Kb, Kc, Kp', 'Buffer solution', 'Solubility product'] },
    { ch: 8,  name: 'Redox Reactions',                             topics: ['Oxidation state', 'Balancing redox', 'Electrochemical series'] },
    { ch: 9,  name: 'Hydrogen',                                    topics: ['Properties of H2', 'Water', 'H2O2', 'Hydrides'] },
    { ch: 10, name: 'The s-Block Elements',                        topics: ['Alkali metals', 'Alkaline earth metals', 'Compounds of Na, Ca, Mg'] },
    { ch: 11, name: 'The p-Block Elements (Group 13-14)',          topics: ['Boron family', 'Carbon family', 'Allotropes of carbon'] },
    { ch: 12, name: 'Organic Chemistry: Basic Principles',         topics: ['IUPAC nomenclature', 'Isomerism', 'Reaction mechanisms', 'Inductive effect'] },
    { ch: 13, name: 'Hydrocarbons',                                topics: ['Alkanes', 'Alkenes', 'Alkynes', 'Benzene', 'Arenes'] },
    { ch: 14, name: 'Environmental Chemistry',                     topics: ['Air pollution', 'Water pollution', 'Greenhouse effect', 'Ozone'] },
  ],
  12: [
    { ch: 1,  name: 'The Solid State',                             topics: ['Crystal systems', 'Unit cell', 'Packing efficiency', 'Defects'] },
    { ch: 2,  name: 'Solutions',                                   topics: ['Raoult\'s law', 'Colligative properties', 'Osmosis', 'Molarity/Molality'] },
    { ch: 3,  name: 'Electrochemistry',                            topics: ['Galvanic cell', 'Nernst equation', 'Electrolysis', 'Kohlrausch law'] },
    { ch: 4,  name: 'Chemical Kinetics',                           topics: ['Rate law', 'Order of reaction', 'Arrhenius equation', 'Half-life'] },
    { ch: 5,  name: 'Surface Chemistry',                           topics: ['Adsorption', 'Catalysis', 'Colloids', 'Emulsions'] },
    { ch: 6,  name: 'General Principles of Isolation of Elements', topics: ['Metallurgy', 'Roasting', 'Smelting', 'Refining'] },
    { ch: 7,  name: 'The p-Block Elements (Group 15-18)',          topics: ['Nitrogen', 'Phosphorus', 'Oxygen', 'Sulphur', 'Halogens', 'Noble gases'] },
    { ch: 8,  name: 'The d- and f-Block Elements',                 topics: ['Transition metals', 'Oxidation states', 'Magnetic properties', 'Lanthanides'] },
    { ch: 9,  name: 'Coordination Compounds',                      topics: ['Werner\'s theory', 'IUPAC naming', 'Isomerism', 'VBT', 'CFT'] },
    { ch: 10, name: 'Haloalkanes and Haloarenes',                  topics: ['Nucleophilic substitution', 'SN1/SN2', 'Elimination', 'Aryl halides'] },
    { ch: 11, name: 'Alcohols, Phenols and Ethers',                topics: ['Preparation', 'Lucas test', 'Phenol reactions', 'Williamson synthesis'] },
    { ch: 12, name: 'Aldehydes, Ketones and Carboxylic Acids',     topics: ['Nucleophilic addition', 'Aldol condensation', 'Cannizzaro', 'Acidity'] },
    { ch: 13, name: 'Amines',                                      topics: ['Classification', 'Basicity', 'Diazotization', 'Coupling reaction'] },
    { ch: 14, name: 'Biomolecules',                                topics: ['Carbohydrates', 'Proteins', 'Enzymes', 'Nucleic acids', 'Vitamins'] },
    { ch: 15, name: 'Polymers',                                    topics: ['Addition polymer', 'Condensation polymer', 'Rubber', 'Fibres'] },
    { ch: 16, name: 'Chemistry in Everyday Life',                  topics: ['Drugs', 'Dyes', 'Detergents', 'Food additives', 'Cleaners'] },
  ],
};

const CHEMISTRY_OPTANDON = {
  11: [
    { ch: 1,  name: 'Atomic Structure',                            topics: ['Thomson model', 'Rutherford model', 'Quantum mechanics', 'Orbitals'] },
    { ch: 2,  name: 'Chemical Bonding',                            topics: ['Ionic bonding', 'Covalent bonding', 'Coordinate bonds', 'Resonance'] },
    { ch: 3,  name: 'States of Matter',                            topics: ['Gaseous state', 'Liquid state', 'Plasma', 'BEC'] },
    { ch: 4,  name: 'Stoichiometry and Redox',                     topics: ['Mole concept', 'Equivalent weight', 'Oxidation number method'] },
    { ch: 5,  name: 'Chemical Thermodynamics',                     topics: ['Bond enthalpy', 'Kirchhoff\'s law', 'Trouton\'s rule'] },
    { ch: 6,  name: 'Chemical Equilibrium',                        topics: ['Degree of dissociation', 'Kp vs Kc', 'Le Chatelier detailed'] },
    { ch: 7,  name: 'Ionic Equilibrium',                           topics: ['Strong/weak acids', 'Buffer calculations', 'Titration curves'] },
    { ch: 8,  name: 'The s and p Block (Inorganic)',               topics: ['Reactions and compounds', 'Anomalous behaviour', 'Industrial uses'] },
  ],
  12: [
    { ch: 1,  name: 'Solid State (Advanced)',                      topics: ['Close packing', 'Radius ratio', 'Interstitial sites', 'Point defects'] },
    { ch: 2,  name: 'Solutions (Advanced)',                        topics: ['Ideal vs non-ideal', 'Azeotropes', 'Henry\'s law', 'Electrolyte solutions'] },
    { ch: 3,  name: 'Electrochemistry (Advanced)',                 topics: ['Electrode potentials', 'Batteries', 'Corrosion', 'Faraday laws'] },
    { ch: 4,  name: 'Transition Elements (Advanced)',              topics: ['Complex formation', 'Colour', 'Catalytic properties'] },
    { ch: 5,  name: 'Coordination Chemistry',                      topics: ['Octahedral/tetrahedral complexes', 'Spectrochemical series', 'CFSE'] },
  ],
};

// ─── MATHEMATICS ─────────────────────────────────────────────────────────────

const MATHS_NCERT = {
  11: [
    { ch: 1,  name: 'Sets',                                        topics: ['Set operations', 'Venn diagrams', 'Laws of algebra of sets'] },
    { ch: 2,  name: 'Relations and Functions',                     topics: ['Cartesian product', 'Types of functions', 'Composition'] },
    { ch: 3,  name: 'Trigonometric Functions',                     topics: ['Radian measure', 'Identities', 'General solutions', 'Graphs'] },
    { ch: 4,  name: 'Principle of Mathematical Induction',         topics: ['Strong induction', 'Well ordering', 'Applications'] },
    { ch: 5,  name: 'Complex Numbers and Quadratic Equations',     topics: ['Argand plane', 'Modulus-argument', 'De Moivre\'s theorem'] },
    { ch: 6,  name: 'Linear Inequalities',                         topics: ['One/two variable inequalities', 'Linear programming intro'] },
    { ch: 7,  name: 'Permutations and Combinations',               topics: ['Fundamental principle', 'Circular permutations', 'Combinations'] },
    { ch: 8,  name: 'Binomial Theorem',                            topics: ['Binomial expansion', 'General term', 'Middle term', 'Properties'] },
    { ch: 9,  name: 'Sequences and Series',                        topics: ['AP', 'GP', 'HP', 'AM-GM inequality', 'Sum of series'] },
    { ch: 10, name: 'Straight Lines',                              topics: ['Slope', 'Various forms of line', 'Distance formulas', 'Family of lines'] },
    { ch: 11, name: 'Conic Sections',                              topics: ['Circle', 'Parabola', 'Ellipse', 'Hyperbola'] },
    { ch: 12, name: 'Introduction to Three Dimensional Geometry',  topics: ['Direction cosines', 'Distance formula in 3D', 'Section formula'] },
    { ch: 13, name: 'Limits and Derivatives',                      topics: ['Limits by factorisation/rationalisation', 'Standard limits', 'Derivatives'] },
    { ch: 14, name: 'Mathematical Reasoning',                      topics: ['Statements', 'Connectives', 'Quantifiers', 'Validation'] },
    { ch: 15, name: 'Statistics',                                  topics: ['Mean deviation', 'Variance', 'SD', 'Coefficient of variation'] },
    { ch: 16, name: 'Probability',                                 topics: ['Classical definition', 'Axiomatic approach', 'Conditional probability'] },
  ],
  12: [
    { ch: 1,  name: 'Relations and Functions',                     topics: ['Types of relations', 'Bijective functions', 'Inverse functions', 'Binary ops'] },
    { ch: 2,  name: 'Inverse Trigonometric Functions',             topics: ['Principal value', 'Domain/range', 'Properties and identities'] },
    { ch: 3,  name: 'Matrices',                                    topics: ['Types of matrices', 'Operations', 'Elementary transformations'] },
    { ch: 4,  name: 'Determinants',                                topics: ['Properties', 'Minors/cofactors', 'Cramer\'s rule', 'Area of triangle'] },
    { ch: 5,  name: 'Continuity and Differentiability',            topics: ['Continuity', 'Chain rule', 'Implicit differentiation', 'Rolle\'s/MVT'] },
    { ch: 6,  name: 'Application of Derivatives',                  topics: ['Rate of change', 'Tangent/normal', 'Increasing/decreasing', 'Maxima/minima'] },
    { ch: 7,  name: 'Integrals',                                   topics: ['Standard integrals', 'Substitution', 'Integration by parts', 'Partial fractions'] },
    { ch: 8,  name: 'Application of Integrals',                    topics: ['Area under curve', 'Area between curves'] },
    { ch: 9,  name: 'Differential Equations',                      topics: ['Order/degree', 'Variable separable', 'Linear DE', 'Homogeneous DE'] },
    { ch: 10, name: 'Vector Algebra',                              topics: ['Dot product', 'Cross product', 'Scalar triple product', 'Vector triple product'] },
    { ch: 11, name: 'Three Dimensional Geometry',                  topics: ['Direction cosines', 'Equations of line/plane', 'Angle between them'] },
    { ch: 12, name: 'Linear Programming',                          topics: ['Feasible region', 'Corner point method', 'Applications'] },
    { ch: 13, name: 'Probability',                                 topics: ['Conditional probability', 'Bayes\' theorem', 'Binomial distribution'] },
  ],
};

const MATHS_RDSHARMA = {
  11: [
    { ch: 1,  name: 'Sets (Advanced)',           topics: ['Infinite sets', 'Power set', 'Countability'] },
    { ch: 2,  name: 'Relations (Advanced)',      topics: ['Equivalence relations', 'Partial orders', 'Functions'] },
    { ch: 3,  name: 'Trigonometry (Advanced)',   topics: ['Conditional identities', 'Equations', 'Inverse trig'] },
    { ch: 4,  name: 'Complex Numbers (Advanced)',topics: ['Cube roots of unity', 'nth roots', 'Locus problems'] },
    { ch: 5,  name: 'Permutation & Combination (Advanced)', topics: ['Distribution problems', 'Derangements'] },
    { ch: 6,  name: 'Binomial Theorem (Advanced)',topics: ['Multinomial', 'Properties of coefficients', 'Greatest term'] },
    { ch: 7,  name: 'Sequence and Series (Advanced)', topics: ['Telescoping', 'Method of differences', 'AGP'] },
    { ch: 8,  name: 'Straight Lines (Advanced)', topics: ['Angle bisectors', 'Pair of lines', 'Foot of perpendicular'] },
    { ch: 9,  name: 'Circles',                  topics: ['Family of circles', 'Radical axis', 'Coaxial circles'] },
    { ch: 10, name: 'Parabola, Ellipse, Hyperbola', topics: ['Tangents', 'Normals', 'Chords', 'Polars'] },
  ],
  12: [
    { ch: 1,  name: 'Indefinite Integration',    topics: ['Reduction formulas', 'Walli\'s formula', 'Special integrals'] },
    { ch: 2,  name: 'Definite Integration',      topics: ['Properties of definite integrals', 'King\'s property', 'Leibniz rule'] },
    { ch: 3,  name: 'Differential Equations (Advanced)', topics: ['Exact DE', 'Integrating factor', 'Clairaut\'s equation'] },
    { ch: 4,  name: 'Vectors (Advanced)',         topics: ['3D geometry problems', 'Coplanarity', 'Lines and planes'] },
    { ch: 5,  name: 'Probability (Advanced)',     topics: ['Total probability', 'Expectation', 'Geometric probability'] },
  ],
};

// ─── BIOLOGY ─────────────────────────────────────────────────────────────────

const BIOLOGY_NCERT = {
  11: [
    { ch: 1,  name: 'The Living World',                            topics: ['Biodiversity', 'Nomenclature', 'Taxonomic categories', 'Tools of study'] },
    { ch: 2,  name: 'Biological Classification',                   topics: ['Two/five kingdom', 'Monera', 'Protista', 'Fungi', 'Viruses', 'Lichens'] },
    { ch: 3,  name: 'Plant Kingdom',                               topics: ['Algae', 'Bryophyta', 'Pteridophyta', 'Gymnosperms', 'Angiosperms'] },
    { ch: 4,  name: 'Animal Kingdom',                              topics: ['Basis of classification', 'Porifera to Chordata', 'Coelom', 'Segmentation'] },
    { ch: 5,  name: 'Morphology of Flowering Plants',              topics: ['Root', 'Stem', 'Leaf', 'Flower', 'Fruit', 'Seed', 'Families'] },
    { ch: 6,  name: 'Anatomy of Flowering Plants',                 topics: ['Tissue systems', 'Dicot/monocot anatomy', 'Wood structure'] },
    { ch: 7,  name: 'Structural Organisation in Animals',          topics: ['Epithelial tissue', 'Connective tissue', 'Cockroach anatomy', 'Frog'] },
    { ch: 8,  name: 'Cell: The Unit of Life',                      topics: ['Cell theory', 'Prokaryotic cell', 'Eukaryotic cell', 'Organelles'] },
    { ch: 9,  name: 'Biomolecules',                                topics: ['Carbohydrates', 'Proteins', 'Lipids', 'Nucleic acids', 'Enzymes'] },
    { ch: 10, name: 'Cell Cycle and Cell Division',                topics: ['Mitosis', 'Meiosis', 'Significance', 'Checkpoints'] },
    { ch: 11, name: 'Transport in Plants',                         topics: ['Diffusion', 'Osmosis', 'Plasmolysis', 'Xylem transport', 'Phloem loading'] },
    { ch: 12, name: 'Mineral Nutrition',                           topics: ['Essential minerals', 'Deficiency symptoms', 'Nitrogen fixation'] },
    { ch: 13, name: 'Photosynthesis in Higher Plants',             topics: ['Light reactions', 'Calvin cycle', 'C4 plants', 'CAM', 'Photorespiration'] },
    { ch: 14, name: 'Respiration in Plants',                       topics: ['Glycolysis', 'Krebs cycle', 'ETC', 'ATP yield', 'Fermentation'] },
    { ch: 15, name: 'Plant Growth and Development',                topics: ['Growth regulators', 'Auxins', 'Gibberellins', 'Photoperiodism', 'Vernalisation'] },
    { ch: 16, name: 'Digestion and Absorption',                    topics: ['Alimentary canal', 'Digestive enzymes', 'Absorption', 'Disorders'] },
    { ch: 17, name: 'Breathing and Exchange of Gases',             topics: ['Lungs', 'Breathing mechanism', 'Gas exchange', 'Transport of O2/CO2'] },
    { ch: 18, name: 'Body Fluids and Circulation',                 topics: ['Blood composition', 'Heart', 'Cardiac cycle', 'ECG', 'Disorders'] },
    { ch: 19, name: 'Excretory Products and their Elimination',    topics: ['Nephron', 'Urine formation', 'Regulation', 'Disorders'] },
    { ch: 20, name: 'Locomotion and Movement',                     topics: ['Muscle types', 'Sliding filament', 'Joints', 'Disorders'] },
    { ch: 21, name: 'Neural Control and Coordination',             topics: ['Neuron', 'Synapse', 'CNS', 'PNS', 'Reflex arc', 'Sense organs'] },
    { ch: 22, name: 'Chemical Coordination and Integration',       topics: ['Endocrine glands', 'Hormones', 'Feedback mechanism', 'Disorders'] },
  ],
  12: [
    { ch: 1,  name: 'Reproduction in Organisms',                   topics: ['Asexual reproduction', 'Sexual reproduction', 'Life spans'] },
    { ch: 2,  name: 'Sexual Reproduction in Flowering Plants',     topics: ['Flower structure', 'Pollination', 'Fertilization', 'Seed/fruit development'] },
    { ch: 3,  name: 'Human Reproduction',                          topics: ['Male/female reproductive system', 'Gametogenesis', 'Fertilization', 'Embryo'] },
    { ch: 4,  name: 'Reproductive Health',                         topics: ['STDs', 'Contraception', 'MTP', 'Infertility', 'ART'] },
    { ch: 5,  name: 'Principles of Inheritance and Variation',     topics: ['Mendel\'s laws', 'Codominance', 'Sex linkage', 'Chromosomal disorders'] },
    { ch: 6,  name: 'Molecular Basis of Inheritance',              topics: ['DNA structure', 'Replication', 'Transcription', 'Translation', 'Regulation'] },
    { ch: 7,  name: 'Evolution',                                   topics: ['Origin of life', 'Darwinism', 'Natural selection', 'Hardy-Weinberg', 'Speciation'] },
    { ch: 8,  name: 'Human Health and Disease',                    topics: ['Pathogens', 'Immunity', 'Vaccines', 'Cancer', 'AIDS', 'Drugs/alcohol'] },
    { ch: 9,  name: 'Strategies for Enhancement in Food Production', topics: ['Plant breeding', 'Animal husbandry', 'Biofortification', 'SCP'] },
    { ch: 10, name: 'Microbes in Human Welfare',                   topics: ['Household products', 'Industrial products', 'Sewage', 'Biogas', 'Biocontrol'] },
    { ch: 11, name: 'Biotechnology: Principles and Processes',     topics: ['Recombinant DNA', 'Cloning vectors', 'PCR', 'Gel electrophoresis'] },
    { ch: 12, name: 'Biotechnology and its Applications',          topics: ['Insulin', 'Bt crops', 'Gene therapy', 'Ethical issues'] },
    { ch: 13, name: 'Organisms and Populations',                   topics: ['Habitat', 'Niche', 'Population attributes', 'Growth models', 'Interactions'] },
    { ch: 14, name: 'Ecosystem',                                   topics: ['Producers/consumers', 'Food chains', 'Energy flow', 'Biogeochemical cycles'] },
    { ch: 15, name: 'Biodiversity and Conservation',               topics: ['Biodiversity types', 'Hotspots', 'Threats', 'In-situ/Ex-situ conservation'] },
    { ch: 16, name: 'Environmental Issues',                        topics: ['Air/water/soil pollution', 'Ozone depletion', 'Global warming', 'Solid waste'] },
  ],
};

const BIOLOGY_TRUEMAN = {
  11: [
    { ch: 1,  name: 'The Living World (Expanded)',                 topics: ['Characteristics of living things', 'Metabolism', 'Growth in detail'] },
    { ch: 2,  name: 'Cell Biology (Advanced)',                     topics: ['Ultra-structure of cell', 'Membrane models', 'Cell signalling'] },
    { ch: 3,  name: 'Genetics and Molecular Biology',              topics: ['Chromosome structure', 'DNA packaging', 'Gene expression'] },
    { ch: 4,  name: 'Plant Physiology (In-depth)',                 topics: ['Mineral deficiency diseases', 'Phytohormones in detail', 'Plant movements'] },
    { ch: 5,  name: 'Animal Physiology (In-depth)',                topics: ['Digestion enzymes', 'Blood clotting', 'Kidney regulation'] },
  ],
  12: [
    { ch: 1,  name: 'Genetics (Advanced)',                         topics: ['Epistasis', 'Polygenic inheritance', 'Cytoplasmic inheritance'] },
    { ch: 2,  name: 'Evolution (In-depth)',                        topics: ['Fossil record', 'Biochemical evolution', 'Adaptive radiation'] },
    { ch: 3,  name: 'Biotechnology (Advanced)',                    topics: ['CRISPR', 'Stem cells', 'Genomics', 'Proteomics'] },
    { ch: 4,  name: 'Ecology (Advanced)',                          topics: ['Population dynamics', 'Community ecology', 'Biomes'] },
  ],
};

// ─── MASTER EXPORT ───────────────────────────────────────────────────────────

export const ALL_CHAPTERS = {
  jee: {
    physics: {
      ncert:   PHYSICS_NCERT,
      hcverma: PHYSICS_HCVERMA,
    },
    chemistry: {
      ncert:    CHEMISTRY_NCERT,
      optandon: CHEMISTRY_OPTANDON,
    },
    maths: {
      ncert:    MATHS_NCERT,
      rdsharma: MATHS_RDSHARMA,
    },
  },
  neet: {
    physics: {
      ncert:   PHYSICS_NCERT,
      hcverma: PHYSICS_HCVERMA,
    },
    chemistry: {
      ncert:    CHEMISTRY_NCERT,
      optandon: CHEMISTRY_OPTANDON,
    },
    biology: {
      ncert:   BIOLOGY_NCERT,
      trueman: BIOLOGY_TRUEMAN,
    },
  },
};

// HC Verma uses vol 1/2, all others use class 11/12
export function getChapterList(exam, subject, book, classOrVol) {
  const bookData = ALL_CHAPTERS[exam]?.[subject]?.[book];
  if (!bookData) return [];
  return bookData[classOrVol] || [];
}
