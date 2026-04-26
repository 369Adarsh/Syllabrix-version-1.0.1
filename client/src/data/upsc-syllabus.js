export const UPSC_SYLLABUS = [
  {
    paper: 'GS Paper 1', short: 'GS1', emoji: '🏛️', color: 'bg-blue-600',
    subjects: [
      { name: 'Indian History', topics: ['Ancient India','Medieval India','Modern India','Indian National Movement','Post-Independence Consolidation'] },
      { name: 'Art & Culture', topics: ['Indian Architecture','Paintings & Music','Literature','Performing Arts','Festivals & Traditions'] },
      { name: 'World History', topics: ['Industrial Revolution','World Wars','Colonialism','Decolonisation','Cold War'] },
      { name: 'Indian Society', topics: ['Social Empowerment','Communalism','Regionalism','Secularism','Women Issues'] },
      { name: 'Geography', topics: ['Physical Geography','Economic Geography','Human Geography','Disaster Management','Climate Change'] },
    ],
  },
  {
    paper: 'GS Paper 2', short: 'GS2', emoji: '⚖️', color: 'bg-violet-600',
    subjects: [
      { name: 'Indian Polity', topics: ['Constitution','Parliament & Legislature','Executive','Judiciary','Federalism','Local Bodies'] },
      { name: 'Governance', topics: ['Government Policies','e-Governance','Citizens Charters','RTI','Transparency'] },
      { name: 'Social Justice', topics: ['Welfare Schemes','Health','Education','Poverty','Vulnerable Sections'] },
      { name: 'International Relations', topics: ['India & Neighbours','Indian Ocean','Bilateral Relations','International Organisations','Diaspora'] },
    ],
  },
  {
    paper: 'GS Paper 3', short: 'GS3', emoji: '💹', color: 'bg-emerald-600',
    subjects: [
      { name: 'Economy', topics: ['Economic Planning','Budget & Fiscal Policy','Agriculture','Industry','Infrastructure','LPG Reforms'] },
      { name: 'Science & Tech', topics: ['Space Technology','Defence Technology','Biotechnology','IT & Cybersecurity','IPR'] },
      { name: 'Environment', topics: ['Biodiversity','Environmental Laws','Conservation','Pollution','Climate Agreements'] },
      { name: 'Security', topics: ['Internal Security','Extremism','Organised Crime','Border Management','Money Laundering'] },
      { name: 'Disaster Management', topics: ['Types of Disasters','NDMA','DRR','Role of NGOs','International Framework'] },
    ],
  },
  {
    paper: 'GS Paper 4', short: 'GS4', emoji: '🧭', color: 'bg-amber-600',
    subjects: [
      { name: 'Ethics & Integrity', topics: ['Aptitude & Foundational Values','Attitude','Emotional Intelligence','Civil Service Values'] },
      { name: 'Moral Thinkers', topics: ['Contributions of Moral Thinkers','Gandhi','Ambedkar','Ancient Indian Thought'] },
      { name: 'Case Studies', topics: ['Public Service Ethics','Government Policy','Private Sector','International Relations Cases'] },
    ],
  },
  {
    paper: 'CSAT', short: 'CSAT', emoji: '🧮', color: 'bg-rose-600',
    subjects: [
      { name: 'Comprehension', topics: ['Reading Comprehension','Verbal Ability','Logical Deduction'] },
      { name: 'Reasoning', topics: ['Analytical Reasoning','Logical Reasoning','Data Interpretation'] },
      { name: 'Basic Maths', topics: ['Number System','Percentage','Ratio','Time & Work','Probability'] },
    ],
  },
];

export const ANSWER_WRITING_QUESTIONS = [
  { marks: 10, type: 'Prelims', q: 'Discuss the significance of the Constituent Assembly debates in shaping India\'s constitutional framework.' },
  { marks: 15, type: 'Mains GS1', q: 'The Indian Ocean has become a contested space in the 21st century. Analyse the geopolitical and strategic dimensions.' },
  { marks: 10, type: 'Mains GS2', q: 'Critically examine the role of the Finance Commission in maintaining fiscal federalism in India.' },
  { marks: 15, type: 'Mains GS3', q: 'Artificial Intelligence presents both opportunities and ethical challenges for governance. Discuss with examples.' },
  { marks: 10, type: 'Mains GS4', q: 'What do you understand by "emotional intelligence" and how is it relevant to a civil servant\'s effectiveness?' },
  { marks: 15, type: 'Mains GS1', q: 'Examine the causes and consequences of the Partition of 1947 on Indian society and polity.' },
  { marks: 10, type: 'Mains GS2', q: 'Discuss the challenges to India\'s federal structure arising from the use of Article 356 of the Constitution.' },
  { marks: 15, type: 'Mains GS3', q: 'What are the major challenges to food security in India? Suggest measures to address them.' },
  { marks: 10, type: 'Mains GS4', q: 'Whistleblower protection is essential for combating corruption. Comment on the adequacy of existing legal provisions.' },
  { marks: 15, type: 'Mains GS2', q: 'India\'s foreign policy has evolved from non-alignment to strategic autonomy. Critically evaluate this shift.' },
  { marks: 10, type: 'Mains GS1', q: 'How did the Bhakti and Sufi movements contribute to social reforms and religious harmony in medieval India?' },
  { marks: 15, type: 'Mains GS3', q: 'Discuss the role of space technology in India\'s development, particularly in agriculture and disaster management.' },
];

export function getTodayQuestion() {
  const day = Math.floor(Date.now() / 86400000);
  return ANSWER_WRITING_QUESTIONS[day % ANSWER_WRITING_QUESTIONS.length];
}

// localStorage key for syllabus progress
export const SYLLABUS_KEY = 'upsc_syllabus_progress';

export function loadProgress() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(SYLLABUS_KEY) || '{}'); } catch { return {}; }
}

export function saveProgress(data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SYLLABUS_KEY, JSON.stringify(data));
}
