const ai = require('../../services/ai.service');

// 30+ sectors with 15+ professions each — NO AI needed, instant load
const SECTOR_DATA = [
  { sector: 'Technology & IT', emoji: '💻', color: '#4F46E5', professions: [
    'Software Developer', 'UI/UX Designer', 'Data Scientist', 'Cybersecurity Analyst', 'Cloud Engineer',
    'DevOps Engineer', 'Mobile App Developer', 'AI/ML Engineer', 'Blockchain Developer', 'Game Developer',
    'QA Tester', 'System Administrator', 'Database Administrator', 'IT Support Specialist', 'Web Developer',
    'Ethical Hacker', 'Full Stack Developer', 'Technical Writer', 'IT Consultant', 'Network Engineer'
  ]},
  { sector: 'Healthcare & Medicine', emoji: '🏥', color: '#059669', professions: [
    'Doctor (MBBS)', 'Surgeon', 'Dentist', 'Pharmacist', 'Nurse', 'Physiotherapist', 'Psychologist',
    'Psychiatrist', 'Veterinarian', 'Optometrist', 'Radiologist', 'Pathologist', 'Ayurveda Practitioner',
    'Homeopathy Doctor', 'Paramedic', 'Lab Technician', 'Nutritionist', 'Dietician', 'Speech Therapist',
    'Occupational Therapist', 'Public Health Officer', 'Medical Researcher'
  ]},
  { sector: 'Engineering', emoji: '⚙️', color: '#D97706', professions: [
    'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Chemical Engineer', 'Aerospace Engineer',
    'Robotics Engineer', 'Environmental Engineer', 'Biomedical Engineer', 'Marine Engineer', 'Mining Engineer',
    'Structural Engineer', 'Automobile Engineer', 'Textile Engineer', 'Agricultural Engineer', 'Sound Engineer',
    'Petroleum Engineer', 'Nuclear Engineer', 'Industrial Engineer'
  ]},
  { sector: 'Business & Finance', emoji: '💹', color: '#7C3AED', professions: [
    'Chartered Accountant', 'Investment Banker', 'Financial Analyst', 'Stock Market Trader', 'Entrepreneur',
    'Business Consultant', 'Tax Advisor', 'Auditor', 'Venture Capitalist', 'Insurance Agent', 'Actuary',
    'Wealth Manager', 'Economist', 'Company Secretary', 'Cost Accountant', 'Risk Analyst',
    'Credit Analyst', 'Mutual Fund Manager', 'Forex Trader', 'Business Analyst'
  ]},
  { sector: 'Education & Teaching', emoji: '📚', color: '#2563EB', professions: [
    'School Teacher', 'College Professor', 'Tuition Teacher', 'Online Educator', 'Special Education Teacher',
    'Curriculum Designer', 'Education Consultant', 'Principal', 'Coaching Institute Owner', 'Montessori Teacher',
    'Language Teacher', 'Music Teacher', 'Dance Teacher', 'Art Teacher', 'Physical Education Teacher',
    'Research Scholar', 'Librarian', 'Academic Counselor', 'EdTech Product Manager'
  ]},
  { sector: 'Law & Governance', emoji: '⚖️', color: '#DC2626', professions: [
    'Lawyer', 'Judge', 'IAS Officer', 'IPS Officer', 'Public Prosecutor', 'Corporate Lawyer',
    'Criminal Lawyer', 'Civil Lawyer', 'Patent Attorney', 'Legal Advisor', 'Mediator',
    'Cyber Law Expert', 'Human Rights Lawyer', 'Tax Lawyer', 'Constitutional Lawyer',
    'Notary Public', 'Legal Researcher', 'Paralegal'
  ]},
  { sector: 'Arts & Design', emoji: '🎨', color: '#EC4899', professions: [
    'Graphic Designer', 'Interior Designer', 'Fashion Designer', 'Architect', 'Animator',
    'Illustrator', 'Product Designer', 'Textile Designer', 'Jewelry Designer', 'UI Designer',
    'Industrial Designer', 'Set Designer', 'Tattoo Artist', 'Calligrapher', 'Ceramic Artist',
    'Muralist', 'Art Director', 'Creative Director', 'Art Therapist', 'Art Curator'
  ]},
  { sector: 'Media & Communication', emoji: '📺', color: '#F59E0B', professions: [
    'Journalist', 'News Anchor', 'Content Writer', 'Copywriter', 'Social Media Manager',
    'PR Specialist', 'Radio Jockey', 'Video Editor', 'Photojournalist', 'Film Director',
    'Screenwriter', 'Documentary Maker', 'Podcast Host', 'Brand Strategist', 'SEO Specialist',
    'Digital Marketing Manager', 'Advertising Executive', 'Event Manager', 'Blogger', 'Vlogger'
  ]},
  { sector: 'Science & Research', emoji: '🔬', color: '#6366F1', professions: [
    'Physicist', 'Chemist', 'Biologist', 'Astronomer', 'Geologist', 'Marine Biologist',
    'Botanist', 'Zoologist', 'Microbiologist', 'Geneticist', 'Space Scientist (ISRO)',
    'Meteorologist', 'Forensic Scientist', 'Environmental Scientist', 'Food Scientist',
    'Nanotechnologist', 'Paleontologist', 'Oceanographer', 'Materials Scientist'
  ]},
  { sector: 'Defence & Security', emoji: '🎖️', color: '#1E40AF', professions: [
    'Army Officer', 'Navy Officer', 'Air Force Pilot', 'NDA Cadet', 'BSF/CRPF/CISF Officer',
    'Intelligence Officer (RAW/IB)', 'Coast Guard', 'Police Officer', 'Detective',
    'Bomb Disposal Expert', 'Cyber Security (Defence)', 'Military Engineer', 'Defence Scientist',
    'National Security Advisor', 'Paramilitary Forces', 'Fire Fighter'
  ]},
  { sector: 'Sports & Fitness', emoji: '🏏', color: '#10B981', professions: [
    'Cricket Player', 'Football Player', 'Badminton Player', 'Tennis Player', 'Athlete (Track & Field)',
    'Gym Trainer', 'Yoga Instructor', 'Pilates Instructor', 'Fitness Coach', 'Sports Physiotherapist',
    'Sports Nutritionist', 'Cricket Coach', 'Football Coach', 'Swimming Coach', 'Boxing Trainer',
    'Martial Arts Instructor', 'Sports Psychologist', 'Sports Journalist', 'Referee/Umpire',
    'Adventure Sports Instructor', 'Personal Trainer'
  ]},
  { sector: 'Hospitality & Tourism', emoji: '🏨', color: '#0891B2', professions: [
    'Hotel Manager', 'Chef', 'Bartender', 'Tour Guide', 'Travel Agent', 'Flight Attendant',
    'Pilot (Commercial)', 'Resort Manager', 'Restaurant Owner', 'Food Critic', 'Sommelier',
    'Cruise Director', 'Event Planner', 'Wedding Planner', 'Concierge', 'Housekeeping Manager',
    'Pastry Chef', 'Catering Manager', 'Heritage Walk Guide'
  ]},
  { sector: 'Retail & Commerce', emoji: '🛒', color: '#EA580C', professions: [
    'Shopkeeper', 'Retail Store Manager', 'E-commerce Manager', 'Visual Merchandiser',
    'Supply Chain Manager', 'Warehouse Manager', 'Procurement Officer', 'Inventory Manager',
    'Street Vendor', 'Wholesale Dealer', 'Mall Manager', 'Franchise Owner',
    'Online Seller (Amazon/Flipkart)', 'D2C Brand Owner', 'Supermarket Manager',
    'Export-Import Business Owner', 'Customs Broker'
  ]},
  { sector: 'Wellness & Healing', emoji: '🧘', color: '#8B5CF6', professions: [
    'Tarot Card Reader', 'Astrologer', 'Numerologist', 'Vastu Consultant', 'Reiki Healer',
    'Pranic Healer', 'Acupuncturist', 'Aromatherapist', 'Meditation Teacher', 'Life Coach',
    'Counselor', 'Hypnotherapist', 'Crystal Healer', 'Sound Healer', 'Naturopath',
    'Wellness Consultant', 'Spiritual Guide', 'Feng Shui Expert'
  ]},
  { sector: 'Agriculture & Farming', emoji: '🌾', color: '#65A30D', professions: [
    'Farmer', 'Agricultural Scientist', 'Horticulturist', 'Floriculturist', 'Dairy Farmer',
    'Poultry Farmer', 'Fisherman/Aquaculturist', 'Tea Planter', 'Coffee Planter', 'Organic Farmer',
    'Agricultural Engineer', 'Soil Scientist', 'Plant Pathologist', 'Seed Technologist',
    'Farm Manager', 'Agri-Business Entrepreneur', 'Food Processing Technologist', 'Beekeeper'
  ]},
  { sector: 'Entertainment & Performing Arts', emoji: '🎭', color: '#E11D48', professions: [
    'Actor', 'Singer', 'Musician', 'Dancer', 'Comedian', 'Stand-up Comic', 'DJ',
    'Film Producer', 'Choreographer', 'Theatre Director', 'Voice Actor', 'Stunt Artist',
    'Magician', 'Circus Performer', 'Classical Dancer (Bharatanatyam/Kathak)', 'Rapper',
    'Music Composer', 'Sound Designer', 'Playback Singer', 'Orchestra Conductor'
  ]},
  { sector: 'Fashion & Beauty', emoji: '👗', color: '#DB2777', professions: [
    'Fashion Designer', 'Stylist', 'Model', 'Makeup Artist', 'Hair Stylist', 'Nail Artist',
    'Fashion Photographer', 'Fashion Blogger', 'Boutique Owner', 'Costume Designer',
    'Textile Designer', 'Wardrobe Consultant', 'Beauty Therapist', 'Salon Owner',
    'Bridal Makeup Artist', 'Dermatologist (Beauty)', 'Perfumer', 'Fashion Merchandiser'
  ]},
  { sector: 'Environment & Sustainability', emoji: '🌍', color: '#16A34A', professions: [
    'Environmental Scientist', 'Wildlife Photographer', 'Forest Officer (IFS)', 'Wildlife Biologist',
    'Climate Change Analyst', 'Sustainability Consultant', 'Renewable Energy Engineer',
    'Solar Panel Technician', 'Waste Management Expert', 'Water Conservation Specialist',
    'Urban Planner (Green)', 'Environmental Lawyer', 'Ecologist', 'Conservation Officer',
    'Carbon Credit Analyst', 'Organic Certification Expert'
  ]},
  { sector: 'Transport & Logistics', emoji: '🚛', color: '#0D9488', professions: [
    'Truck Driver', 'Logistics Manager', 'Freight Forwarder', 'Shipping Agent',
    'Train Driver (Loco Pilot)', 'Airline Pilot', 'Air Traffic Controller', 'Ship Captain',
    'Delivery Executive', 'Fleet Manager', 'Courier Service Owner', 'Uber/Ola Driver',
    'Auto Rickshaw Driver', 'Bus Driver', 'Warehouse Supervisor', 'Customs Officer'
  ]},
  { sector: 'Skilled Trades & Crafts', emoji: '🔧', color: '#78716C', professions: [
    'Electrician', 'Plumber', 'Carpenter', 'Welder', 'Painter (House)', 'Mason/Bricklayer',
    'Mechanic (Auto)', 'Mechanic (AC/Refrigeration)', 'Tailor', 'Goldsmith', 'Blacksmith',
    'Potter', 'Cobbler', 'Watchmaker', 'Locksmith', 'Printer', 'Bookbinder',
    'Glass Blower', 'Upholsterer', 'Sign Board Maker'
  ]},
  { sector: 'Photography & Film', emoji: '📸', color: '#A855F7', professions: [
    'Photographer', 'Wedding Photographer', 'Wildlife Photographer', 'Fashion Photographer',
    'Film Director', 'Cinematographer', 'Video Editor', 'Color Grader', 'VFX Artist',
    'Sound Engineer (Film)', 'Production Manager', 'Casting Director', 'Storyboard Artist',
    'Documentary Filmmaker', 'Drone Photographer', 'Photo Editor', 'Stock Photographer'
  ]},
  { sector: 'Real Estate & Construction', emoji: '🏗️', color: '#B45309', professions: [
    'Real Estate Agent', 'Property Developer', 'Civil Engineer', 'Architect', 'Interior Designer',
    'Construction Manager', 'Quantity Surveyor', 'Site Engineer', 'Real Estate Lawyer',
    'Property Valuer', 'Town Planner', 'Structural Engineer', 'Landscape Architect',
    'Building Inspector', 'Home Loan Advisor', 'Smart City Planner'
  ]},
  { sector: 'Food & Beverage', emoji: '🍳', color: '#CA8A04', professions: [
    'Chef', 'Baker', 'Pastry Chef', 'Food Truck Owner', 'Restaurant Owner', 'Caterer',
    'Food Blogger', 'Food Photographer', 'Nutritionist', 'Tea Taster', 'Coffee Roaster',
    'Ice Cream Maker', 'Chocolatier', 'Brewing Expert', 'Street Food Vendor',
    'Cloud Kitchen Owner', 'Recipe Developer', 'Food Safety Officer'
  ]},
  { sector: 'Social Work & NGO', emoji: '🤝', color: '#0369A1', professions: [
    'Social Worker', 'NGO Founder', 'Community Organizer', 'Fundraiser', 'Human Rights Activist',
    'Child Welfare Officer', 'Disaster Management Expert', 'Rehabilitation Counselor',
    'Development Economist', 'Gender Studies Expert', 'Rural Development Officer',
    'Tribal Welfare Officer', 'UN/WHO Field Worker', 'Peace Educator', 'Volunteer Coordinator'
  ]},
  { sector: 'Government & Civil Services', emoji: '🏛️', color: '#4338CA', professions: [
    'IAS Officer', 'IPS Officer', 'IFS Officer (Foreign Service)', 'IRS Officer (Revenue)',
    'Block Development Officer', 'District Collector', 'SDM (Sub-Divisional Magistrate)',
    'Municipal Commissioner', 'Election Commissioner', 'CAG Auditor', 'Railway Officer',
    'Post Master', 'Bank PO', 'SSC Officer', 'State PCS Officer', 'UPSC CAPF'
  ]},
  { sector: 'Gig Economy & Freelancing', emoji: '💼', color: '#9333EA', professions: [
    'Freelance Writer', 'Freelance Designer', 'Freelance Developer', 'YouTuber', 'Instagram Influencer',
    'Uber/Ola Driver', 'Zomato/Swiggy Delivery', 'Tutor (Online)', 'Virtual Assistant',
    'Translator', 'Voice Over Artist', 'Data Entry Specialist', 'Transcriptionist',
    'Fiverr/Upwork Freelancer', 'Drop Shipping Business', 'Print on Demand Business',
    'Affiliate Marketer', 'Online Course Creator'
  ]},
  { sector: 'Animal Care', emoji: '🐾', color: '#059669', professions: [
    'Veterinarian', 'Dog Trainer', 'Pet Groomer', 'Animal Shelter Manager', 'Wildlife Rescue',
    'Zookeeper', 'Horse Trainer', 'Marine Animal Trainer', 'Animal Nutritionist',
    'Pet Shop Owner', 'Animal Behaviorist', 'Poultry Scientist', 'Dairy Scientist',
    'Dog Walker', 'Pet Sitter', 'Animal Photographer'
  ]},
  { sector: 'Aviation & Space', emoji: '🚀', color: '#1D4ED8', professions: [
    'Commercial Pilot', 'Fighter Pilot', 'Helicopter Pilot', 'Drone Pilot', 'Astronaut',
    'Space Scientist (ISRO)', 'Aerospace Engineer', 'Air Traffic Controller', 'Aircraft Maintenance Engineer',
    'Flight Dispatcher', 'Cabin Crew', 'Airport Manager', 'Aviation Safety Inspector',
    'Satellite Engineer', 'Rocket Propulsion Engineer'
  ]},
  { sector: 'Music & Audio', emoji: '🎵', color: '#7C3AED', professions: [
    'Singer', 'Musician', 'Music Composer', 'Music Producer', 'Sound Engineer', 'DJ',
    'Music Teacher', 'Classical Vocalist', 'Tabla Player', 'Sitar Player', 'Guitarist',
    'Pianist', 'Drummer', 'Music Therapist', 'Jingle Composer', 'Podcast Editor',
    'Audio Book Narrator', 'Choir Director', 'Music Critic'
  ]},
  { sector: 'Writing & Publishing', emoji: '✍️', color: '#0F766E', professions: [
    'Author', 'Novelist', 'Poet', 'Playwright', 'Screenwriter', 'Journalist',
    'Technical Writer', 'Content Writer', 'Ghostwriter', 'Editor', 'Proofreader',
    'Publisher', 'Literary Agent', 'Book Cover Designer', 'Translator',
    'Comic Book Writer', 'Children\'s Book Author', 'Critic', 'Columnist'
  ]},
];

let cachedSectors = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000;

// Sensitive professions — knowledge only, NO practical exercises
const SENSITIVE_PROFESSIONS = [
  'doctor', 'surgeon', 'dentist', 'nurse', 'pharmacist', 'paramedic', 'psychiatrist',
  'electrician', 'plumber', 'welder', 'mechanic', 'mason', 'carpenter',
  'bomb disposal', 'firefighter', 'pilot', 'air traffic controller',
  'nuclear engineer', 'chemical engineer', 'mining engineer',
  'army officer', 'navy officer', 'police officer',
  'radiologist', 'pathologist', 'anesthesiologist',
];

const isSensitive = (profession) => {
  const lower = profession.toLowerCase();
  return SENSITIVE_PROFESSIONS.some(s => lower.includes(s));
};

const getAISectors = async () => {
  if (cachedSectors && (Date.now() - cacheTime < CACHE_DURATION)) return cachedSectors;

  // Return hardcoded data — instant, no AI call needed
  cachedSectors = SECTOR_DATA.map(s => ({
    sector: s.sector,
    emoji: s.emoji,
    color: s.color,
    professions: s.professions.map(p => ({
      name: p, emoji: '👤', difficulty: 'beginner',
    })),
  }));
  cacheTime = Date.now();
  return cachedSectors;
};

const exploreProfession = async (profession) => {
  const sensitive = isSensitive(profession);
  const activityInstruction = sensitive
    ? `"activity": { "title": "Knowledge Module", "description": "This is a knowledge-only profession. Practical exercises are not available for safety reasons. Instead, learn about the theory, education path, and requirements.", "steps": ["Read about the education requirements", "Watch documentaries about this profession", "Talk to a professional in this field"] },
  "safety_note": "This profession involves sensitive/dangerous work. Syllabrix provides knowledge, education paths, and career guidance only — no practical simulations.",`
    : `"activity": { "title": "Try it yourself!", "description": "A simple 10-minute activity a student can do right now to experience this profession", "steps": ["Step 1", "Step 2", "Step 3"] },`;

  const prompt = `You are an expert career counselor on the Syllabrix education platform.

A student wants to explore the profession: "${profession}"

Provide a comprehensive, engaging exploration. Return ONLY JSON:
{
  "name": "${profession}",
  "tagline": "One exciting line about this profession",
  "overview": "3-4 sentences describing what this professional does daily",
  "day_in_life": ["6:00 AM - Wake up and...", "9:00 AM - Start work...", "12:00 PM - ...", "5:00 PM - ..."],
  "skills_needed": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "education_path": {
    "after_10th": "What to study after class 10",
    "after_12th": "What to study after class 12",
    "degrees": ["Degree 1", "Degree 2"],
    "certifications": ["Certification 1"]
  },
  "salary_india": { "entry": "₹X-Y LPA", "mid": "₹X-Y LPA", "senior": "₹X-Y LPA" },
  "famous_indians": [{ "name": "Person Name", "achievement": "What they did" }],
  "pros": ["Advantage 1", "Advantage 2", "Advantage 3"],
  "cons": ["Challenge 1", "Challenge 2"],
  "future_scope": "2-3 sentences about future demand in India",
  ${activityInstruction}
  "related_professions": ["Related 1", "Related 2", "Related 3"],
  "fun_fact": "One surprising fact about this profession",
  "is_sensitive": ${sensitive}
}

Be specific to India. Include salary in INR. Be encouraging and inspiring. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.5, maxTokens: 3000 });
};

const generateChallenge = async (profession, level) => {
  if (isSensitive(profession)) {
    return {
      title: 'Knowledge Challenge',
      description: `This profession involves sensitive/dangerous work. Instead of a practical challenge, research and write a 200-word essay about what it takes to become a ${profession} in India.`,
      difficulty: level || 'beginner',
      time_minutes: 15,
      steps: ['Research the education path required', 'List the top 5 skills needed', 'Find 3 famous Indians in this field', 'Write a short essay about why this profession matters'],
      deliverable: 'A written essay or notes',
      evaluation_criteria: ['Accuracy of information', 'Research depth', 'Personal reflection'],
      bonus_points: 'Interview someone who works in this field',
      real_world_connection: 'Understanding the profession helps you decide your career path',
      is_knowledge_only: true,
    };
  }

  const prompt = `Generate a fun, educational challenge for a student exploring: "${profession}" (Level: ${level || 'beginner'})

Return ONLY JSON:
{
  "title": "Challenge title",
  "description": "What the student needs to do (2-3 sentences)",
  "difficulty": "${level || 'beginner'}",
  "time_minutes": 15,
  "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "deliverable": "What the student should produce (e.g., a sketch, a plan, a report)",
  "evaluation_criteria": ["Criteria 1", "Criteria 2", "Criteria 3"],
  "bonus_points": "Extra challenge for ambitious students",
  "real_world_connection": "How this relates to the real profession"
}
ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.6 });
};

const getProfessionalComms = async (profession) => {
  const prompt = `Generate professional communication scenarios for: "${profession}"

Return ONLY JSON:
{
  "profession": "${profession}",
  "email_template": { "subject": "...", "body": "Professional email example" },
  "client_pitch": "How to pitch to a client (3-4 sentences)",
  "elevator_pitch": "30-second self-introduction for this profession",
  "interview_question": "Common interview Q&A for this role",
  "ethics_scenario": { "situation": "An ethical dilemma in this profession", "best_response": "How to handle it" }
}
ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.5 });
};

module.exports = { getAISectors, exploreProfession, generateChallenge, getProfessionalComms, SECTOR_DATA, isSensitive, SENSITIVE_PROFESSIONS };
