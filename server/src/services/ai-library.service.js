'use strict';
/**
 * AI Library Service — Adaptive Intelligence Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Supports ANY question a learner can ask, across 4 modes:
 *   1. School      — board/syllabus aware (NCERT, state boards)
 *   2. Competitive — exam-focused (JEE, NEET, UPSC, Banking, etc.)
 *   3. University  — professor-level (IIT/NIT/AIIMS style) with topic precision
 *   4. Open        — no context, pure AI knowledge
 *
 * Question types detected and handled differently:
 *   code        → full working implementation + explanation + complexity
 *   derivation  → step-by-step mathematical/scientific proof
 *   solve       → worked numerical/analytical solution
 *   compare     → structured comparison with table-style output
 *   complexity  → Big-O analysis, recurrence relations
 *   examples    → multiple graded examples (basic → advanced)
 *   explain     → conceptual with analogies + diagrams (default)
 *
 * Sources injected into prompt:
 *   - DB context (subject / chapter / topic metadata)
 *   - Wikipedia summary (free, no key, auto-fetched per topic)
 *   - arXiv papers (for advanced/research questions)
 *   - Prescribed textbooks from Syllabrix library DB
 *
 * AI's own training knowledge covers virtually every standard textbook.
 * The prompt instructs the AI to use that knowledge FULLY — not just previews.
 */

const { generateJSON }  = require('./ai.service');
const { enrichContext, fetchNCERTContext, fetchWikimediaImage } = require('./web-content.service');
const {
  getAIContext, getAIExamContext, getRecommendedBooks,
  getAIUniversityContext, getUniversitySubjectBooks,
  getTopicContext,
} = require('../features/library/library.service');

// ─── Question-type detector ───────────────────────────────────────────────────

function detectQuestionType(query) {
  const q = query.toLowerCase();

  if (/\b(code|implement(ation)?|program|write\s+(a\s+)?(function|code|program|class)|in\s+(python|java|c\+\+|javascript|c\b|golang|rust)|algorithm\s+in|pseudocode)\b/.test(q))
    return 'code';

  if (/\b(derive|derivation|derivat|prove|proof|show\s+that|deduce)\b/.test(q))
    return 'derivation';

  if (/\b(solve|calculate|find\s+the|compute|evaluate|what\s+is\s+the\s+(value|answer|result)|numerically)\b/.test(q))
    return 'solve';

  if (/\b(compare|difference\s+between|vs\.?\s|versus|contrast|similarities|which\s+is\s+better)\b/.test(q))
    return 'compare';

  if (/\b(complexity|time\s+complexity|space\s+complexity|big.?o|big\s+oh|o\(n\)|recurrence)\b/.test(q))
    return 'complexity';

  if (/\b(example|examples|give\s+(me\s+)?(an?\s+)?example|illustrate|demonstrate|show\s+(me\s+)?(how))\b/.test(q))
    return 'examples';

  if (/\b(what\s+is|define|definition|meaning\s+of|explain)\b/.test(q))
    return 'explain';

  return 'explain';
}

function detectDepth(query) {
  const q = query.toLowerCase();
  if (/\b(beginner|basics|simple|easy|eli5|like\s+i.m\s+(5|a\s+kid)|for\s+dummies|introduction|overview)\b/.test(q))
    return 'beginner';
  if (/\b(advanced|deep\s+dive|research|internals|under\s+the\s+hood|first\s+principles|rigorous|proof|formal|academic)\b/.test(q))
    return 'advanced';
  return 'intermediate';
}

function detectDomain(subject, course) {
  const s = (subject + ' ' + (course || '')).toLowerCase();
  if (/\b(data str|algorithm|os|operating|dbms|database|network|computer|programming|software|compiler|machine learning|ai|deep learning)\b/.test(s))
    return 'cs';
  if (/\b(mathematics|calculus|algebra|statistics|linear algebra|discrete math|probability)\b/.test(s))
    return 'math';
  if (/\b(physics|thermodynamics|mechanics|electro|fluid|heat transfer|strength)\b/.test(s))
    return 'physics_engineering';
  if (/\b(chemistry|organic|inorganic|biochemistry|pharmacology)\b/.test(s))
    return 'chemistry';
  if (/\b(anatomy|physiology|pathology|microbiology|medicine|surgery|mbbs)\b/.test(s))
    return 'medical';
  if (/\b(accounting|finance|marketing|management|economics|commerce|business)\b/.test(s))
    return 'commerce_management';
  return 'general';
}

// ─── JSON schema builder per question type ────────────────────────────────────

function buildSchema(qType, mode, domain) {
  const isUni  = mode === 'university';
  const isCode = qType === 'code';
  const isDeriv = qType === 'derivation';
  const isSolve = qType === 'solve';
  const isComp = qType === 'compare';

  const base = {
    explanation:        'Main explanation. Markdown allowed (use **bold**, bullet lists with -).',
    key_points:         ['Key insight 1', 'Key insight 2', 'Key insight 3'],
    real_life_example:  'Concrete real-world application or analogy.',
    remember_this:      'One-liner memory trick, mnemonic, or essential takeaway.',
    follow_up_question: 'One probing question to test deeper understanding.',
    related_topics:     ['Related topic A', 'Related topic B'],
    syllabus_note:      'Any important syllabus/exam note. Empty string if none.',
    diagram_search_query: 'A very short 2-3 word query to search Wikipedia images for a sketch or diagram of this topic. Provide this ONLY if a diagram or sketch is explicitly requested OR if visualizing the concept (e.g. Brain, Solar System, Circuit) is highly impactful for learning. Leave empty string otherwise.',
    exam_pattern_note:  'A specific note on how this topic appears in exams (e.g. "Usually a 5-mark question", "Frequently asked as MCQ"). If unknown or irrelevant, leave empty.'
  };

  // Code questions
  if (isCode) {
    base.code_example = {
      language:    'python (or the language best suited / asked for)',
      code:        'Complete, runnable, commented code implementation.',
      explanation: 'Line-by-line or block-by-block explanation of the code.',
      sample_io:   'Sample input and expected output.',
    };
    base.complexity_analysis = {
      time:  'Time complexity with justification (e.g., O(n log n) because...)',
      space: 'Space complexity with justification.',
      best_case:  'Best-case scenario.',
      worst_case: 'Worst-case scenario.',
    };
    // Remove real_life_example from code — not needed
    base.real_life_example = 'A use case where this algorithm/code is used in production systems.';
  }

  // Derivation / proof questions
  if (isDeriv) {
    base.derivation_steps = [
      'Step 1: Start with [assumption/axiom].',
      'Step 2: Apply [theorem/rule/identity].',
      'Step 3: Simplify to get...',
      '... continue until result.',
    ];
    base.formula = 'Final derived formula or result in plain text (use ^ for power, * for multiply).';
    base.explanation = 'Conceptual explanation of WHY this derivation works, not just the steps.';
  }

  // Solved example questions
  if (isSolve) {
    base.solved_example = {
      problem:        'The problem statement (with numbers if applicable).',
      approach:       'Which method/formula/technique to use and why.',
      solution_steps: ['Step 1: ...', 'Step 2: ...', 'Step 3: ...'],
      answer:         'Final answer with units/label.',
      verification:   'How to verify the answer (optional sanity check).',
    };
    base.formula = 'Key formula(s) used. Empty string if none.';
  }

  // Comparison questions
  if (isComp) {
    base.comparison = {
      header_a:  'First item name',
      header_b:  'Second item name',
      points: [
        { aspect: 'Aspect name (e.g. Speed)', a: 'Value for A', b: 'Value for B' },
        { aspect: 'Another aspect', a: '...', b: '...' },
      ],
      when_to_use_a: 'When A is preferred.',
      when_to_use_b: 'When B is preferred.',
    };
  }

  // Complexity analysis (standalone)
  if (qType === 'complexity' && !isCode) {
    base.complexity_analysis = {
      time:  'Time complexity with justification.',
      space: 'Space complexity with justification.',
      best_case: 'Best-case.',
      worst_case: 'Worst-case.',
      average_case: 'Average-case if applicable.',
    };
  }

  // Examples request
  if (qType === 'examples') {
    base.graded_examples = [
      { level: 'Basic', problem: '...', solution: '...' },
      { level: 'Intermediate', problem: '...', solution: '...' },
      { level: 'Advanced', problem: '...', solution: '...' },
    ];
  }

  // University-mode extras
  if (isUni) {
    base.university_exam_tip    = 'How this topic/question type appears in university exams. Mention marks weightage, common question patterns. Empty if unknown.';
    base.textbook_reference     = 'Exact chapter/section/page reference from the prescribed textbook. E.g. "CLRS Chapter 3, Section 3.1, pp. 43–52".';
    base.viva_questions         = ['Viva Q1?', 'Viva Q2?', 'Viva Q3?', 'Viva Q4?'];
  } else {
    base.university_exam_tip    = '';
    base.textbook_reference     = '';
    base.viva_questions         = [];
  }

  return base;
}

// ─── Main ask function ────────────────────────────────────────────────────────

async function ask(params) {
  const {
    subjectId, subjectName, chapterId, topicId,
    examCode,
    universitySubjectId, universityTopicId,
    studentQuery, studentClass, boardCode, grade,
    version,
  } = params;

  // ── 1. Detect question intelligence ─────────────────────────────────────────
  const qType   = detectQuestionType(studentQuery);
  const depth   = detectDepth(studentQuery);

  // ── 2. Fetch DB context (parallel) ──────────────────────────────────────────
  const [
    dbCtx,
    examCtxResult,
    uniTopicCtxResult,
  ] = await Promise.all([
    getAIContext({ subjectId: typeof subjectId === 'number' ? subjectId : null, chapterId: typeof chapterId === 'number' ? chapterId : null, topicId: typeof topicId === 'number' ? topicId : null }),
    examCode         ? getAIExamContext(examCode)          : Promise.resolve(null),
    universityTopicId ? getTopicContext(universityTopicId) : Promise.resolve(null),
  ]);

  let { ctx, chapter, topic } = dbCtx;
  
  if (!ctx && subjectName) {
    ctx = { board_name: boardCode || 'State Board', board_code: boardCode || '', board_type: 'State', version_name: 'Current Syllabus', academic_year_start: new Date().getFullYear(), is_current: 1, grade_label: grade ? `${grade}` : '', stream: 'general', subject_name: subjectName };
  }

  const examCtx     = examCtxResult;
  const uniTopicCtx = uniTopicCtxResult;

  const resolvedUniSubjectId = universitySubjectId || uniTopicCtx?.subject_id || null;
  const uniCtx = resolvedUniSubjectId ? await getAIUniversityContext(resolvedUniSubjectId) : null;

  // ── 3. Fetch recommended books ───────────────────────────────────────────────
  let recommendedBooks = [];
  if (uniCtx) {
    recommendedBooks = (await getUniversitySubjectBooks(resolvedUniSubjectId)).slice(0, 5);
  } else if (examCode) {
    const subjectHint = ctx?.subject_name || chapter?.title || null;
    recommendedBooks  = (await getRecommendedBooks({ examCode, subject: subjectHint, classLevel: 'beginner' })).slice(0, 5);
  } else if (subjectId && ctx) {
    const examHint = guessExamFromSubject(ctx.subject_name);
    if (examHint) {
      recommendedBooks = (await getRecommendedBooks({ examCode: examHint, subject: ctx.subject_name, classLevel: 'beginner' })).slice(0, 3);
    }
  }

  // ── 4a. NCERT context — for school mode with grade/chapter info ─────────────
  const mode = uniCtx ? 'university' : examCode ? 'competitive' : 'school';
  let ncertContext = '';
  if (mode === 'school' && ctx) {
    try {
      const chapterHint = chapter?.title || '';
      const gradeNum    = ctx.grade_label ? parseInt(ctx.grade_label, 10) : (params.grade || 0);
      if (gradeNum >= 1 && gradeNum <= 12) {
        ncertContext = fetchNCERTContext(gradeNum, ctx.subject_name, chapterHint) || '';
      }
    } catch { /* non-blocking */ }
  }

  // ── 4. Determine domain for Wikipedia topic ──────────────────────────────────
  const resolvedSubjectName = uniCtx?.subject_name || ctx?.subject_name || subjectName || '';
  const courseName  = uniCtx?.course_name  || '';
  const domain      = detectDomain(resolvedSubjectName, courseName);

  // The "topic to search" for Wikipedia
  const wikiTopic = uniTopicCtx?.topic_name
    || topic?.title
    || chapter?.title
    || uniCtx?.subject_name
    || ctx?.subject_name
    || studentQuery.split(' ').slice(0, 5).join(' ');

  // ── 5. Enrich with open-access content (Wikipedia + arXiv) ──────────────────
  const isAdvanced = depth === 'advanced';
  const { wikiSummary, papers } = await enrichContext({
    topic:        wikiTopic,
    subject:      subjectName,
    questionType: qType,
    isAdvanced,
  });

  // ── 6. Build the mega-prompt ─────────────────────────────────────────────────
  const prompt = buildPrompt({
    ctx, chapter, topic,
    examCtx, uniCtx, uniTopicCtx,
    recommendedBooks,
    wikiSummary, papers,
    ncertContext,
    studentQuery, studentClass, boardCode,
    qType, depth, domain, mode,
    version: version || 'latest',
  });

  // ── 7. Call AI — routing dynamically based on task ──────────────────────────
  const isReasoningTask = ['code', 'derivation', 'solve', 'complexity'].includes(qType) || depth === 'advanced';
  const result = await generateJSON(prompt, {
    task:        isReasoningTask ? 'reasoning' : 'fast',
    temperature: qType === 'code' || qType === 'derivation' ? 0.3 : 0.55,
    maxTokens:   4096,
  });

  // ── 7b. Fetch diagram if requested ──────────────────────────────────────────
  let diagramUrl = null;
  if (result.diagram_search_query) {
    diagramUrl = await fetchWikimediaImage(result.diagram_search_query);
  }

  // ── 8. Normalize and return ──────────────────────────────────────────────────
  return {
    // Core (always present)
    explanation:            result.explanation            || '',
    key_points:             Array.isArray(result.key_points)     ? result.key_points     : [],
    real_life_example:      result.real_life_example      || '',
    remember_this:          result.remember_this          || '',
    follow_up_question:     result.follow_up_question     || '',
    related_topics:         Array.isArray(result.related_topics) ? result.related_topics : [],
    syllabus_note:          result.syllabus_note          || '',
    exam_pattern_note:      result.exam_pattern_note      || '',
    diagram_url:            diagramUrl || null,

    // Code
    code_example:           result.code_example           || null,
    complexity_analysis:    result.complexity_analysis    || null,

    // Derivation / Math
    derivation_steps:       Array.isArray(result.derivation_steps) ? result.derivation_steps : [],
    formula:                result.formula                || '',

    // Solved example
    solved_example:         result.solved_example         || null,

    // Comparison
    comparison:             result.comparison             || null,

    // Graded examples
    graded_examples:        Array.isArray(result.graded_examples) ? result.graded_examples : [],

    // University-mode extras
    university_exam_tip:    result.university_exam_tip    || '',
    textbook_reference:     result.textbook_reference     || '',
    viva_questions:         Array.isArray(result.viva_questions)  ? result.viva_questions  : [],

    // Meta
    question_type:          qType,
    depth_level:            depth,

    // Books
    recommended_books: recommendedBooks.map(b => ({
      title:         b.title,
      author:        b.author,
      publisher:     b.publisher_name || b.publisher_short,
      usage_tip:     b.usage_tip,
      priority_rank: b.priority_rank,
      is_prescribed: b.is_prescribed,
    })),
  };
}

// ─── Mega Prompt Builder ──────────────────────────────────────────────────────

function buildPrompt({
  ctx, chapter, topic,
  examCtx, uniCtx, uniTopicCtx,
  recommendedBooks, wikiSummary, papers,
  ncertContext,
  studentQuery, studentClass, boardCode,
  qType, depth, domain, mode,
  version,
}) {
  const lines    = [];
  const isUni    = mode === 'university';
  const isExam   = mode === 'competitive';

  // ── Role & Persona ────────────────────────────────────────────────────────────
  lines.push('══════════════════════════════════════════════════════════');
  lines.push('ROLE & MISSION');
  lines.push('══════════════════════════════════════════════════════════');

  if (isUni && uniCtx) {
    const uniName  = uniCtx.university_name  || 'a top Indian university';
    const uniType  = uniCtx.university_type  || '';
    const course   = `${uniCtx.course_name} (${uniCtx.course_short})`;
    const semLabel = uniCtx.semester ? `Semester ${uniCtx.semester}` : '';
    const isIIT    = uniType === 'iit';
    const isAIIMS  = uniType === 'aiims';
    const isIIM    = uniType === 'iim';

    lines.push(`You are a world-class professor at ${uniName}, teaching ${uniCtx.subject_name} for ${course}${semLabel ? ', ' + semLabel : ''}.`);
    lines.push('');
    lines.push('You have:');
    lines.push(`  - 20+ years of teaching and research experience in ${uniCtx.subject_name}`);
    lines.push('  - Deep knowledge of ALL prescribed and reference textbooks for this subject');
    lines.push('  - Thorough understanding of university exam patterns, mark distributions, and viva expectations');
    lines.push('  - The ability to explain ANY question — from first-year basics to PhD-level depth');
    lines.push('');

    if (isIIT)   lines.push('Style: IIT-level rigor. First-principles thinking, mathematical proofs, algorithmic complexity analysis, research-grade depth when asked.');
    if (isAIIMS) lines.push('Style: AIIMS/medical precision. Clinical relevance, pathophysiology linkage, mnemonics for memory, MBBS exam pattern awareness.');
    if (isIIM)   lines.push('Style: IIM case-study approach. Business context, frameworks, real company examples, strategic analysis.');
    if (!isIIT && !isAIIMS && !isIIM) lines.push('Style: University exam-oriented. Cover theory, derivations, applications, solved examples. Match the question paper style of this subject.');

  } else if (isExam && examCtx) {
    lines.push(`You are an elite ${examCtx.name} coach and subject matter expert on Syllabrix.`);
    lines.push(`You have cracked ${examCtx.name} yourself and have coached 10,000+ students.`);
    lines.push('You know every previous year question, trick, shortcut, and scoring pattern for this exam.');
    lines.push('Answer in a way that maximises score — give both conceptual understanding AND exam techniques.');

  } else {
    lines.push('You are an expert AI tutor on Syllabrix — India\'s leading education platform.');
    lines.push('You teach students from Class 1 to PhD level across all subjects.');
    lines.push('Your goal: answer ANY question a student asks, at exactly the depth they need.');
    lines.push('Use simple analogies for beginners. Show full derivations for advanced learners. Write production code for coding questions.');
  }

  // ── Depth instructions ────────────────────────────────────────────────────────
  lines.push('');
  lines.push('══════════════════════════════════════════════════════════');
  lines.push(`DETECTED DEPTH: ${depth.toUpperCase()}`);
  lines.push('══════════════════════════════════════════════════════════');
  if (depth === 'beginner')      lines.push('The student is a beginner (e.g. Class 6-8). Use simple language, engaging storylines, visual analogies, and no jargon without explanation. Build strong intuition and make it fun, BUT STILL PROVIDE FULL COVERAGE OF THE TOPIC.');
  else if (depth === 'advanced') lines.push('The student wants deep, rigorous, research-level content like a UPSC exam candidate or top university student. Exclude childish analogies. Ensure immense factual depth, historical context, technical rigor, step-by-step mechanisms, formal notation, and textbook citations.');
  else                           lines.push('Intermediate level. Balance intuition with precision. Go into factual details thoroughly, showing key steps clearly.');

  // ── Context ───────────────────────────────────────────────────────────────────
  lines.push('');
  lines.push('══════════════════════════════════════════════════════════');
  lines.push('CURRICULUM CONTEXT');
  lines.push('══════════════════════════════════════════════════════════');

  if (examCtx) {
    lines.push(`Exam: ${examCtx.name} (${examCtx.code})`);
    lines.push(`Type: ${examCtx.type} | Level: ${examCtx.level}${examCtx.state ? ' | State: ' + examCtx.state : ''}`);
    if (examCtx.conducting_body) lines.push(`Conducting Body: ${examCtx.conducting_body}`);
    if (examCtx.pattern_summary) lines.push(`Exam Pattern Details: ${examCtx.pattern_summary}`);
  }

  if (ctx) {
    lines.push(`Board: ${ctx.board_name} (${ctx.board_code}) — ${ctx.board_type}`);
    lines.push(`Syllabus: ${ctx.version_name} (${ctx.academic_year_start}${ctx.is_current ? ' — CURRENT' : ' — OLDER'})`);
    lines.push(`Grade: ${ctx.grade_label}${ctx.stream !== 'general' ? ' | Stream: ' + ctx.stream : ''}`);
    lines.push(`Subject: ${ctx.subject_name}`);
  } else if (boardCode) {
    lines.push(`Board: ${boardCode.toUpperCase()}`);
  }

  if (studentClass) lines.push(`Student's class (self-reported): ${studentClass}`);

  // ── Syllabus Version Directive ─────────────────────────────────────────────
  const isLatest = !version || version === 'latest';
  lines.push('');
  lines.push('══════════════════════════════════════════════════════════');
  lines.push('SYLLABUS EDITION — CRITICAL DIRECTIVE');
  lines.push('══════════════════════════════════════════════════════════');
  if (isLatest) {
    lines.push('📗 EDITION: LATEST SYLLABUS (2024-2025, NEP 2020 Rationalized)');
    lines.push('STRICT RULE: Explain this topic ONLY as it appears in the current, rationalized NCERT/NEP 2024-25 curriculum.');
    lines.push('- DO NOT include chapters, experiments, or topics that were REMOVED in the rationalization (e.g. periodic classification by Dobereiner/Newlands, some evolution sub-chapters, deleted History themes, etc.)');
    lines.push('- Exam pattern notes must reflect current board exam (2024-25) marking scheme.');
    lines.push('- Align explanations with the currently active NCERT textbook edition for this grade/subject.');
  } else {
    lines.push('📕 EDITION: OLD / COMPREHENSIVE SYLLABUS (Pre-2023, Full Original NCERT)');
    lines.push('STRICT RULE: Explain this topic as it appeared in the FULL original NCERT textbook BEFORE the 2023 rationalization.');
    lines.push('- INCLUDE all chapters, sections, and topics that were removed: e.g. Dobereiner, Newlands periodic tables, full evolution chapter, deleted geography/history units, all original science experiments, etc.');
    lines.push('- This is the comprehensive version used before NEP cuts. Include all sub-topics, detailed treatments, and exercises from the unedited original book.');
    lines.push('- Exam pattern notes may reflect pre-2023 board patterns (more chapters, higher marks questions on now-deleted topics).');
  }

  if (uniCtx) {
    lines.push('');
    lines.push('UNIVERSITY:');
    if (uniCtx.university_name) lines.push(`  ${uniCtx.university_name} (${uniCtx.university_short || ''}) — ${uniCtx.university_type?.toUpperCase()}`);
    lines.push(`  Course: ${uniCtx.course_name} (${uniCtx.course_short})${uniCtx.specialization ? ' — ' + uniCtx.specialization : ''} | Level: ${uniCtx.course_level}`);
    if (uniCtx.semester) lines.push(`  Semester: ${uniCtx.semester}${uniCtx.year ? ' | Year: ' + uniCtx.year : ''}`);
    lines.push(`  Subject: ${uniCtx.subject_name}${uniCtx.subject_code ? ' (' + uniCtx.subject_code + ')' : ''} | Type: ${uniCtx.subject_type} | Credits: ${uniCtx.credits}`);
    if (uniCtx.syllabus_body) lines.push(`  Syllabus Body: ${uniCtx.syllabus_body}`);
  }

  if (uniTopicCtx) {
    lines.push('');
    lines.push('CHAPTER & TOPIC (from curriculum DB):');
    lines.push(`  Chapter ${uniTopicCtx.chapter_num}: ${uniTopicCtx.chapter_name}`);
    lines.push(`  Topic ${uniTopicCtx.topic_num}: ${uniTopicCtx.topic_name}`);
    if (uniTopicCtx.topic_desc) lines.push(`  Description: ${uniTopicCtx.topic_desc}`);
  }

  if (chapter && !uniTopicCtx) {
    lines.push('');
    lines.push(`CHAPTER: Chapter ${chapter.chapter_number}: ${chapter.title}`);
    if (chapter.description)          lines.push(`  ${chapter.description}`);
    if (chapter.key_concepts?.length) lines.push(`  Key Concepts: ${chapter.key_concepts.join(', ')}`);
  }

  if (topic && !uniTopicCtx) {
    lines.push(`TOPIC: ${topic.title}`);
    if (topic.bloom_levels?.length)       lines.push(`  Bloom's: ${topic.bloom_levels.join(', ')}`);
    if (topic.weightage_percent != null)  lines.push(`  Exam Weightage: ${topic.weightage_percent}%`);
    if (topic.is_deleted_in_new_syllabus) lines.push('  ⚠️ REMOVED in current NEP 2020 syllabus.');
  }

  // ── Prescribed books ──────────────────────────────────────────────────────────
  if (recommendedBooks.length) {
    lines.push('');
    lines.push('PRESCRIBED / RECOMMENDED TEXTBOOKS (from Syllabrix library):');
    lines.push('Your explanation should align with how these books explain this topic.');
    lines.push('Reference specific chapters/sections when relevant.');
    recommendedBooks.forEach((b, i) => {
      lines.push(`  ${i + 1}. "${b.title}" by ${b.author || 'N/A'} — ${b.publisher_name || b.publisher_short || ''}`);
      if (b.usage_tip) lines.push(`     Tip: ${b.usage_tip}`);
    });
  }

  // ── NCERT curriculum reference ────────────────────────────────────────────────
  if (ncertContext) {
    lines.push('');
    lines.push('NCERT OFFICIAL CURRICULUM (school mode — 23+ states + CBSE follow this):');
    lines.push(ncertContext);
    lines.push('Align your explanation with the NCERT approach. Use NCERT terminology and sequence.');
  }

  // ── Wikipedia enrichment ──────────────────────────────────────────────────────
  if (wikiSummary) {
    lines.push('');
    lines.push('OPEN-ACCESS REFERENCE (Wikipedia — use to add factual accuracy):');
    lines.push(wikiSummary);
  }

  // ── arXiv papers (advanced) ───────────────────────────────────────────────────
  if (papers?.length) {
    lines.push('');
    lines.push('RECENT RESEARCH PAPERS (arXiv — for advanced context):');
    papers.forEach(p => {
      lines.push(`  - "${p.title}" by ${p.authors}`);
      lines.push(`    ${p.summary}`);
    });
  }

  // ── The question ──────────────────────────────────────────────────────────────
  lines.push('');
  lines.push('══════════════════════════════════════════════════════════');
  lines.push('STUDENT\'S QUESTION');
  lines.push('══════════════════════════════════════════════════════════');
  lines.push(studentQuery);
  lines.push('');
  lines.push(`Detected question type: ${qType.toUpperCase()}`);
  lines.push(`Detected depth: ${depth.toUpperCase()}`);
  lines.push(`Domain: ${domain.toUpperCase()}`);

  // ── Question-type specific instructions ───────────────────────────────────────
  lines.push('');
  lines.push('══════════════════════════════════════════════════════════');
  lines.push('RESPONSE INSTRUCTIONS');
  lines.push('══════════════════════════════════════════════════════════');

  lines.push('1. Answer the EXACT question asked — never deflect with "refer to your textbook".');
  lines.push('2. Use ALL your training knowledge. You know the content of every standard textbook.');
  lines.push('3. EXHAUSTIVE DETAIL & MARKDOWN REQUIRED: Students come here because textbooks are confusing. NEVER provide just a 2 to 4 line summary. Write comprehensive, deep notes covering EVERY aspect. You MUST use strict Markdown formatting with multiple `## Headings`, `- Bullet points`, and `**bold key terms**` to make the explanation readable and structured.');
  lines.push('4. BOOKS & STUDY MATERIAL: At the end of your explanation, create a markdown heading `### Recommended Reference Material` and strictly cite 2-3 authentic textbooks, internet study resources, or official manuals exactly relevant to this topic.');
  lines.push('5. Always include practical applications — what is this used for in real systems?');
  lines.push('5. End every response with a question that challenges the student to think deeper.');
  lines.push('6. EXAM PATTERN FIRST: Always output an exam_pattern_note if the context involves an exam/subject.');
  lines.push('7. DIAGRAMS MATTER: If asked for a diagram/sketch, or if explaining visual concepts (e.g. brain, plant, engine), provide a 2-3 word diagram_search_query so the system can fetch a real sketch.');

  if (qType === 'code') {
    lines.push('');
    lines.push('CODE QUESTION RULES:');
    lines.push('  - Write complete, runnable, well-commented code (not pseudocode unless asked).');
    lines.push('  - Choose the language the student asked for. Default to Python if not specified.');
    lines.push('  - Include sample input/output in the code as comments or print statements.');
    lines.push('  - Analyze time AND space complexity. Mention best/worst/average cases.');
    lines.push('  - Mention any edge cases or common mistakes in the code_example.explanation.');
  }

  if (qType === 'derivation') {
    lines.push('');
    lines.push('DERIVATION RULES:');
    lines.push('  - Show EVERY step. Skip no intermediate algebraic manipulations.');
    lines.push('  - State the starting assumptions and any theorems/identities used at each step.');
    lines.push('  - End with the final result clearly stated.');
    lines.push('  - Explain intuitively WHY each transformation is valid.');
  }

  if (qType === 'solve') {
    lines.push('');
    lines.push('SOLVE RULES:');
    lines.push('  - State the formula or approach before applying it.');
    lines.push('  - Show unit analysis for numerical problems.');
    lines.push('  - Verify the answer using a sanity check or alternate method if possible.');
  }

  if (qType === 'compare') {
    lines.push('');
    lines.push('COMPARISON RULES:');
    lines.push('  - Cover at least 6 distinct aspects in the comparison table.');
    lines.push('  - Be specific — avoid vague statements like "A is faster than B" without quantification.');
    lines.push('  - Always conclude with clear guidance on WHEN to use each.');
  }

  if (depth === 'advanced') {
    lines.push('');
    lines.push('ADVANCED MODE:');
    lines.push('  - Include formal proofs, theorems, lemmas where appropriate.');
    lines.push('  - Mention limitations, edge cases, and open problems if relevant.');
    lines.push('  - Reference the specific textbook chapter (use your training knowledge).');
  }

  // ── Output schema ─────────────────────────────────────────────────────────────
  lines.push('');
  lines.push('══════════════════════════════════════════════════════════');
  lines.push('OUTPUT FORMAT');
  lines.push('══════════════════════════════════════════════════════════');
  lines.push('Return ONLY a valid JSON object. No markdown fences. No extra text.');
  lines.push('Schema (include ALL fields; use empty string/array/null for N/A fields):');
  lines.push('');

  const schema = buildSchema(qType, mode, domain);
  lines.push(JSON.stringify(schema, null, 2));

  lines.push('');
  lines.push('CRITICAL: Output ONLY the JSON. The response will be parsed with JSON.parse().');
  lines.push('Markdown is allowed INSIDE string values (e.g., **bold**, - bullet lists, `code`).');

  return lines.join('\n');
}

// ─── Heuristic: school subject → competitive exam ─────────────────────────────

function guessExamFromSubject(subjectName) {
  if (!subjectName) return null;
  const s = subjectName.toLowerCase();
  if (/history|geography|polity|economy|environment/.test(s)) return 'UPSC_IAS';
  if (/physics|chemistry|math/.test(s))                       return 'JEE_MAIN';
  if (/biology/.test(s))                                      return 'NEET_UG';
  if (/english|reasoning|aptitude/.test(s))                   return 'SSC_CGL';
  return null;
}

module.exports = { ask };
