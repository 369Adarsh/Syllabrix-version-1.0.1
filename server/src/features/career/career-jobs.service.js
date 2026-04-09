const { pool } = require('../../database/connection');
const successResponse = (data) => ({ success: true, data });
const { generateJSON } = require('../../services/ai.service');

const callGeminiJSON = (prompt) => generateJSON(prompt, { task: 'json', temperature: 0.7, maxTokens: 6000 });

exports.autoRefreshIfNeeded = async (userId) => {
  const [[lastMatch]] = await pool.query(
    'SELECT created_at FROM career_job_matches WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  if (!lastMatch || (Date.now() - new Date(lastMatch.created_at).getTime() > TWELVE_HOURS)) {
    const mockReq = { user: { id: userId } };
    const mockRes = { json: (d) => d, status: () => ({ json: (d) => d }) };
    await exports.refreshJobMatches(mockReq, mockRes);
    return true;
  }
  return false;
};

exports.refreshJobMatches = async (req, res) => {
  const userId = req.user.id;

  const [[cp]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
  const [[sp]] = await pool.query('SELECT * FROM career_skill_profiles WHERE user_id = ?', [userId]);
  const [userRow] = await pool.query('SELECT full_name FROM users WHERE id = ? LIMIT 1', [userId]);

  if (!cp && !sp) {
    return res.status(400).json({ success: false, message: 'Complete your profile or upload a resume first to generate job matches.' });
  }

  const skills = Array.isArray(sp?.skills_detected) ? sp.skills_detected.slice(0, 25).map(s => s.name) : [];
  const workHistory = Array.isArray(cp?.work_history) ? cp.work_history : [];

  const prompt = `You are an expert career advisor for the Indian job market (2026).

Analyze this professional's COMPLETE profile (Resume + Work History + Skills) and generate 20 high-fidelity job recommendations.

PROFESSIONAL CONTEXT:
- Name: ${userRow?.[0]?.full_name || 'Professional'}
- Experience: ${cp?.experience_years || 0} years
- Current role: ${cp?.current_role || 'Not specified'}
- Core Skills: ${skills.join(', ') || 'Not analyzed yet'}
- Industry: ${cp?.industry || sp?.industry || 'Technology'}
- Work History Summary: ${workHistory.slice(0, 3).map(w => `${w.role} at ${w.company}`).join('; ') || 'See resume'}
- Location preference: ${cp?.preferred_location || 'India'}
- Salary expectation: ${cp?.salary_expectation || 'Market rate'}

TASK:
Generate 20 job recommendations. Provide a balanced mix across these categories:
- 5 Elite Matches (fit_category: "high"): Perfect alignment with current skills/experience.
- 10 Core Alignment (fit_category: "medium"): Strong matches needing minor upskilling.
- 5 Stretch Roles (fit_category: "stretch"): Ambitious roles 1-2 levels above current position.

Return ONLY a valid JSON array of objects (no markdown, no preamble). 
Format Example:
[
  {
    "company_name": "Google",
    "company_logo_url": "https://logo.clearbit.com/google.com",
    "role_title": "Senior Solutions Architect",
    "location": "Bangalore",
    "salary_range": "₹45-65 LPA",
    "job_type": "full_time",
    "experience_required": "8-12 years",
    "fit_score": 75,
    "fit_category": "stretch",
    "match_reasons": ["Next logic step in career path", "Strong existing cloud foundation"],
    "missing_skills": ["L7 Load Balancing at scale", "Distributed consensus protocols"],
    "apply_url": "https://www.google.com/about/careers"
  },
  {
    "company_name": "Deloitte",
    "company_logo_url": "https://logo.clearbit.com/deloitte.com",
    "role_title": "SAP BTP Consultant",
    "location": "Bangalore",
    "salary_range": "₹8-14 LPA",
    "job_type": "full_time",
    "experience_required": "3-5 years",
    "fit_score": 98,
    "fit_category": "high",
    "match_reasons": ["BTP governance experience matches perfectly"],
    "missing_skills": [],
    "apply_url": "https://careers.deloitte.com"
  }
]

Rules:
- apply_url must be the company's real careers page
- company_logo_url should be a valid high-resolution logo link (e.g. use https://logo.clearbit.com/domain.com)`;

  const jobs = await callGeminiJSON(prompt);

  if (!Array.isArray(jobs) || jobs.length === 0) {
    return res.status(500).json({ success: false, message: 'AI returned invalid job data' });
  }

  // Clear old matches, insert new ones
  await pool.query('UPDATE career_job_matches SET is_active = 0 WHERE user_id = ?', [userId]);

  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  for (const job of jobs) {
    await pool.query(
      `INSERT INTO career_job_matches
         (user_id, company_name, company_logo, role_title, location, salary_range, job_type,
          experience_required, fit_score, fit_category, match_reasons, missing_skills,
          apply_url, source, is_active, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ai_generated', 1, ?)`,
      [
        userId,
        job.company_name || '',
        job.company_logo_url || null,
        job.role_title || '',
        job.location || '',
        job.salary_range || '',
        job.job_type || 'full_time',
        job.experience_required || '',
        Math.min(100, Math.max(0, job.fit_score || 0)),
        ['high', 'medium', 'stretch'].includes(job.fit_category?.toLowerCase()) 
          ? job.fit_category.toLowerCase() 
          : 'medium',
        JSON.stringify(job.match_reasons || []),
        JSON.stringify(job.missing_skills || []),
        job.apply_url || '',
        expiry,
      ]
    );
  }

  return res.json(successResponse({ generated: jobs.length, message: `${jobs.length} job matches generated` }));
};

exports.listJobs = async (req, res) => {
  const userId = req.user.id;
  await exports.autoRefreshIfNeeded(userId).catch(() => {});
  const { category, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = 'WHERE user_id = ? AND is_active = 1';
  const params = [userId];
  if (category && ['high', 'medium', 'stretch'].includes(category)) {
    where += ' AND fit_category = ?';
    params.push(category);
  }

  const [jobs] = await pool.query(
    `SELECT * FROM career_job_matches ${where} ORDER BY fit_score DESC LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM career_job_matches ${where}`, params);

  return res.json(successResponse({ jobs, total, page: parseInt(page), limit: parseInt(limit) }));
};

exports.getJobCount = async (req, res) => {
  const userId = req.user.id;
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total,
            SUM(created_at >= NOW() - INTERVAL 1 DAY) AS new_today
     FROM career_job_matches WHERE user_id = ? AND is_active = 1`,
    [userId]
  );
  return res.json(successResponse({ total: row.total || 0, new_today: row.new_today || 0 }));
};

exports.getJob = async (req, res) => {
  const [[job]] = await pool.query(
    'SELECT * FROM career_job_matches WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  return res.json(successResponse(job));
};

exports.updateJobAction = async (req, res) => {
  const { action } = req.body;
  const valid = ['saved', 'applied', 'dismissed', 'interviewing'];
  if (!valid.includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' });

  await pool.query(
    'UPDATE career_job_matches SET user_action = ? WHERE id = ? AND user_id = ?',
    [action, req.params.id, req.user.id]
  );
  return res.json(successResponse({ updated: true }));
};
