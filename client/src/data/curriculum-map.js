/**
 * Syllabrix Curriculum Intelligence Map
 *
 * Central source of truth that maps a student's class + board + stream
 * to subjects, relevant exams, platform mode, and dashboard config.
 *
 * Usage:  resolveStudentCurriculum(user.profile)  → CurriculumContext
 */

// ─── Subject Lists ────────────────────────────────────────────────────────────

const SUBJECTS = {
  primary_cbse:      ['Mathematics', 'English', 'Hindi', 'EVS', 'Computer Basics'],
  primary_icse:      ['Mathematics', 'English', 'Hindi / Regional', 'Environmental Science', 'Computer Studies'],
  primary_state:     ['Mathematics', 'English', 'Hindi / Regional', 'Environmental Studies'],

  middle_cbse:       ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
  middle_icse:       ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History & Civics', 'Geography', 'English', 'Hindi'],
  middle_state:      ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi / Regional'],

  secondary_cbse:    ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'IT / Computer Science'],
  secondary_icse:    ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History & Civics', 'Geography', 'English', 'Hindi'],
  secondary_ib:      ['Mathematics', 'Sciences', 'Individuals & Societies', 'Language & Literature', 'Language Acquisition'],
  secondary_igcse:   ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'English'],
  secondary_state:   ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi / Regional', 'Computer'],

  senior_pcm_cbse:   ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science / IP'],
  senior_pcm_icse:   ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science'],
  senior_pcm_ib:     ['Physics', 'Chemistry', 'Mathematics AA / AI', 'English Language & Literature'],
  senior_pcm_state:  ['Physics', 'Chemistry', 'Mathematics', 'English'],

  senior_pcb_cbse:   ['Physics', 'Chemistry', 'Biology', 'English'],
  senior_pcb_state:  ['Physics', 'Chemistry', 'Biology', 'English'],

  senior_pcmb_cbse:  ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],

  senior_com_cbse:   ['Accountancy', 'Business Studies', 'Economics', 'Mathematics / Applied Maths', 'English', 'Entrepreneurship'],
  senior_com_icse:   ['Accounts', 'Commerce', 'Economics', 'Mathematics', 'English'],
  senior_com_state:  ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'],

  senior_arts_cbse:  ['History', 'Geography', 'Political Science', 'Economics', 'English', 'Sociology'],
  senior_arts_icse:  ['History & Civics', 'Geography', 'Political Science', 'Literature in English', 'Sociology'],
  senior_arts_state: ['History', 'Geography', 'Political Science', 'Economics', 'English'],

  college_engg:      ['Engineering Mathematics', 'Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks'],
  college_medical:   ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 'Microbiology'],
  college_commerce:  ['Financial Accounting', 'Business Law', 'Marketing Management', 'Financial Management', 'Taxation'],
  college_science:   ['Mathematics / Statistics', 'Physics / Chemistry / Biology', 'Research Methods'],
  college_arts:      ['History', 'Sociology', 'Psychology', 'Political Science', 'Literature'],

  coaching_jee:      ['Physics', 'Chemistry', 'Mathematics'],
  coaching_neet:     ['Physics', 'Chemistry', 'Biology'],
  coaching_upsc:     ['History', 'Geography', 'Polity', 'Economy', 'Science & Technology', 'Environment', 'Current Affairs'],
  coaching_ssc:      ['General Intelligence', 'English Language', 'Quantitative Aptitude', 'General Awareness'],
  coaching_banking:  ['Reasoning Ability', 'Quantitative Aptitude', 'English Language', 'General Awareness', 'Computer Knowledge'],
  coaching_ca:       ['Accounting', 'Business Laws', 'Business Maths', 'Economics', 'Taxation', 'Auditing'],
};

// ─── Exam Lists ────────────────────────────────────────────────────────────────

const EXAMS = {
  primary: [
    { name: 'SOF International Maths Olympiad (IMO)', type: 'olympiad', badge: '🏅' },
    { name: 'SOF National Science Olympiad (NSO)', type: 'olympiad', badge: '🔬' },
    { name: 'ASSET Assessment', type: 'benchmark', badge: '📊' },
    { name: 'School Annual Exam', type: 'school', badge: '🏫' },
  ],
  middle: [
    { name: 'School Annual Exam', type: 'school', badge: '🏫' },
    { name: 'NTSE Stage 1 (Class 8)', type: 'scholarship', badge: '🌟' },
    { name: 'SOF Olympiads (IMO / NSO / NCO)', type: 'olympiad', badge: '🏅' },
    { name: 'ASSET Assessment', type: 'benchmark', badge: '📊' },
    { name: 'INSPIRE Science Award', type: 'scholarship', badge: '💡' },
  ],
  board_9: [
    { name: 'School Annual Exam', type: 'school', badge: '🏫' },
    { name: 'SOF Olympiads', type: 'olympiad', badge: '🏅' },
    { name: 'NTSE Pre-Preparation', type: 'preparation', badge: '📋' },
  ],
  board_10_cbse: [
    { name: 'CBSE Class 10 Board Exam', type: 'board', badge: '🎯', critical: true },
    { name: 'NTSE Stage 1 & 2', type: 'scholarship', badge: '🌟' },
    { name: 'SOF Olympiads', type: 'olympiad', badge: '🏅' },
    { name: 'INSPIRE Science Award', type: 'scholarship', badge: '💡' },
  ],
  board_10_icse: [
    { name: 'ICSE Class 10 Board Exam', type: 'board', badge: '🎯', critical: true },
    { name: 'NTSE Stage 1 & 2', type: 'scholarship', badge: '🌟' },
    { name: 'SOF Olympiads', type: 'olympiad', badge: '🏅' },
  ],
  board_10_state: [
    { name: 'State Board Class 10 Exam', type: 'board', badge: '🎯', critical: true },
    { name: 'NTSE Stage 1 & 2', type: 'scholarship', badge: '🌟' },
    { name: 'SOF Olympiads', type: 'olympiad', badge: '🏅' },
  ],
  board_10_default: [
    { name: 'Class 10 Board Exam', type: 'board', badge: '🎯', critical: true },
    { name: 'NTSE Stage 1 & 2', type: 'scholarship', badge: '🌟' },
    { name: 'SOF Olympiads', type: 'olympiad', badge: '🏅' },
  ],
  senior_11_pcm: [
    { name: 'School Annual Exam', type: 'school', badge: '🏫' },
    { name: 'KVPY Fellowship (SX Stream)', type: 'scholarship', badge: '🌟' },
    { name: 'JEE Foundation Prep', type: 'preparation', badge: '⚡' },
    { name: 'SOF Science & Maths Olympiads', type: 'olympiad', badge: '🏅' },
  ],
  senior_12_pcm: [
    { name: 'JEE Main', type: 'entrance', badge: '⚡', critical: true },
    { name: 'JEE Advanced', type: 'entrance', badge: '🔥' },
    { name: 'BITSAT', type: 'entrance', badge: '🏛️' },
    { name: 'VITEEE', type: 'entrance', badge: '🎓' },
    { name: 'MHT-CET (PCM)', type: 'entrance', badge: '📝' },
    { name: 'CBSE / Board Exam Class 12', type: 'board', badge: '🎯' },
    { name: 'SRMJEEE', type: 'entrance', badge: '🏫' },
  ],
  senior_11_pcb: [
    { name: 'School Annual Exam', type: 'school', badge: '🏫' },
    { name: 'NEET Foundation Prep', type: 'preparation', badge: '🧬' },
    { name: 'KVPY Fellowship (SX Stream)', type: 'scholarship', badge: '🌟' },
  ],
  senior_12_pcb: [
    { name: 'NEET-UG', type: 'entrance', badge: '🧬', critical: true },
    { name: 'AIIMS (via NEET)', type: 'entrance', badge: '🏥' },
    { name: 'MHT-CET (PCB)', type: 'entrance', badge: '📝' },
    { name: 'CBSE / Board Exam Class 12', type: 'board', badge: '🎯' },
    { name: 'JIPMER (via NEET)', type: 'entrance', badge: '🏛️' },
  ],
  senior_11_pcmb: [
    { name: 'School Annual Exam', type: 'school', badge: '🏫' },
    { name: 'JEE + NEET Foundation', type: 'preparation', badge: '⚡' },
    { name: 'KVPY Fellowship', type: 'scholarship', badge: '🌟' },
  ],
  senior_12_pcmb: [
    { name: 'JEE Main', type: 'entrance', badge: '⚡', critical: true },
    { name: 'NEET-UG', type: 'entrance', badge: '🧬', critical: true },
    { name: 'CBSE / Board Exam Class 12', type: 'board', badge: '🎯' },
    { name: 'BITSAT', type: 'entrance', badge: '🏛️' },
  ],
  senior_11_commerce: [
    { name: 'School Annual Exam', type: 'school', badge: '🏫' },
    { name: 'CA Foundation Preparation', type: 'preparation', badge: '📊' },
    { name: 'CUET UG Preparation', type: 'preparation', badge: '🎓' },
  ],
  senior_12_commerce: [
    { name: 'CBSE / Board Exam Class 12', type: 'board', badge: '🎯', critical: true },
    { name: 'CA Foundation (ICAI)', type: 'professional', badge: '📊' },
    { name: 'CUET UG', type: 'entrance', badge: '🎓' },
    { name: 'IPU CET (BBA / BCA)', type: 'entrance', badge: '🏛️' },
    { name: 'CLAT (Law)', type: 'entrance', badge: '⚖️' },
    { name: 'SET — Symbiosis', type: 'entrance', badge: '📝' },
  ],
  senior_11_arts: [
    { name: 'School Annual Exam', type: 'school', badge: '🏫' },
    { name: 'CUET UG Preparation', type: 'preparation', badge: '🎓' },
    { name: 'NDA / CDS Foundation (for defence)', type: 'preparation', badge: '🎖️' },
  ],
  senior_12_arts: [
    { name: 'CBSE / Board Exam Class 12', type: 'board', badge: '🎯', critical: true },
    { name: 'CUET UG', type: 'entrance', badge: '🎓' },
    { name: 'CLAT (Law)', type: 'entrance', badge: '⚖️' },
    { name: 'DU Entrance / JNUEE', type: 'entrance', badge: '🏛️' },
    { name: 'NID / NIFT (Design)', type: 'entrance', badge: '🎨' },
    { name: 'UPSC — Start building foundation now', type: 'aspirational', badge: '🏛️' },
  ],
  college_engg: [
    { name: 'GATE', type: 'entrance', badge: '⚙️', critical: true },
    { name: 'Campus Placements', type: 'career', badge: '💼' },
    { name: 'GRE (for MS Abroad)', type: 'international', badge: '🌍' },
    { name: 'ISRO / DRDO Recruitment', type: 'government', badge: '🚀' },
  ],
  college_medical: [
    { name: 'NEET PG', type: 'entrance', badge: '🧬', critical: true },
    { name: 'FMGE (for foreign graduates)', type: 'entrance', badge: '🏥' },
    { name: 'USMLE (for US)', type: 'international', badge: '🌍' },
    { name: 'INICET', type: 'entrance', badge: '🏛️' },
  ],
  college_commerce: [
    { name: 'CA Inter / CA Final (ICAI)', type: 'professional', badge: '📊', critical: true },
    { name: 'CAT (MBA)', type: 'entrance', badge: '🎓' },
    { name: 'XAT / SNAP / MAT', type: 'entrance', badge: '📝' },
    { name: 'CMA / CS (Company Secretary)', type: 'professional', badge: '⚖️' },
  ],
  college_arts: [
    { name: 'UPSC Civil Services', type: 'government', badge: '🏛️', critical: true },
    { name: 'State PSC', type: 'government', badge: '🏢' },
    { name: 'CUET PG', type: 'entrance', badge: '🎓' },
    { name: 'NDA / CDS', type: 'defence', badge: '🎖️' },
  ],
  coaching_jee:  [
    { name: 'JEE Main', type: 'entrance', badge: '⚡', critical: true },
    { name: 'JEE Advanced', type: 'entrance', badge: '🔥' },
    { name: 'BITSAT', type: 'entrance', badge: '🏛️' },
    { name: 'VITEEE / SRMJEEE', type: 'entrance', badge: '🎓' },
  ],
  coaching_neet: [
    { name: 'NEET-UG', type: 'entrance', badge: '🧬', critical: true },
    { name: 'AIIMS (via NEET)', type: 'entrance', badge: '🏥' },
    { name: 'JIPMER (via NEET)', type: 'entrance', badge: '🏛️' },
    { name: 'MHT-CET (PCB)', type: 'entrance', badge: '📝' },
  ],
  coaching_upsc: [
    { name: 'UPSC Civil Services (Prelims + Mains)', type: 'government', badge: '🏛️', critical: true },
    { name: 'State PSC', type: 'government', badge: '🏢' },
    { name: 'IES / ESE', type: 'government', badge: '⚙️' },
  ],
  coaching_ssc: [
    { name: 'SSC CGL', type: 'government', badge: '🏢', critical: true },
    { name: 'SSC CHSL', type: 'government', badge: '📝' },
    { name: 'SSC MTS', type: 'government', badge: '📋' },
    { name: 'RRB NTPC', type: 'government', badge: '🚂' },
  ],
  coaching_banking: [
    { name: 'IBPS PO', type: 'banking', badge: '🏦', critical: true },
    { name: 'IBPS Clerk', type: 'banking', badge: '📝' },
    { name: 'SBI PO / Clerk', type: 'banking', badge: '🏛️' },
    { name: 'RBI Grade B', type: 'banking', badge: '💰' },
  ],
  coaching_ca: [
    { name: 'CA Foundation (ICAI)', type: 'professional', badge: '📊', critical: true },
    { name: 'CA Intermediate', type: 'professional', badge: '📈' },
    { name: 'CA Final', type: 'professional', badge: '🏆' },
  ],
};

// ─── Stream normaliser ─────────────────────────────────────────────────────────

function normaliseStream(stream) {
  if (!stream) return null;
  const s = stream.toLowerCase();
  if (s.includes('pcmb') || (s.includes('pcm') && s.includes('bio'))) return 'pcmb';
  if (s.includes('pcm') || s.includes('science') && s.includes('math')) return 'pcm';
  if (s.includes('pcb') || (s.includes('science') && s.includes('bio') && !s.includes('math'))) return 'pcb';
  if (s.includes('science')) return 'pcm'; // default science → PCM
  if (s.includes('commerce')) return 'commerce';
  if (s.includes('arts') || s.includes('humanit')) return 'arts';
  // College streams
  if (s.includes('engineering') || s.includes('cs') || s.includes('it') || s.includes('mech') || s.includes('civil') || s.includes('ece')) return 'engineering';
  if (s.includes('medical') || s.includes('mbbs') || s.includes('bds') || s.includes('pharmacy') || s.includes('nursing')) return 'medical';
  if (s.includes('law')) return 'law';
  if (s.includes('design') || s.includes('nid') || s.includes('nift')) return 'design';
  return null;
}

function normaliseBoard(board) {
  if (!board) return 'default';
  const b = board.toLowerCase();
  if (b.includes('cbse')) return 'cbse';
  if (b.includes('icse') || b.includes('isc')) return 'icse';
  if (b.includes('ib')) return 'ib';
  if (b.includes('igcse')) return 'igcse';
  if (b.includes('state')) return 'state';
  return 'default';
}

function normaliseClass(className) {
  if (!className) return null;
  const c = String(className).trim().replace(/^class\s*/i, '');
  const n = parseInt(c, 10);
  if (!isNaN(n)) return n;
  if (c.toLowerCase().includes('ug') || c.toLowerCase().includes('year')) return 'ug';
  if (c.toLowerCase().includes('pg') || c.toLowerCase().includes('postgrad')) return 'pg';
  if (c.toLowerCase().includes('nursery') || c.toLowerCase().includes('kg')) return 0;
  return null;
}

function normaliseExamType(examType) {
  if (!examType) return null;
  const e = examType.toLowerCase();
  if (e.includes('jee')) return 'jee';
  if (e.includes('neet')) return 'neet';
  if (e.includes('upsc') || e.includes('ias') || e.includes('ips')) return 'upsc';
  if (e.includes('ssc')) return 'ssc';
  if (e.includes('banking') || e.includes('ibps') || e.includes('rbi') || e.includes('sbi')) return 'banking';
  if (e.includes('ca ') || e.includes('icai') || e.includes('chartered')) return 'ca';
  if (e.includes('rrb') || e.includes('railway')) return 'ssc';
  if (e.includes('nda') || e.includes('cds') || e.includes('defence')) return 'upsc';
  return null;
}

// ─── Subject key builder ───────────────────────────────────────────────────────

function subjectKey(tier, board) {
  const key = `${tier}_${board}`;
  return SUBJECTS[key] || SUBJECTS[`${tier}_cbse`] || SUBJECTS[`${tier}_state`] || SUBJECTS[tier] || [];
}

// ─── Core resolver ─────────────────────────────────────────────────────────────

/**
 * Given a student's profile, returns their full curriculum context.
 * @param {object} profile  student_profiles row merged from /auth/me
 * @returns {CurriculumContext}
 */
export function resolveStudentCurriculum(profile) {
  if (!profile) return fallbackContext();

  const {
    education_level,
    class_name,
    board,
    subject_stream,
    exam_type,
    college_name,
    university,
  } = profile;

  const classNum   = normaliseClass(class_name);
  const boardKey   = normaliseBoard(board);
  const stream     = normaliseStream(subject_stream);
  const examNorm   = normaliseExamType(exam_type);
  const level      = education_level || 'school';

  // ── COACHING ──────────────────────────────────────────────────────────────
  if (level === 'coaching') {
    switch (examNorm) {
      case 'jee':     return coachingContext('jee',     '⚡ JEE Command',          'JEE Main + Advanced — target IITs & NITs',         'exam_command',  '/jee-command');
      case 'neet':    return coachingContext('neet',    '🧬 NEET Command',         'NEET-UG — target MBBS / BDS across India',         'exam_command',  '/prep');
      case 'upsc':    return coachingContext('upsc',    '🏛️ UPSC Command',         'Civil Services — Prelims, Mains & Interview',       'upsc_aspirant', '/prep');
      case 'ssc':     return coachingContext('ssc',     '🏢 SSC / Railway Command','SSC CGL, CHSL, RRB NTPC — crack government jobs',   'skill_builder', '/prep');
      case 'banking': return coachingContext('banking', '🏦 Banking Command',      'IBPS PO / Clerk, SBI — enter public sector banking','skill_builder', '/prep');
      case 'ca':      return coachingContext('ca',      '📊 CA Command',           'CA Foundation → Intermediate → Final (ICAI)',       'skill_builder', '/prep');
      default:        return coachingContext('ssc',     '📚 Exam Command',         'Competitive exam preparation',                      'skill_builder', '/prep');
    }
  }

  // ── COLLEGE ───────────────────────────────────────────────────────────────
  if (level === 'college' || classNum === 'ug' || classNum === 'pg') {
    switch (stream) {
      case 'engineering': return collegeContext('engg',     '⚙️ GATE & Placement Command', 'GATE, Campus Placements & higher studies', 'skill_builder');
      case 'medical':     return collegeContext('medical',  '🧬 NEET PG Command',          'NEET PG, INICET — postgraduate medical',   'skill_builder');
      case 'commerce':    return collegeContext('commerce', '📊 CA / MBA Command',          'CA Inter/Final, CAT, XAT — commerce career','skill_builder');
      case 'arts':        return collegeContext('arts',     '🏛️ UPSC & PG Command',         'UPSC, State PSC, PG entrance',             'upsc_aspirant');
      default:            return collegeContext('commerce', '🎓 Career Command',            'Exams & placements for your stream',        'skill_builder');
    }
  }

  // ── SCHOOL ────────────────────────────────────────────────────────────────
  if (typeof classNum === 'number') {

    // Primary: Class 0–5
    if (classNum <= 5) {
      const subjects = classNum <= 2
        ? subjectKey('primary', boardKey)
        : subjectKey('primary', boardKey);
      return {
        tier: 'primary',
        label: classNum === 0 ? 'Nursery / KG' : `Class ${classNum} — ${board || 'School'}`,
        subjects,
        exams: EXAMS.primary,
        platformMode: 'young_explorer',
        examCommandLabel: '🌈 Olympiad & Activity Hub',
        examCommandHref: '/prep',
        tagline: 'Learn, explore and grow every day!',
        dashboardSubtitle: 'Today is a great day to learn something new!',
        color: '#F59E0B',
        showExamCountdown: false,
      };
    }

    // Middle: Class 6–8
    if (classNum <= 8) {
      return {
        tier: 'middle',
        label: `Class ${classNum} — ${board || 'School'}`,
        subjects: subjectKey('middle', boardKey),
        exams: EXAMS.middle,
        platformMode: 'curious_mind',
        examCommandLabel: '🔭 Scholarship & Olympiad Hub',
        examCommandHref: '/prep',
        tagline: 'Curiosity is your superpower.',
        dashboardSubtitle: classNum === 8 ? 'NTSE this year — build your foundation strong.' : 'Discover something amazing today.',
        color: '#0D9488',
        showExamCountdown: classNum === 8,
      };
    }

    // Class 9
    if (classNum === 9) {
      return {
        tier: 'secondary_9',
        label: `Class 9 — ${board || 'School'}`,
        subjects: subjectKey('secondary', boardKey),
        exams: EXAMS.board_9,
        platformMode: 'board_warrior',
        examCommandLabel: '📚 Class 9 Board Prep',
        examCommandHref: '/prep',
        tagline: 'Class 10 is one year away. Start strong.',
        dashboardSubtitle: 'Build every chapter now — it pays off in Class 10.',
        color: '#059669',
        showExamCountdown: false,
      };
    }

    // Class 10
    if (classNum === 10) {
      const examKey  = `board_10_${boardKey}`;
      const exams    = EXAMS[examKey] || EXAMS.board_10_default;
      const boardName = board || 'Board';
      return {
        tier: 'secondary_10',
        label: `Class 10 — ${boardName}`,
        subjects: subjectKey('secondary', boardKey),
        exams,
        platformMode: 'board_warrior',
        examCommandLabel: `🎯 ${boardName} Class 10 Board Command`,
        examCommandHref: '/prep',
        tagline: 'Board exams are close — every chapter matters.',
        dashboardSubtitle: `${boardName} Class 10 Boards. Stay consistent, stay ahead.`,
        color: '#059669',
        showExamCountdown: true,
      };
    }

    // Class 11
    if (classNum === 11) {
      return buildSeniorContext(11, stream, boardKey, board);
    }

    // Class 12
    if (classNum === 12) {
      return buildSeniorContext(12, stream, boardKey, board);
    }
  }

  return fallbackContext();
}

// ─── Senior (Class 11–12) builder ─────────────────────────────────────────────

function buildSeniorContext(classNum, stream, boardKey, boardLabel) {
  const yr = classNum === 11 ? 11 : 12;
  const b  = boardLabel || 'Board';

  switch (stream) {
    case 'pcm':
      return {
        tier: `senior_${yr}_pcm`,
        label: `Class ${yr} — Science (PCM) — ${b}`,
        subjects: subjectKey('senior_pcm', boardKey),
        exams: EXAMS[`senior_${yr}_pcm`],
        platformMode: 'exam_command',
        examCommandLabel: yr === 12 ? '⚡ JEE / Engineering Command' : '⚡ JEE Foundation Command',
        examCommandHref: '/jee-command',
        tagline: yr === 12 ? 'JEE Main is this year. Command it.' : 'Build your Physics, Chemistry & Maths foundation.',
        dashboardSubtitle: yr === 12 ? 'JEE Main + Advanced. Every formula. Every concept.' : 'Class 11 PCM — strongest foundation wins JEE.',
        color: '#2563EB',
        showExamCountdown: yr === 12,
        primaryExam: 'JEE',
      };

    case 'pcb':
      return {
        tier: `senior_${yr}_pcb`,
        label: `Class ${yr} — Science (PCB) — ${b}`,
        subjects: subjectKey('senior_pcb', boardKey),
        exams: EXAMS[`senior_${yr}_pcb`],
        platformMode: 'exam_command',
        examCommandLabel: yr === 12 ? '🧬 NEET / Medical Command' : '🧬 NEET Foundation Command',
        examCommandHref: '/prep',
        tagline: yr === 12 ? 'NEET-UG — your gateway to MBBS.' : 'Build your Biology & Chemistry foundation for NEET.',
        dashboardSubtitle: yr === 12 ? 'NEET-UG this year. Revise. Practice. Repeat.' : 'Class 11 PCB — every NCERT line matters for NEET.',
        color: '#059669',
        showExamCountdown: yr === 12,
        primaryExam: 'NEET',
      };

    case 'pcmb':
      return {
        tier: `senior_${yr}_pcmb`,
        label: `Class ${yr} — Science (PCM+B) — ${b}`,
        subjects: subjectKey('senior_pcmb', boardKey),
        exams: EXAMS[`senior_${yr}_pcmb`],
        platformMode: 'exam_command',
        examCommandLabel: yr === 12 ? '⚡ JEE + NEET Command' : '⚡ JEE + NEET Foundation',
        examCommandHref: '/jee-command',
        tagline: yr === 12 ? 'JEE + NEET — two goals, one focused mind.' : 'PCM+B — explore Engineering or Medical.',
        dashboardSubtitle: yr === 12 ? 'Balancing JEE & NEET. Plan smartly.' : 'Class 11 PCM+B — keep your options open.',
        color: '#7C3AED',
        showExamCountdown: yr === 12,
        primaryExam: 'JEE+NEET',
      };

    case 'commerce':
      return {
        tier: `senior_${yr}_commerce`,
        label: `Class ${yr} — Commerce — ${b}`,
        subjects: subjectKey('senior_com', boardKey),
        exams: EXAMS[`senior_${yr}_commerce`],
        platformMode: 'board_warrior',
        examCommandLabel: yr === 12 ? '📊 Commerce Board & CA Command' : '📊 Commerce Foundation Command',
        examCommandHref: '/prep',
        tagline: yr === 12 ? 'Boards + CA Foundation — commerce career starts here.' : 'Build Accountancy, Economics & BST foundations.',
        dashboardSubtitle: yr === 12 ? 'Class 12 Commerce Boards + CA Foundation prep.' : 'Class 11 Commerce — fundamentals now, results later.',
        color: '#D97706',
        showExamCountdown: yr === 12,
      };

    case 'arts':
      return {
        tier: `senior_${yr}_arts`,
        label: `Class ${yr} — Arts / Humanities — ${b}`,
        subjects: subjectKey('senior_arts', boardKey),
        exams: EXAMS[`senior_${yr}_arts`],
        platformMode: 'board_warrior',
        examCommandLabel: yr === 12 ? '🎭 Arts Board & University Entrance Command' : '🎭 Arts Foundation Command',
        examCommandHref: '/prep',
        tagline: yr === 12 ? 'CUET, CLAT & Boards — your gateway to top colleges.' : 'Explore History, Polity & build your CUET foundation.',
        dashboardSubtitle: yr === 12 ? 'Class 12 Arts — Boards + CUET + CLAT.' : 'Class 11 Arts — the beginning of a powerful academic journey.',
        color: '#BE185D',
        showExamCountdown: yr === 12,
      };

    default:
      // Class 11-12 with unknown stream — board_warrior as baseline
      return {
        tier: `senior_${yr}_unknown`,
        label: `Class ${yr} — ${b}`,
        subjects: subjectKey('secondary', boardKey),
        exams: yr === 12 ? EXAMS.board_10_cbse : EXAMS.board_9,
        platformMode: 'board_warrior',
        examCommandLabel: `🎯 Class ${yr} Board Command`,
        examCommandHref: '/prep',
        tagline: `Class ${yr} — your board exams and beyond.`,
        dashboardSubtitle: `Choose your stream to unlock personalised exam prep.`,
        color: '#059669',
        showExamCountdown: yr === 12,
      };
  }
}

// ─── Helpers for coaching / college ───────────────────────────────────────────

function coachingContext(examKey, label, subtitle, mode, href) {
  return {
    tier: `coaching_${examKey}`,
    label,
    subjects: SUBJECTS[`coaching_${examKey}`] || [],
    exams: EXAMS[`coaching_${examKey}`] || [],
    platformMode: mode,
    examCommandLabel: label,
    examCommandHref: href,
    tagline: subtitle,
    dashboardSubtitle: subtitle,
    color: '#2563EB',
    showExamCountdown: true,
  };
}

function collegeContext(streamKey, label, subtitle, mode) {
  return {
    tier: `college_${streamKey}`,
    label,
    subjects: SUBJECTS[`college_${streamKey}`] || [],
    exams: EXAMS[`college_${streamKey}`] || [],
    platformMode: mode,
    examCommandLabel: label,
    examCommandHref: '/prep',
    tagline: subtitle,
    dashboardSubtitle: subtitle,
    color: '#7C3AED',
    showExamCountdown: true,
  };
}

function fallbackContext() {
  return {
    tier: 'default',
    label: 'Student',
    subjects: [],
    exams: [],
    platformMode: 'default',
    examCommandLabel: '📚 Exam & Study Hub',
    examCommandHref: '/prep',
    tagline: 'Complete your profile to unlock personalised learning.',
    dashboardSubtitle: 'Your personalised study plan is waiting.',
    color: '#2563EB',
    showExamCountdown: false,
  };
}

// ─── Quick helpers ─────────────────────────────────────────────────────────────

/** Returns only the critical / high-priority exams (shown in dashboard banner) */
export function getPrimaryExams(curriculum, limit = 3) {
  if (!curriculum?.exams?.length) return [];
  const critical = curriculum.exams.filter(e => e.critical);
  const rest     = curriculum.exams.filter(e => !e.critical);
  return [...critical, ...rest].slice(0, limit);
}

/** Returns a short "context chip" label for nav/header */
export function getCurriculumChip(curriculum) {
  if (!curriculum || curriculum.tier === 'default') return null;
  return curriculum.label;
}
