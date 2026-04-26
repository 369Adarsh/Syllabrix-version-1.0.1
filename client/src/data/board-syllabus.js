export const BOARD_SUBJECTS = [
  { slug: 'math',    name: 'Mathematics', emoji: '📐', color: 'bg-blue-600',    light: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    hex: '#2563EB' },
  { slug: 'science', name: 'Science',     emoji: '🔬', color: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', hex: '#059669' },
  { slug: 'sst',     name: 'Soc. Studies',emoji: '🌍', color: 'bg-amber-600',   light: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   hex: '#D97706' },
  { slug: 'english', name: 'English',     emoji: '📖', color: 'bg-violet-600',  light: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  hex: '#7C3AED' },
  { slug: 'hindi',   name: 'Hindi',       emoji: '🪔', color: 'bg-rose-600',    light: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    hex: '#E11D48'  },
];

export const CBSE_CHAPTERS = {
  9: {
    math: [
      'Number Systems', 'Polynomials', 'Coordinate Geometry',
      'Linear Equations in Two Variables', "Euclid's Geometry",
      'Lines and Angles', 'Triangles', 'Quadrilaterals', 'Circles',
      "Heron's Formula", 'Surface Areas & Volumes', 'Statistics', 'Probability',
    ],
    science: [
      'Matter in Our Surroundings', 'Is Matter Around Us Pure',
      'Atoms and Molecules', 'Structure of the Atom',
      'The Fundamental Unit of Life', 'Tissues',
      'Diversity in Living Organisms', 'Motion',
      'Force and Laws of Motion', 'Gravitation',
      'Work and Energy', 'Sound',
      'Why Do We Fall Ill', 'Natural Resources',
      'Improvement in Food Resources',
    ],
    sst: [
      'India — Size and Location', 'Physical Features of India',
      'Drainage', 'Climate', 'Natural Vegetation & Wildlife', 'Population',
      'The Story of Village Palampur', 'People as Resource',
      'Poverty as a Challenge', 'Food Security in India',
      'French Revolution', 'Socialism in Europe & the Russian Revolution',
      'Nazism and the Rise of Hitler', 'Forest Society and Colonialism',
      'Pastoralists in the Modern World',
    ],
    english: [
      'Beehive — The Fun They Had', 'Beehive — The Sound of Music',
      'Beehive — The Little Girl', 'Beehive — A Truly Beautiful Mind',
      'Beehive — The Snake and the Mirror', 'Beehive — My Childhood',
      'Beehive — Packing', 'Beehive — Reach for the Top',
      'Beehive — The Bond of Love', 'Beehive — Kathmandu',
      'Moments — The Lost Child', 'Moments — Adventures of Toto',
      'Moments — Iswaran the Storyteller', 'Moments — In the Kingdom of Fools',
      'Writing Skills & Grammar',
    ],
    hindi: [
      'क्षितिज — दो बैलों की कथा', 'क्षितिज — ल्हासा की ओर',
      'क्षितिज — साँवले सपनों की याद', 'क्षितिज — नाना साहब की पुत्री',
      'क्षितिज — प्रेमचंद के फटे जूते', 'क्षितिज — मेरे बचपन के दिन',
      'काव्य — कबीर', 'काव्य — ललद्यद', 'काव्य — रसखान',
      'काव्य — माखनलाल चतुर्वेदी', 'काव्य — सुमित्रानंदन पंत',
      'काव्य — केदारनाथ अग्रवाल', 'व्याकरण एवं लेखन',
    ],
  },
  10: {
    math: [
      'Real Numbers', 'Polynomials', 'Pair of Linear Equations',
      'Quadratic Equations', 'Arithmetic Progressions', 'Triangles',
      'Coordinate Geometry', 'Introduction to Trigonometry',
      'Some Applications of Trigonometry', 'Circles',
      'Areas Related to Circles', 'Surface Areas & Volumes',
      'Statistics', 'Probability',
    ],
    science: [
      'Chemical Reactions & Equations', 'Acids, Bases & Salts',
      'Metals and Non-Metals', 'Carbon & its Compounds',
      'Periodic Classification of Elements', 'Life Processes',
      'Control and Coordination', 'How do Organisms Reproduce',
      'Heredity and Evolution', 'Light — Reflection & Refraction',
      'The Human Eye', 'Electricity',
      'Magnetic Effects of Electric Current', 'Our Environment',
      'Management of Natural Resources',
    ],
    sst: [
      'Resources and Development', 'Forest and Wildlife Resources',
      'Water Resources', 'Agriculture', 'Minerals and Energy Resources',
      'Manufacturing Industries', 'Lifelines of the National Economy',
      'Power Sharing', 'Federalism', 'Gender, Religion and Caste',
      'Political Parties', 'Outcomes of Democracy',
      'Development', 'Sectors of the Indian Economy',
      'Money and Credit', 'Globalisation and the Indian Economy',
      'Consumer Rights',
    ],
    english: [
      'First Flight — A Letter to God', 'First Flight — Nelson Mandela',
      'First Flight — Two Stories about Flying',
      'First Flight — From the Diary of Anne Frank',
      'First Flight — Hundred Dresses I & II',
      'First Flight — Glimpses of India', 'First Flight — Mijbil the Otter',
      'First Flight — Madam Rides the Bus', 'First Flight — The Sermon at Benares',
      'First Flight — The Proposal',
      'Footprints Without Feet Stories', 'Writing Skills & Grammar',
    ],
    hindi: [
      'क्षितिज — सूरदास', 'क्षितिज — तुलसीदास', 'क्षितिज — देव',
      'क्षितिज — जयशंकर प्रसाद', 'क्षितिज — सूर्यकांत त्रिपाठी निराला',
      'क्षितिज — नागार्जुन', 'क्षितिज — गिरिजाकुमार माथुर',
      'क्षितिज — ऋतुराज', 'क्षितिज — मंगलेश डबराल',
      'कृतिका — माता का आँचल', 'कृतिका — जॉर्ज पंचम की नाक',
      'कृतिका — साना-साना हाथ जोड़ि', 'कृतिका — एही ठैयाँ झुलनी हेरानी हो रामा',
      'व्याकरण एवं लेखन',
    ],
  },
};

export const CHAPTER_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'text-gray-400', bg: 'bg-gray-100' },
  { value: 'reading',     label: 'Reading',     color: 'text-blue-600',  bg: 'bg-blue-100'  },
  { value: 'practising',  label: 'Practising',  color: 'text-amber-600', bg: 'bg-amber-100' },
  { value: 'done',        label: 'Done',        color: 'text-emerald-600', bg: 'bg-emerald-100' },
];

export const BOARD_PROGRESS_KEY = 'board_chapter_progress';
export const BOARD_SETTINGS_KEY = 'board_settings';

export function loadBoardProgress() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(BOARD_PROGRESS_KEY) || '{}'); } catch { return {}; }
}

export function saveBoardProgress(data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOARD_PROGRESS_KEY, JSON.stringify(data));
}

export function loadBoardSettings() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(BOARD_SETTINGS_KEY) || '{}'); } catch { return {}; }
}

export function saveBoardSettings(data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOARD_SETTINGS_KEY, JSON.stringify(data));
}

export function getChapterStats(classLevel, progress) {
  const chapters = CBSE_CHAPTERS[classLevel] || {};
  const stats = {};
  for (const subject of BOARD_SUBJECTS) {
    const list = chapters[subject.slug] || [];
    const done = list.filter(ch => progress[`${classLevel}::${subject.slug}::${ch}`] === 'done').length;
    const inProgress = list.filter(ch => {
      const s = progress[`${classLevel}::${subject.slug}::${ch}`];
      return s === 'reading' || s === 'practising';
    }).length;
    stats[subject.slug] = { total: list.length, done, inProgress, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
  }
  return stats;
}
