const { pool } = require('../../database/connection');
const successResponse = (data) => ({ success: true, data });
const jobsService = require('./career-jobs.service');


// ── Helpers ───────────────────────────────────────────────────────────────────

async function upsertCareerProfile(userId, fields) {
  const cols = Object.keys(fields);
  if (cols.length === 0) return;
  const vals = Object.values(fields);
  const setClause = cols.map(c => `${c} = ?`).join(', ');
  await pool.query(
    `INSERT INTO career_profiles (user_id, ${cols.join(', ')})
     VALUES (?, ${cols.map(() => '?').join(', ')})
     ON DUPLICATE KEY UPDATE ${setClause}`,
    [userId, ...vals, ...vals]
  );
}

function calcProfileStrength(profile, skillProfile, resumeRow) {
  let score = 0;
  if (profile?.current_role)            score += 15;
  if (profile?.industry)                score += 10;
  if (profile?.experience_years > 0)    score += 10;
  if (profile?.career_goal)             score += 5;
  if (profile?.preferred_location)      score += 5;
  if (profile?.salary_expectation)      score += 5;
  
  const skills = Array.isArray(skillProfile?.skills_detected) 
    ? skillProfile.skills_detected 
    : [];
  if (skills.length > 0) score += 20;

  if (resumeRow?.resume_url)            score += 20;
  if (resumeRow?.ats_score > 0)         score += 10;
  return Math.min(score, 100);
}

// ── Handlers ──────────────────────────────────────────────────────────────────

exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  const [[profile]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
  return res.json(successResponse(profile || null));
};

exports.saveProfile = async (req, res) => {
  const userId = req.user.id;
  const allowed = [
    'current_role', 'current_company', 'experience_years',
    'industry', 'primary_domain', 'career_goal', 'target_role',
    'preferred_location', 'salary_expectation', 'mentorship_preference',
    'focus_priority', 'work_history', 'market_pulse', 'elite_employers'
  ];
  const fields = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) fields[k] = req.body[k]; });
  await upsertCareerProfile(userId, fields);
  const [[profile]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
  return res.json(successResponse(profile));
};

exports.completeOnboarding = async (req, res) => {
  const userId = req.user.id;
  await upsertCareerProfile(userId, { onboarding_completed: 1 });
  return res.json(successResponse({ completed: true }));
};

exports.getDashboardSummary = async (req, res) => {
  const userId = req.user.id;
  // Non-blocking refresh: fire and forget to prevent blocking dashboard ROI
  jobsService.autoRefreshIfNeeded(userId).catch(err => {
    console.error('[Dashboard Performance] BG Refresh Failed:', err?.message);
  });

  const [[profile]]      = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
  const [[skillProfile]] = await pool.query('SELECT * FROM career_skill_profiles WHERE user_id = ?', [userId]);
  const [[resumeRow]]    = await pool.query('SELECT * FROM career_resumes WHERE user_id = ? AND is_primary = 1 LIMIT 1', [userId]);
  const [[jobCount]]     = await pool.query(
    'SELECT COUNT(*) AS total, SUM(created_at >= NOW() - INTERVAL 1 DAY) AS new_today FROM career_job_matches WHERE user_id = ? AND is_active = 1',
    [userId]
  );
  const [topJobs] = await pool.query(
    'SELECT * FROM career_job_matches WHERE user_id = ? AND is_active = 1 ORDER BY fit_score DESC LIMIT 3',
    [userId]
  );
  const [learningPaths] = await pool.query(
    "SELECT * FROM career_learning_paths WHERE user_id = ? AND status IN ('not_started','in_progress') ORDER BY created_at DESC LIMIT 3",
    [userId]
  );

  // Skill gaps (Already parsed by mysql2 if JSON type)
  const skillGaps = Array.isArray(skillProfile?.skill_gaps) 
    ? skillProfile.skill_gaps.slice(0, 5) 
    : [];

  const skillsInDemand = Array.isArray(skillProfile?.skills_in_demand) 
    ? skillProfile.skills_in_demand.slice(0, 3) 
    : [];

  const strength = calcProfileStrength(profile, skillProfile, resumeRow);

  return res.json(successResponse({
    profile: profile || null,
    professional_id: req.user.professional_id || null,
    work_history: profile?.work_history || [],
    market_pulse: profile?.market_pulse || [],
    elite_employers: profile?.elite_employers || [],
    profileStrength: strength,
    marketFitScore: skillProfile?.market_fit_score || 0,
    marketPercentile: skillProfile?.market_percentile || null,
    skillsMatched: skillProfile?.total_skills_matched || 0,
    skillsDemanded: skillProfile?.total_skills_demanded || 0,
    skillGaps,
    skillsInDemand,
    skills: Array.isArray(skillProfile?.skills_detected) ? skillProfile.skills_detected : [],
    jobCount: jobCount?.total || 0,
    jobsNewToday: jobCount?.new_today || 0,
    topJobs,
    atsScore: resumeRow?.ats_score || 0,
    resume_url: resumeRow?.resume_url || null,
    missingKeywords: Array.isArray(resumeRow?.missing_keywords) ? resumeRow.missing_keywords : [],
    learningPaths,
    onboardingCompleted: profile?.onboarding_completed === 1,
  }));
}
