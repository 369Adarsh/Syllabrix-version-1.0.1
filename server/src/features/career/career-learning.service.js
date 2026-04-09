const { pool } = require('../../database/connection');
const successResponse = (data) => ({ success: true, data });
const { generateJSON } = require('../../services/ai.service');

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const callGeminiJSON = (prompt, opts = {}) => generateJSON(prompt, { task: 'json', temperature: 0.6, maxTokens: 4096, ...opts });

/**
 * Calibrates the learner's current level for a specific skill based on resume and profile.
 */
async function calibrateLearner(skillName, userData = {}) {
  const { profile = {}, resume = {}, skills = [] } = userData;
  
  const prompt = `Calibrate the learner's current level for the skill: ${skillName}
  
  RESOURSE CONTEXT:
  - Career Profile: ${JSON.stringify(profile)}
  - Resume Summary: ${resume.ai_summary || 'No summary available'}
  - Detected Skills: ${JSON.stringify(skills)}

  Return ONLY valid JSON:
  {
    "skill_tier": 1-10,
    "current_category": "beginner/intermediate/advanced",
    "analysis": "Briefly explain why they fall into this category for this specific skill.",
    "skipped_concepts": ["Concept 1", "Concept 2"]
  }
  Rules: Be very strict. If they have no direct experience in this specific skill, they are Tier 1 (Beginner).`;

  try {
    return await callGeminiJSON(prompt);
  } catch (e) {
    return { skill_tier: 1, current_category: 'beginner', analysis: 'Defaulting to beginner due to analysis failure.' };
  }
}

/**
 * Generates a detailed, adaptive learning plan.
 */
async function generateLearningPlan(skillName, calibration, totalDays, userData = {}, config = {}) {
  const { profile = {}, targetRole = 'IT Professional' } = userData;
  const { mode = 'polish', focus = 'project' } = config;

  const prompt = `Create a world-class ${totalDays}-day professional learning roadmap for: ${skillName}
  
  LEARNER CALIBRATION:
  - Category: ${calibration.current_category} (Tier ${calibration.skill_tier}/10)
  - Mode: ${mode === 'polish' ? 'Polish Existing Skills' : 'Bridge Gap (New Learning)'}
  - Focus: ${focus}

  Return ONLY valid JSON:
  {
    "learning_outcomes": ["Outcomes..."],
    "career_alignment": "Brief summary",
    "daily_plan": [
      {
        "day": 1,
        "title": "Topic Name",
        "summary": "Focus.",
        "video_guide": { "search_query": "YouTube Search", "recommended_channel": "Channel" },
        "minutes": 60
      }
    ]
  }
  Rules: NO markers. NO markdown. Minimalist JSON. Focus on logical progression.`;

  return callGeminiJSON(prompt);
}

/**
 * Phase 1: Generates the Deep Theory.
 */
async function generateDayTheory(skillName, dayNumber, roadmapItem, calibration) {
  const sections = [
    { title: "FUNDAMENTAL GROUNDING", focus: "Origins, History, Core Definitions, and Primary Philosophy." },
    { title: "ARCHITECTURAL BLUEPRINT", focus: "Internal Structure, Patterns, Data Flow, and System-Level Architecture." },
    { title: "INDUSTRIAL IMPLEMENTATION", focus: "Step-by-step Technical 'How-to', Code Logic, and Mechanics." },
    { title: "STRATEGIC OPTIMIZATION", focus: "Pitfalls, Scaling, Performance Tuning, and Advanced Use-cases." }
  ];

  let cumulativeTheory = "";
  let studyMaterials = [];

  for (let i = 0; i < sections.length; i++) {
    console.log(`[AI Content Engine] Generating Slot ${i + 1} of 4: ${sections[i].title}...`);
    
    const prompt = `Generate a PROFESSIONAL TECHNICAL DEEP-DIVE (approx 500 words) for learning ${skillName} Day ${dayNumber}.
    
    CURRENT SLOT: ${sections[i].title}
    FOCUS: ${sections[i].focus}
    TARGET LEVEL: ${calibration.current_category}

    Return ONLY valid JSON:
    {
      "section_content": "Detailed, technical explanation (500 words min).",
      "resources": [ { "title": "Resource Name", "link": "https://...", "type": "official" } ]
    }
    Rules: Deep, professional knowledge only. No markers. Minimalist JSON.`;

    try {
      const response = await callGeminiJSON(prompt, { maxTokens: 1500 });
      cumulativeTheory += `\n\n### ${sections[i].title}\n${response.section_content}`;
      if (response.resources) studyMaterials = [...studyMaterials, ...response.resources];
      
      // Cooling period between slots to respect RPM/TPM
      if (i < sections.length - 1) {
        console.log(`[AI Quota Guard] Slot ${i+1} complete. Strategic Pause (20s) to clear provider limits...`);
        await sleep(20000);
      }
    } catch (e) {
      console.error(`[AI] Slot ${i + 1} failed:`, e.message);
      cumulativeTheory += `\n\n### ${sections[i].title}\n[Content generation for this slot is calibrating. Please retry later.]`;
    }
  }

  return {
    conceptual_theory: cumulativeTheory.trim(),
    study_materials: studyMaterials.slice(0, 5) // Keep it clean
  };
}

/**
 * Phase 2: Generates the Mastery Drills and Lab.
 */
async function generateDayDrills(skillName, dayNumber, roadmapItem, calibration) {
  const prompt = `Generate an ULTIMATE PRACTICAL DRILL BANK for Day ${dayNumber} of learning ${skillName}.
  
  TOPIC: ${roadmapItem.title}
  LEVEL: ${calibration.current_category}

  Return ONLY valid JSON:
  {
    "exercise_bank": [
       {
         "id": 1,
         "title": "Drill Name",
         "difficulty": "Tier",
         "description": "Precise task.",
         "blueprint": "Logic scaffold.",
         "checklist": ["Task A"]
       }
    ],
    "challenge_lab": {
       "title": "CAPSTONE: Industrial Final Project",
       "problem_statement": "Deep scenario.",
       "requirements": ["Req 1"],
       "blueprint": "Code scaffold.",
       "checklist": ["Validation X"]
    }
  }
  Rules:
  - YOU MUST GENERATE EXACTLY 15 ITEMS IN 'exercise_bank'. 
  - PROGRESSION: 5 Basic, 5 Intermediate, 5 Advanced.
  - LANGUAGE: Industrial-grade, concise technical English.`;

  return callGeminiJSON(prompt, { maxTokens: 4096 });
}

exports.generatePath = async (req, res) => {
  const userId = req.user.id;
  const { skill_name, total_days = 10, mode = 'polish', focus = 'project' } = req.body;

  if (!skill_name) return res.status(400).json({ success: false, message: 'skill_name is required' });

  // 1. Fetch Deep Context
  const [[cp]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
  const [[sp]] = await pool.query('SELECT skills_detected FROM career_skill_profiles WHERE user_id = ?', [userId]);
  const [[resume]] = await pool.query(
    'SELECT ai_summary FROM career_resumes WHERE user_id = ? AND is_primary = 1 LIMIT 1',
    [userId]
  );

  const allSkills = Array.isArray(sp?.skills_detected) ? sp.skills_detected : JSON.parse(sp?.skills_detected || '[]');

  // 2. Skill Calibration (Adaptive Analysis)
  const calibration = await calibrateLearner(skill_name, { profile: cp || {}, resume: resume || {}, skills: allSkills });

  // 3. Roadmap Generation
  const plan = await generateLearningPlan(
    skill_name, 
    calibration, 
    total_days, 
    { profile: cp || {}, resume: resume || {}, skills: allSkills },
    { mode, focus }
  );

  // 4. Persistence
  const [result] = await pool.query(
    `INSERT INTO career_learning_paths
       (user_id, skill_name, total_days, difficulty, daily_plan, career_alignment, status, generated_from)
     VALUES (?, ?, ?, ?, ?, ?, 'not_started', ?)`,
    [
      userId, 
      skill_name, 
      total_days, 
      calibration.current_category, 
      JSON.stringify(plan.daily_plan || []), 
      plan.career_alignment,
      mode === 'polish' ? 'manual' : 'skill_gap'
    ]
  );

  const [[saved]] = await pool.query('SELECT * FROM career_learning_paths WHERE id = ?', [result.insertId]);
  return res.json(successResponse({
    ...saved,
    calibration // Send calibration info for UI usage
  }));
};

exports.bridgeGap = async (req, res) => {
  const userId = req.user.id;
  const { job_id } = req.body;

  const [[job]] = await pool.query(
    'SELECT * FROM career_job_matches WHERE id = ? AND user_id = ?',
    [job_id, userId]
  );
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  const missingSkills = Array.isArray(job.missing_skills) ? job.missing_skills : JSON.parse(job.missing_skills || '[]');
  if (missingSkills.length === 0) {
    return res.json(successResponse({ message: 'No skill gaps for this job', paths: [] }));
  }

  const [[cp]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
  const [[resume]] = await pool.query(
    'SELECT ai_summary FROM career_resumes WHERE user_id = ? AND is_primary = 1 LIMIT 1',
    [userId]
  );

  const paths = [];

  // Generate a path for each missing skill (max 2 for job bridge performance)
  for (const skill of missingSkills.slice(0, 2)) {
    // Standard calibration for new skill
    const calibration = { skill_tier: 1, current_category: 'beginner', analysis: 'Starting fresh to bridge gap.' };
    
    const plan = await generateLearningPlan(skill, calibration, 7, { profile: cp || {}, targetRole: job.role_title }, { mode: 'bridge', focus: 'project' });
    
    const [result] = await pool.query(
      `INSERT INTO career_learning_paths
         (user_id, skill_name, total_days, difficulty, daily_plan, status, generated_from, source_job_id)
       VALUES (?, ?, 7, 'beginner', ?, 'not_started', 'job_bridge', ?)`,
      [userId, skill, JSON.stringify(plan.daily_plan || []), job_id]
    );
    paths.push({ id: result.insertId, skill_name: skill, total_days: 7 });
  }

  return res.json(successResponse({ paths, job_title: job.role_title, company: job.company_name }));
};

exports.listPaths = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, skill_name, total_days, difficulty, current_day, status, started_at, completed_at, generated_from
     FROM career_learning_paths WHERE user_id = ? ORDER BY
       FIELD(status,'in_progress','not_started','paused','completed'), created_at DESC`,
    [req.user.id]
  );
  return res.json(successResponse(rows));
};

exports.getPath = async (req, res) => {
  const [[row]] = await pool.query(
    'SELECT * FROM career_learning_paths WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!row) return res.status(404).json({ success: false, message: 'Learning path not found' });
  return res.json(successResponse(row));
};

exports.completeDay = async (req, res) => {
  const userId = req.user.id;
  const pathId = req.params.id;
  const { day } = req.body;

  const [[row]] = await pool.query(
    'SELECT * FROM career_learning_paths WHERE id = ? AND user_id = ?',
    [pathId, userId]
  );
  if (!row) return res.status(404).json({ success: false, message: 'Learning path not found' });

  const completedDays = Array.isArray(row.completed_days) ? row.completed_days : JSON.parse(row.completed_days || '[]');
  if (!completedDays.includes(day)) completedDays.push(day);

  const newCurrentDay = Math.max(row.current_day, day);
  const isComplete = completedDays.length >= row.total_days;

  const updates = {
    completed_days: JSON.stringify(completedDays),
    current_day: newCurrentDay,
    status: isComplete ? 'completed' : 'in_progress',
  };
  
  await pool.query(
    `UPDATE career_learning_paths SET
       completed_days = ?, current_day = ?, status = ?
       ${row.status === 'not_started' ? ', started_at = NOW()' : ''}
       ${isComplete ? ', completed_at = NOW()' : ''}
     WHERE id = ?`,
    [updates.completed_days, updates.current_day, updates.status, pathId]
  );

  return res.json(successResponse({ day_completed: day, total_completed: completedDays.length, is_path_complete: isComplete }));
};

exports.getGapSolution = async (req, res) => {
  const userId = req.user.id;
  const { skill_name } = req.body;

  if (!skill_name) return res.status(400).json({ success: false, message: 'skill_name is required' });

  const [[cp]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);

  const prompt = `Provide an "Extended Solution" for a professional missing this skill: ${skill_name}
 Industry: ${cp?.industry || 'Technology'}

 Return ONLY valid JSON (no markdown):
 {
   "skill_name": "${skill_name}",
   "importance_score": 95,
   "career_impact": "Impact...",
   "salary_uplift": "+₹2-4 LPA",
   "difficulty_to_bridge": "moderate",
   "time_to_proficiency": "4-6 weeks",
   "resolution_roadmap": [
     {"step": 1, "action": "Step description", "duration": "2 days"}
   ],
   "curated_resources": [
     {"title": "Doc", "link": "https://...", "type": "official"}
   ],
   "top_companies_hiring": ["Google", "SAP", "Microsoft"]
 }`;

  const solution = await callGeminiJSON(prompt);
  return res.json(successResponse(solution));
};

exports.clearPaths = async (req, res) => {
  const userId = req.user.id;
  await pool.query('DELETE FROM career_learning_paths WHERE user_id = ?', [userId]);
  return res.json(successResponse({ message: 'All learning paths cleared successfully' }));
};

exports.generateDayContent = async (req, res) => {
  const userId = req.user.id;
  const pathId = req.params.id;
  const { day } = req.body;

  const [[path]] = await pool.query(
    'SELECT * FROM career_learning_paths WHERE id = ? AND user_id = ?',
    [pathId, userId]
  );
  if (!path) return res.status(404).json({ success: false, message: 'Path not found' });

  const dailyPlan = Array.isArray(path.daily_plan) ? path.daily_plan : JSON.parse(path.daily_plan || '[]');
  const dayItem = dailyPlan.find(d => d.day === parseInt(day));
  if (!dayItem) return res.status(404).json({ success: false, message: 'Day not found in roadmap' });

  // If already has theory, return it
  if (dayItem.conceptual_theory) return res.json(successResponse(dayItem));

  // Otherwise, generate it deep
  try {
    const calibration = { current_category: path.difficulty || 'intermediate' };
    
    // Step 1: Generate Deep Theory (Phase 1)
    let theoryDetail = {};
    try {
      theoryDetail = await generateDayTheory(path.skill_name, day, dayItem, calibration);
    } catch (e) {
      console.error(`[AI] Phase 1 (Theory) failed for Day ${day}:`, e.message);
    }

    // Step 2: Generate Drills and Lab (Phase 2)
    let drillDetail = {};
    try {
      drillDetail = await generateDayDrills(path.skill_name, day, dayItem, calibration);
    } catch (e) {
      console.error(`[AI] Phase 2 (Drills) failed for Day ${day}:`, e.message);
    }

    // Update the local object with whatever we successfully got
    dayItem.conceptual_theory = theoryDetail.conceptual_theory || dayItem.conceptual_theory;
    dayItem.study_materials = theoryDetail.study_materials || dayItem.study_materials;
    dayItem.exercise_bank = drillDetail.exercise_bank || dayItem.exercise_bank || [];
    dayItem.challenge_lab = drillDetail.challenge_lab || dayItem.challenge_lab;

    // Persist back to DB
    await pool.query(
      'UPDATE career_learning_paths SET daily_plan = ? WHERE id = ?',
      [JSON.stringify(dailyPlan), pathId]
    );

    return res.json(successResponse(dayItem));
  } catch (e) {
    console.error('Day detail generation failed:', e);
    return res.status(500).json({ success: false, message: 'Failed to generate specific lab details. Please retry.' });
  }
};
