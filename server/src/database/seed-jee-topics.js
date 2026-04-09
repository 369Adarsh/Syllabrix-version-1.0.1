// JEE Topics Seed — inserts all topics for all 85 chapters
// Run: node src/database/seed-jee-topics.js
const { pool } = require('./connection');

// Format: [chapterSlug, topicName, displayOrder, difficulty]
const TOPICS = [
  // ── PHYSICS CLASS 11 ──────────────────────────────────────────
  ['units-and-measurements','Physical Quantities and Measurement',1,'easy'],
  ['units-and-measurements','SI Units and Dimensions',2,'easy'],
  ['units-and-measurements','Dimensional Analysis',3,'medium'],
  ['units-and-measurements','Errors in Measurement',4,'medium'],
  ['units-and-measurements','Significant Figures and Rounding',5,'easy'],

  ['motion-in-a-straight-line','Distance, Displacement and Speed',1,'easy'],
  ['motion-in-a-straight-line','Velocity and Acceleration',2,'easy'],
  ['motion-in-a-straight-line','Kinematic Equations of Motion',3,'medium'],
  ['motion-in-a-straight-line','Motion Under Gravity (Free Fall)',4,'medium'],
  ['motion-in-a-straight-line','Relative Motion in 1D',5,'medium'],
  ['motion-in-a-straight-line','Graphical Analysis of Motion',6,'hard'],

  ['motion-in-a-plane','Vectors: Addition and Resolution',1,'medium'],
  ['motion-in-a-plane','Projectile Motion',2,'hard'],
  ['motion-in-a-plane','Uniform Circular Motion',3,'hard'],
  ['motion-in-a-plane','Relative Motion in 2D',4,'hard'],

  ['laws-of-motion','Newton\'s First Law and Inertia',1,'easy'],
  ['laws-of-motion','Newton\'s Second Law (F = ma)',2,'easy'],
  ['laws-of-motion','Newton\'s Third Law',3,'easy'],
  ['laws-of-motion','Free Body Diagrams',4,'medium'],
  ['laws-of-motion','Friction: Static and Kinetic',5,'medium'],
  ['laws-of-motion','Circular Motion Dynamics and Pseudo Forces',6,'hard'],

  ['work-energy-power','Work and Work-Energy Theorem',1,'easy'],
  ['work-energy-power','Conservative and Non-conservative Forces',2,'medium'],
  ['work-energy-power','Potential Energy and Conservation of Energy',3,'medium'],
  ['work-energy-power','Power',4,'easy'],
  ['work-energy-power','Collisions: Elastic and Inelastic',5,'hard'],

  ['rotational-motion','Centre of Mass',1,'medium'],
  ['rotational-motion','Torque and Rotational Equilibrium',2,'medium'],
  ['rotational-motion','Moment of Inertia',3,'hard'],
  ['rotational-motion','Parallel and Perpendicular Axis Theorems',4,'hard'],
  ['rotational-motion','Angular Momentum and Conservation',5,'hard'],
  ['rotational-motion','Rolling Motion',6,'hard'],
  ['rotational-motion','Rotational Kinetic Energy',7,'hard'],

  ['gravitation','Newton\'s Law of Gravitation',1,'easy'],
  ['gravitation','Gravitational Field and Potential',2,'medium'],
  ['gravitation','Kepler\'s Laws of Planetary Motion',3,'medium'],
  ['gravitation','Orbital Velocity and Satellites',4,'hard'],
  ['gravitation','Escape Velocity',5,'hard'],

  ['mechanical-solids','Stress and Strain',1,'easy'],
  ['mechanical-solids','Hooke\'s Law and Elastic Moduli',2,'medium'],
  ['mechanical-solids','Young\'s Modulus',3,'medium'],
  ['mechanical-solids','Bulk and Shear Modulus',4,'hard'],

  ['mechanical-fluids','Fluid Pressure and Pascal\'s Law',1,'easy'],
  ['mechanical-fluids','Archimedes\' Principle and Buoyancy',2,'medium'],
  ['mechanical-fluids','Bernoulli\'s Theorem',3,'hard'],
  ['mechanical-fluids','Viscosity and Stokes\' Law',4,'hard'],
  ['mechanical-fluids','Surface Tension and Capillarity',5,'medium'],

  ['thermal-properties','Temperature Scales and Thermometers',1,'easy'],
  ['thermal-properties','Thermal Expansion',2,'medium'],
  ['thermal-properties','Specific Heat and Calorimetry',3,'medium'],
  ['thermal-properties','Heat Transfer: Conduction, Convection, Radiation',4,'medium'],
  ['thermal-properties','Newton\'s Law of Cooling',5,'medium'],

  ['thermodynamics','Zeroth Law and Temperature',1,'easy'],
  ['thermodynamics','First Law of Thermodynamics',2,'medium'],
  ['thermodynamics','Specific Heats of Gases (Cp, Cv)',3,'hard'],
  ['thermodynamics','Thermodynamic Processes (Isothermal, Adiabatic, etc.)',4,'hard'],
  ['thermodynamics','Second Law and Heat Engines',5,'hard'],
  ['thermodynamics','Carnot Cycle and Efficiency',6,'hard'],

  ['kinetic-theory','Ideal Gas Equation',1,'easy'],
  ['kinetic-theory','Kinetic Interpretation of Temperature',2,'medium'],
  ['kinetic-theory','Degrees of Freedom',3,'medium'],
  ['kinetic-theory','Law of Equipartition of Energy',4,'hard'],
  ['kinetic-theory','Mean Free Path',5,'hard'],

  ['oscillations','Simple Harmonic Motion (SHM)',1,'medium'],
  ['oscillations','Energy in SHM',2,'medium'],
  ['oscillations','Simple Pendulum and Spring-Mass System',3,'medium'],
  ['oscillations','Damped and Forced Oscillations',4,'hard'],
  ['oscillations','Resonance',5,'hard'],

  ['waves','Types of Waves',1,'easy'],
  ['waves','Wave Speed and Wave Equation',2,'medium'],
  ['waves','Superposition and Interference',3,'hard'],
  ['waves','Standing Waves and Normal Modes',4,'hard'],
  ['waves','Beats',5,'medium'],
  ['waves','Doppler Effect',6,'hard'],

  // ── PHYSICS CLASS 12 ──────────────────────────────────────────
  ['electric-charges-fields','Electric Charge and Coulomb\'s Law',1,'easy'],
  ['electric-charges-fields','Electric Field and Field Lines',2,'medium'],
  ['electric-charges-fields','Electric Dipole',3,'medium'],
  ['electric-charges-fields','Gauss\'s Law',4,'hard'],
  ['electric-charges-fields','Applications of Gauss\'s Law',5,'hard'],

  ['electrostatic-potential','Electric Potential and Potential Energy',1,'medium'],
  ['electrostatic-potential','Relation Between E and V',2,'medium'],
  ['electrostatic-potential','Capacitance and Capacitors',3,'hard'],
  ['electrostatic-potential','Energy Stored in a Capacitor',4,'medium'],
  ['electrostatic-potential','Dielectrics and Polarisation',5,'hard'],

  ['current-electricity','Electric Current and Drift Velocity',1,'easy'],
  ['current-electricity','Ohm\'s Law and Resistivity',2,'easy'],
  ['current-electricity','Kirchhoff\'s Laws',3,'medium'],
  ['current-electricity','Wheatstone Bridge and Potentiometer',4,'hard'],
  ['current-electricity','Cells, EMF and Internal Resistance',5,'medium'],
  ['current-electricity','Power in Electric Circuits',6,'medium'],

  ['moving-charges-magnetism','Magnetic Force on a Moving Charge',1,'medium'],
  ['moving-charges-magnetism','Biot-Savart Law',2,'hard'],
  ['moving-charges-magnetism','Ampere\'s Circuital Law',3,'hard'],
  ['moving-charges-magnetism','Motion of Charges in Magnetic Field',4,'hard'],
  ['moving-charges-magnetism','Force on a Current-Carrying Conductor',5,'medium'],

  ['magnetism-matter','Bar Magnet and Magnetic Dipole',1,'easy'],
  ['magnetism-matter','Earth\'s Magnetism',2,'easy'],
  ['magnetism-matter','Magnetic Properties of Materials',3,'medium'],
  ['magnetism-matter','Hysteresis',4,'medium'],

  ['electromagnetic-induction','Magnetic Flux and Faraday\'s Law',1,'medium'],
  ['electromagnetic-induction','Lenz\'s Law',2,'medium'],
  ['electromagnetic-induction','Motional EMF',3,'hard'],
  ['electromagnetic-induction','Self and Mutual Inductance',4,'hard'],
  ['electromagnetic-induction','Energy Stored in an Inductor',5,'medium'],

  ['alternating-current','AC Voltage and Current',1,'easy'],
  ['alternating-current','Phasors and RMS Values',2,'medium'],
  ['alternating-current','Series LCR Circuit',3,'hard'],
  ['alternating-current','Resonance in AC Circuits',4,'hard'],
  ['alternating-current','Transformers',5,'medium'],

  ['electromagnetic-waves','Displacement Current',1,'medium'],
  ['electromagnetic-waves','Maxwell\'s Equations',2,'hard'],
  ['electromagnetic-waves','Properties of EM Waves',3,'easy'],
  ['electromagnetic-waves','Electromagnetic Spectrum',4,'easy'],

  ['ray-optics','Reflection and Mirrors',1,'easy'],
  ['ray-optics','Refraction at Plane Surfaces and Prisms',2,'medium'],
  ['ray-optics','Refraction at Spherical Surfaces and Lenses',3,'hard'],
  ['ray-optics','Lens Maker\'s Equation',4,'hard'],
  ['ray-optics','Optical Instruments',5,'medium'],
  ['ray-optics','Total Internal Reflection',6,'medium'],

  ['wave-optics','Huygens\' Principle',1,'medium'],
  ['wave-optics','Young\'s Double Slit Experiment',2,'hard'],
  ['wave-optics','Diffraction',3,'hard'],
  ['wave-optics','Polarisation',4,'hard'],
  ['wave-optics','Interference Conditions',5,'medium'],

  ['dual-nature','Photoelectric Effect',1,'medium'],
  ['dual-nature','Einstein\'s Photoelectric Equation',2,'medium'],
  ['dual-nature','de Broglie Hypothesis',3,'hard'],
  ['dual-nature','Davisson-Germer Experiment',4,'hard'],

  ['atoms','Bohr\'s Model of the Hydrogen Atom',1,'medium'],
  ['atoms','Spectral Series of Hydrogen',2,'hard'],
  ['atoms','Atomic Spectra and Energy Levels',3,'medium'],
  ['atoms','X-rays',4,'hard'],

  ['nuclei','Nuclear Composition and Radioactivity',1,'medium'],
  ['nuclei','Radioactive Decay Laws',2,'hard'],
  ['nuclei','Nuclear Binding Energy',3,'hard'],
  ['nuclei','Nuclear Fission and Fusion',4,'hard'],

  ['semiconductor-electronics','Energy Bands in Solids',1,'medium'],
  ['semiconductor-electronics','Intrinsic and Extrinsic Semiconductors',2,'medium'],
  ['semiconductor-electronics','p-n Junction Diode',3,'hard'],
  ['semiconductor-electronics','Transistor Action',4,'hard'],
  ['semiconductor-electronics','Logic Gates',5,'medium'],

  // ── CHEMISTRY CLASS 11 ────────────────────────────────────────
  ['basic-concepts','Mole Concept and Molar Mass',1,'easy'],
  ['basic-concepts','Stoichiometry and Limiting Reagent',2,'medium'],
  ['basic-concepts','Empirical and Molecular Formula',3,'medium'],
  ['basic-concepts','Concentration Terms',4,'medium'],
  ['basic-concepts','Laws of Chemical Combination',5,'easy'],

  ['structure-of-atom','Subatomic Particles and Atomic Models',1,'easy'],
  ['structure-of-atom','Bohr\'s Atomic Model and Spectra',2,'medium'],
  ['structure-of-atom','Quantum Numbers',3,'hard'],
  ['structure-of-atom','Aufbau Principle, Hund\'s Rule, Pauli Exclusion',4,'medium'],
  ['structure-of-atom','Electronic Configuration',5,'medium'],
  ['structure-of-atom','Dual Nature and Heisenberg Uncertainty',6,'hard'],

  ['periodicity','Modern Periodic Table',1,'easy'],
  ['periodicity','Periodic Trends: Atomic Radius and Ionization Energy',2,'medium'],
  ['periodicity','Electron Affinity and Electronegativity',3,'medium'],
  ['periodicity','Anomalous Periodicity',4,'hard'],

  ['chemical-bonding','Ionic Bonding and Lattice Energy',1,'medium'],
  ['chemical-bonding','Covalent Bonding and VSEPR Theory',2,'hard'],
  ['chemical-bonding','Hybridisation (sp, sp2, sp3, etc.)',3,'hard'],
  ['chemical-bonding','Valence Bond Theory',4,'hard'],
  ['chemical-bonding','Molecular Orbital Theory',5,'hard'],
  ['chemical-bonding','Hydrogen Bonding and van der Waals Forces',6,'medium'],

  ['thermodynamics-chem','System, Surroundings and State Functions',1,'easy'],
  ['thermodynamics-chem','Enthalpy and Hess\'s Law',2,'medium'],
  ['thermodynamics-chem','Bond Enthalpies',3,'medium'],
  ['thermodynamics-chem','Entropy and Spontaneity',4,'hard'],
  ['thermodynamics-chem','Gibbs Free Energy',5,'hard'],

  ['equilibrium','Law of Mass Action and Kc, Kp',1,'medium'],
  ['equilibrium','Factors Affecting Equilibrium (Le Chatelier\'s Principle)',2,'medium'],
  ['equilibrium','Ionic Equilibrium and Ostwald\'s Dilution Law',3,'hard'],
  ['equilibrium','pH, Acids and Bases (Bronsted-Lowry)',4,'hard'],
  ['equilibrium','Buffer Solutions',5,'hard'],
  ['equilibrium','Solubility Product',6,'hard'],

  ['redox-reactions','Oxidation and Reduction',1,'easy'],
  ['redox-reactions','Balancing Redox Equations',2,'medium'],
  ['redox-reactions','Electrochemical Series',3,'medium'],
  ['redox-reactions','Oxidation States',4,'easy'],

  ['organic-basic','IUPAC Nomenclature',1,'medium'],
  ['organic-basic','Isomerism',2,'hard'],
  ['organic-basic','Inductive and Resonance Effects',3,'hard'],
  ['organic-basic','Reaction Intermediates (Carbocations, Carbanions)',4,'hard'],
  ['organic-basic','Types of Organic Reactions',5,'medium'],

  ['hydrocarbons','Alkanes: Preparation and Properties',1,'medium'],
  ['hydrocarbons','Alkenes: Preparation and Reactions',2,'hard'],
  ['hydrocarbons','Alkynes: Properties and Reactions',3,'hard'],
  ['hydrocarbons','Aromatic Hydrocarbons and EAS',4,'hard'],
  ['hydrocarbons','Conformations and Geometric Isomerism',5,'hard'],

  ['states-of-matter','Kinetic Theory of Gases',1,'medium'],
  ['states-of-matter','Real Gases and van der Waals Equation',2,'hard'],
  ['states-of-matter','Intermolecular Forces',3,'medium'],
  ['states-of-matter','Liquids: Vapour Pressure and Boiling Point',4,'medium'],
  ['states-of-matter','Solid State Basics',5,'easy'],

  ['s-block','Hydrogen and Its Compounds',1,'easy'],
  ['s-block','Group 1 Elements (Alkali Metals)',2,'medium'],
  ['s-block','Group 2 Elements (Alkaline Earth Metals)',3,'medium'],
  ['s-block','Anomalous Properties of Li and Be',4,'hard'],

  ['p-block-1314','Group 13: Boron and Compounds',1,'medium'],
  ['p-block-1314','Group 14: Carbon and Silicon',2,'medium'],
  ['p-block-1314','Allotropes of Carbon',3,'easy'],
  ['p-block-1314','Anomalous Behaviour of Boron and Carbon',4,'hard'],

  ['hydrogen','Position of Hydrogen in Periodic Table',1,'easy'],
  ['hydrogen','Dihydrogen: Preparation and Properties',2,'easy'],
  ['hydrogen','Water and Hydrogen Peroxide',3,'medium'],

  ['environmental-chemistry','Air Pollution and Smog',1,'easy'],
  ['environmental-chemistry','Water Pollution',2,'easy'],
  ['environmental-chemistry','Soil Pollution and Strategies',3,'easy'],

  // ── CHEMISTRY CLASS 12 ────────────────────────────────────────
  ['solid-state','Types of Solids',1,'easy'],
  ['solid-state','Crystal Lattice and Unit Cell',2,'medium'],
  ['solid-state','Packing Efficiency',3,'hard'],
  ['solid-state','Point Defects',4,'hard'],
  ['solid-state','Electrical and Magnetic Properties',5,'medium'],

  ['solutions','Types of Solutions and Concentration Terms',1,'easy'],
  ['solutions','Vapour Pressure and Raoult\'s Law',2,'hard'],
  ['solutions','Colligative Properties',3,'hard'],
  ['solutions','Van\'t Hoff Factor',4,'hard'],
  ['solutions','Ideal and Non-ideal Solutions',5,'medium'],

  ['electrochemistry','Galvanic Cells and EMF',1,'medium'],
  ['electrochemistry','Nernst Equation',2,'hard'],
  ['electrochemistry','Electrolysis and Faraday\'s Laws',3,'hard'],
  ['electrochemistry','Conductance and Kohlrausch\'s Law',4,'hard'],
  ['electrochemistry','Batteries and Fuel Cells',5,'medium'],
  ['electrochemistry','Corrosion',6,'easy'],

  ['chemical-kinetics','Rate of Reaction and Rate Law',1,'medium'],
  ['chemical-kinetics','Order and Molecularity',2,'medium'],
  ['chemical-kinetics','Integrated Rate Laws',3,'hard'],
  ['chemical-kinetics','Temperature Dependence: Arrhenius Equation',4,'hard'],
  ['chemical-kinetics','Mechanisms and Collision Theory',5,'hard'],

  ['surface-chemistry','Adsorption and Adsorbents',1,'easy'],
  ['surface-chemistry','Catalysis: Homogeneous and Heterogeneous',2,'medium'],
  ['surface-chemistry','Colloids and Emulsions',3,'medium'],
  ['surface-chemistry','Coagulation and Protection of Colloids',4,'hard'],

  ['p-block-1518','Group 15: Nitrogen Family',1,'medium'],
  ['p-block-1518','Group 16: Oxygen Family',2,'medium'],
  ['p-block-1518','Group 17: Halogens',3,'hard'],
  ['p-block-1518','Group 18: Noble Gases',4,'easy'],
  ['p-block-1518','Oxoacids of Nitrogen, Sulphur and Phosphorus',5,'hard'],

  ['d-f-block','General Properties of d-Block Elements',1,'medium'],
  ['d-f-block','Transition Metal Compounds',2,'hard'],
  ['d-f-block','Lanthanides and Actinides',3,'medium'],
  ['d-f-block','Potassium Dichromate and Permanganate',4,'medium'],

  ['coordination-compounds','IUPAC Nomenclature of Coordination Compounds',1,'medium'],
  ['coordination-compounds','Werner\'s Theory',2,'medium'],
  ['coordination-compounds','Valence Bond Theory of Coordination',3,'hard'],
  ['coordination-compounds','Crystal Field Theory',4,'hard'],
  ['coordination-compounds','Isomerism in Coordination Compounds',5,'hard'],

  ['haloalkanes','Preparation of Haloalkanes',1,'medium'],
  ['haloalkanes','SN1 and SN2 Reactions',2,'hard'],
  ['haloalkanes','Elimination Reactions (E1, E2)',3,'hard'],
  ['haloalkanes','Haloarenes: Properties and Reactions',4,'hard'],
  ['haloalkanes','Organometallic Compounds',5,'medium'],

  ['alcohols-phenols','Preparation and Properties of Alcohols',1,'medium'],
  ['alcohols-phenols','Reactions of Alcohols',2,'hard'],
  ['alcohols-phenols','Phenols: Acidity and Reactions',3,'hard'],
  ['alcohols-phenols','Ethers: Preparation and Properties',4,'medium'],
  ['alcohols-phenols','Industrial Applications',5,'easy'],

  ['aldehydes-ketones','Preparation of Aldehydes and Ketones',1,'medium'],
  ['aldehydes-ketones','Nucleophilic Addition Reactions',2,'hard'],
  ['aldehydes-ketones','Aldol Condensation and Cannizzaro Reaction',3,'hard'],
  ['aldehydes-ketones','Carboxylic Acids: Preparation and Properties',4,'medium'],
  ['aldehydes-ketones','Reactions of Carboxylic Acids',5,'hard'],
  ['aldehydes-ketones','Derivatives: Esters, Amides, Anhydrides',6,'hard'],

  ['amines','Classification and Nomenclature of Amines',1,'easy'],
  ['amines','Preparation of Amines',2,'medium'],
  ['amines','Chemical Reactions of Amines',3,'hard'],
  ['amines','Diazonium Salts',4,'hard'],
  ['amines','Comparison of Basicity',5,'hard'],

  ['biomolecules','Carbohydrates: Structure and Properties',1,'medium'],
  ['biomolecules','Proteins and Amino Acids',2,'medium'],
  ['biomolecules','Nucleic Acids (DNA and RNA)',3,'hard'],
  ['biomolecules','Enzymes, Vitamins and Hormones',4,'easy'],

  ['polymers','Types of Polymerisation',1,'easy'],
  ['polymers','Important Polymers and Uses',2,'easy'],
  ['polymers','Rubber and Fibres',3,'easy'],

  ['everyday-life','Drugs and Medicines',1,'easy'],
  ['everyday-life','Detergents and Soaps',2,'easy'],
  ['everyday-life','Food Preservatives and Dyes',3,'easy'],

  // ── MATHEMATICS CLASS 11 ─────────────────────────────────────
  ['sets','Sets and Set Notation',1,'easy'],
  ['sets','Operations on Sets',2,'easy'],
  ['sets','Venn Diagrams',3,'easy'],
  ['sets','Power Set and Cartesian Product',4,'medium'],

  ['relations-functions','Ordered Pairs and Relations',1,'easy'],
  ['relations-functions','Types of Relations',2,'medium'],
  ['relations-functions','Functions and Their Types',3,'medium'],
  ['relations-functions','Graphs of Functions',4,'medium'],
  ['relations-functions','Operations on Functions',5,'hard'],

  ['trigonometric-functions','Angles: Degree and Radian Measure',1,'easy'],
  ['trigonometric-functions','Trigonometric Ratios and Identities',2,'medium'],
  ['trigonometric-functions','Trigonometric Functions of Sum and Difference',3,'hard'],
  ['trigonometric-functions','Multiple and Sub-multiple Angle Formulas',4,'hard'],
  ['trigonometric-functions','Trigonometric Equations',5,'hard'],
  ['trigonometric-functions','Properties of Triangles',6,'hard'],

  ['complex-numbers','Complex Numbers and Argand Plane',1,'medium'],
  ['complex-numbers','Modulus and Argument',2,'medium'],
  ['complex-numbers','Algebra of Complex Numbers',3,'hard'],
  ['complex-numbers','Quadratic Equations and Discriminant',4,'hard'],
  ['complex-numbers','Cube Roots of Unity',5,'hard'],

  ['linear-inequalities','Linear Inequalities in One Variable',1,'easy'],
  ['linear-inequalities','Linear Inequalities in Two Variables',2,'medium'],
  ['linear-inequalities','Graphical Solution of System of Inequalities',3,'medium'],

  ['permutations-combinations','Fundamental Principle of Counting',1,'easy'],
  ['permutations-combinations','Permutations',2,'medium'],
  ['permutations-combinations','Combinations',3,'medium'],
  ['permutations-combinations','Applications and Problems',4,'hard'],

  ['binomial-theorem','Binomial Theorem for Positive Integral Index',1,'medium'],
  ['binomial-theorem','General and Middle Term',2,'hard'],
  ['binomial-theorem','Properties of Binomial Coefficients',3,'hard'],
  ['binomial-theorem','Binomial Approximations',4,'hard'],

  ['sequences-series','Arithmetic Progression (AP)',1,'easy'],
  ['sequences-series','Geometric Progression (GP)',2,'medium'],
  ['sequences-series','Arithmetic-Geometric Progression',3,'hard'],
  ['sequences-series','Special Series: Sum of n, n², n³',4,'medium'],
  ['sequences-series','Infinite GP and Applications',5,'hard'],

  ['straight-lines','Distance Formula and Section Formula',1,'easy'],
  ['straight-lines','Slope and Equation of a Line',2,'easy'],
  ['straight-lines','Various Forms of Equation of a Line',3,'medium'],
  ['straight-lines','Distance Between Lines and Angle Between Lines',4,'medium'],
  ['straight-lines','Locus and Its Equation',5,'hard'],

  ['conic-sections','Circle: Equation and Properties',1,'medium'],
  ['conic-sections','Parabola',2,'hard'],
  ['conic-sections','Ellipse',3,'hard'],
  ['conic-sections','Hyperbola',4,'hard'],
  ['conic-sections','Tangents and Normals to Conics',5,'hard'],
  ['conic-sections','Standard and General Forms',6,'hard'],

  ['3d-geometry-intro','Coordinates in 3D Space',1,'easy'],
  ['3d-geometry-intro','Distance and Section Formulas in 3D',2,'medium'],
  ['3d-geometry-intro','Direction Cosines and Ratios',3,'medium'],
  ['3d-geometry-intro','Equation of a Plane (basic)',4,'medium'],

  ['limits-derivatives','Concept of a Limit',1,'medium'],
  ['limits-derivatives','Standard Limits',2,'medium'],
  ['limits-derivatives','Continuity',3,'hard'],
  ['limits-derivatives','Derivative from First Principles',4,'hard'],
  ['limits-derivatives','Rules of Differentiation',5,'hard'],

  ['statistics','Measures of Central Tendency',1,'easy'],
  ['statistics','Measures of Dispersion',2,'medium'],
  ['statistics','Variance and Standard Deviation',3,'medium'],
  ['statistics','Analysis of Frequency Distributions',4,'hard'],

  ['probability-11','Events and Sample Space',1,'easy'],
  ['probability-11','Classical Probability',2,'easy'],
  ['probability-11','Axiomatic Probability',3,'medium'],
  ['probability-11','Conditional Probability and Independence',4,'hard'],

  ['mathematical-reasoning','Statements and Logic',1,'easy'],
  ['mathematical-reasoning','Connectives: AND, OR, NOT',2,'easy'],
  ['mathematical-reasoning','Quantifiers and Implications',3,'medium'],

  // ── MATHEMATICS CLASS 12 ─────────────────────────────────────
  ['relations-functions-12','Types of Functions: Injective, Surjective, Bijective',1,'medium'],
  ['relations-functions-12','Composition of Functions',2,'hard'],
  ['relations-functions-12','Invertible Functions',3,'hard'],
  ['relations-functions-12','Binary Operations',4,'medium'],
  ['relations-functions-12','Even and Odd Functions',5,'easy'],

  ['inverse-trig','Inverse Trigonometric Functions: Definition and Domain',1,'medium'],
  ['inverse-trig','Principal Values',2,'hard'],
  ['inverse-trig','Properties of Inverse Trig Functions',3,'hard'],
  ['inverse-trig','Equations Involving Inverse Trig Functions',4,'hard'],

  ['matrices','Matrix Notation and Types',1,'easy'],
  ['matrices','Matrix Operations',2,'medium'],
  ['matrices','Transpose and Symmetric Matrices',3,'medium'],
  ['matrices','Invertible Matrices',4,'hard'],
  ['matrices','Matrix Equations',5,'hard'],

  ['determinants','Determinant of a Matrix',1,'medium'],
  ['determinants','Properties of Determinants',2,'hard'],
  ['determinants','Cofactor Expansion',3,'hard'],
  ['determinants','Cramer\'s Rule',4,'hard'],
  ['determinants','Adjoint and Inverse of a Matrix',5,'hard'],

  ['continuity-differentiability','Continuity and Discontinuity',1,'medium'],
  ['continuity-differentiability','Differentiability',2,'hard'],
  ['continuity-differentiability','Chain Rule and Implicit Differentiation',3,'hard'],
  ['continuity-differentiability','Parametric Differentiation',4,'hard'],
  ['continuity-differentiability','Higher Order Derivatives',5,'hard'],
  ['continuity-differentiability','Rolle\'s and Lagrange\'s Mean Value Theorems',6,'hard'],

  ['application-derivatives','Rate of Change',1,'medium'],
  ['application-derivatives','Monotonicity: Increasing and Decreasing Functions',2,'hard'],
  ['application-derivatives','Tangent and Normal to a Curve',3,'hard'],
  ['application-derivatives','Maxima and Minima',4,'hard'],
  ['application-derivatives','Approximations Using Derivatives',5,'medium'],
  ['application-derivatives','Optimisation Problems',6,'hard'],

  ['integrals','Integration as Antiderivative',1,'easy'],
  ['integrals','Standard Integrals and Rules',2,'medium'],
  ['integrals','Integration by Substitution',3,'hard'],
  ['integrals','Integration by Parts',4,'hard'],
  ['integrals','Integration by Partial Fractions',5,'hard'],
  ['integrals','Definite Integrals and Properties',6,'hard'],
  ['integrals','Definite Integral as Limit of a Sum',7,'hard'],

  ['application-integrals','Area Between a Curve and x-axis',1,'hard'],
  ['application-integrals','Area Between Two Curves',2,'hard'],
  ['application-integrals','Area of Standard Regions',3,'hard'],
  ['application-integrals','Volume of Solids of Revolution',4,'hard'],

  ['differential-equations','Order and Degree of Differential Equations',1,'easy'],
  ['differential-equations','Formation of Differential Equations',2,'medium'],
  ['differential-equations','Variable Separable Method',3,'hard'],
  ['differential-equations','Homogeneous Differential Equations',4,'hard'],
  ['differential-equations','Linear Differential Equations',5,'hard'],

  ['vector-algebra','Scalars and Vectors',1,'easy'],
  ['vector-algebra','Addition and Scalar Multiplication',2,'easy'],
  ['vector-algebra','Dot Product',3,'medium'],
  ['vector-algebra','Cross Product',4,'hard'],
  ['vector-algebra','Scalar and Vector Triple Products',5,'hard'],

  ['3d-geometry','Direction Cosines and Ratios in 3D',1,'medium'],
  ['3d-geometry','Equation of a Line in 3D',2,'hard'],
  ['3d-geometry','Angle Between Two Lines',3,'hard'],
  ['3d-geometry','Equation of a Plane',4,'hard'],
  ['3d-geometry','Distance from a Point to a Plane',5,'hard'],

  ['linear-programming','Formulation of LPP',1,'easy'],
  ['linear-programming','Graphical Method of Solution',2,'medium'],
  ['linear-programming','Bounded and Unbounded Feasible Regions',3,'medium'],
  ['linear-programming','Diet, Manufacturing, and Allocation Problems',4,'hard'],

  ['probability-12','Conditional Probability',1,'medium'],
  ['probability-12','Multiplication Theorem',2,'medium'],
  ['probability-12','Independent Events',3,'medium'],
  ['probability-12','Bayes\' Theorem',4,'hard'],
  ['probability-12','Random Variables and Probability Distributions',5,'hard'],
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function seed() {
  console.log('Seeding JEE topics...');
  let inserted = 0, skipped = 0;

  for (const [chapterSlug, name, displayOrder, difficulty] of TOPICS) {
    try {
      const [chapters] = await pool.query(
        'SELECT id FROM jee_chapters WHERE slug = ?', [chapterSlug]
      );
      if (!chapters.length) {
        console.warn(`  ⚠ Chapter not found: ${chapterSlug}`);
        skipped++;
        continue;
      }
      const chapterId = chapters[0].id;
      const slug = slugify(name);

      await pool.query(
        `INSERT IGNORE INTO jee_topics (chapter_id, name, slug, display_order, difficulty)
         VALUES (?, ?, ?, ?, ?)`,
        [chapterId, name, slug, displayOrder, difficulty]
      );
      inserted++;
    } catch (e) {
      console.error(`  ✗ ${name}: ${e.message}`);
    }
  }

  console.log(`\nDone! ${inserted} topics inserted, ${skipped} chapters not found.`);
  process.exit(0);
}

seed().catch(e => { console.error(e.message); process.exit(1); });
