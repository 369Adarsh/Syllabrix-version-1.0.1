const { pool } = require('../../database/connection');
const axios   = require('axios');
const successResponse = (data) => ({ success: true, data });
const { generateJSON } = require('../../services/ai.service');

const callGeminiJSON = (prompt) => generateJSON(prompt, { task: 'json', temperature: 0.7, maxTokens: 6000 });

// ── JSearch (RapidAPI) — real jobs from LinkedIn/Indeed/Glassdoor ─────────────
async function fetchRealJobs(query, location = 'India') {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return null;
  try {
    const res = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: { query, page: '1', num_pages: '2', country: 'in', date_posted: 'month' },
      headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'jsearch.p.rapidapi.com' },
      timeout: 10000,
    });
    return res.data?.data || [];
  } catch (err) {
    console.error('[JSearch] fetch failed:', err.message);
    return null;
  }
}

function formatSalary(job) {
  if (!job.job_min_salary && !job.job_max_salary) return null;
  const fmt = (n) => {
    if (!n) return null;
    const lpa = (n / 100000).toFixed(1);
    return `₹${lpa}L`;
  };
  const min = fmt(job.job_min_salary);
  const max = fmt(job.job_max_salary);
  if (min && max) return `${min}–${max} PA`;
  return min || max;
}

function normaliseJobType(t) {
  if (!t) return 'full_time';
  const m = { FULLTIME: 'full_time', PARTTIME: 'part_time', CONTRACTOR: 'contract', INTERN: 'internship' };
  return m[t] || t.toLowerCase();
}

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
    "apply_url": "https://careers.google.com/jobs/results/?q=Senior+Solutions+Architect&location=Bangalore"
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
    "apply_url": "https://apply.deloitte.com/careers/SearchJobs/SAP%20BTP%20Consultant?listFilterMode=1"
  }
]

CRITICAL RULES for apply_url — read carefully:
- apply_url MUST be the company's OWN career portal with the role title embedded as a search/filter parameter — so the user lands directly on filtered results for that role.
- NEVER use LinkedIn, Naukri, Indeed, Glassdoor, or any third-party job board.
- NEVER use a homepage like "https://careers.deloitte.com" with no search params — the user must not have to search manually.
- The URL must open filtered results on the COMPANY'S OWN website showing that specific role.
- Use the company's actual careers search endpoint. Examples of correct patterns:
  • Google → https://careers.google.com/jobs/results/?q={role}&location={location}
  • Microsoft → https://jobs.microsoft.com/global/en/search?q={role}&lc={location}
  • Amazon → https://www.amazon.jobs/en/search?query={role}&country=IND&city={location}
  • SAP → https://jobs.sap.com/search/?q={role}&localefilter=India
  • IBM → https://www.ibm.com/employment/search.html?q={role}&country=IN
  • Deloitte → https://apply.deloitte.com/careers/SearchJobs/{role}?listFilterMode=1
  • Accenture India → https://www.accenture.com/in-en/careers/jobsearch?q={role}&lc=India
  • Infosys → https://career.infosys.com/joblist#SearchKey={role}
  • TCS → https://ibegin.tcs.com/iBegin/#searchresult/{role}/{location}
  • Wipro → https://careers.wipro.com/careers-home/jobs?q={role}&location={location}
  • HCL → https://www.hcltech.com/careers/job-search?searchKeyword={role}
  • Cognizant → https://careers.cognizant.com/global/en/search-results?keywords={role}&location={location}
  • Capgemini → https://www.capgemini.com/in-en/careers/job-search/?search_term={role}&country=India
  • Tech Mahindra → https://careers.techmahindra.com/search/#q={role}&location={location}
  • L&T → https://www.lnttechservices.com/careers/job-search?q={role}
  • Mindtree → https://careers.mindtree.com/jobs?q={role}&location={location}
  • Mphasis → https://careers.mphasis.com/jobs?q={role}&location={location}
  • Hexaware → https://hexaware.com/careers/job-search/?q={role}
  • Oracle India → https://careers.oracle.com/jobs?q={role}&country=IN
  • Salesforce India → https://www.salesforce.com/company/careers/india/search/?q={role}
  • Adobe India → https://adobe.wd5.myworkdayjobs.com/external_experienced?q={role}&locationCountry=India
  • Cisco India → https://jobs.cisco.com/jobs/SearchJobs/{role}?21178=%5B167%5D
- For any company not listed above: use their official careers site search URL with the role as a query param. If you cannot determine the exact search URL pattern, use https://www.google.com/search?q={role}+{company}+careers+{location}&ibp=htl;jobs as fallback (Google Jobs pulls directly from company career pages).
- URL-encode the role title (spaces → +, special chars encoded).
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

  const { createNotification } = require('../notifications/notifications.service');
  createNotification({
    user_id: userId, type: 'job_alert', actor_id: null,
    reference_id: null, reference_type: null,
    message: `🎯 Job Radar updated — ${jobs.length} new matches found based on your profile!`,
  }).catch(() => {});

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

exports.searchCompanyJobs = async (req, res) => {
  const userId = req.user.id;
  const { company, role = '' } = req.body;

  if (!company?.trim()) {
    return res.status(400).json({ success: false, message: 'Company name is required.' });
  }

  // ── No RapidAPI key → honest error ──────────────────────────────────────────
  if (!process.env.RAPIDAPI_KEY) {
    return res.status(503).json({
      success: false,
      message: 'Real job search requires a RapidAPI key. Add RAPIDAPI_KEY to your server .env (free at rapidapi.com → JSearch).',
      setup_required: true,
    });
  }

  const [[cp]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
  const [[sp]] = await pool.query('SELECT * FROM career_skill_profiles WHERE user_id = ?', [userId]);

  const skills = Array.isArray(sp?.skills_detected)
    ? sp.skills_detected.slice(0, 15).map(s => s.name)
    : [];

  // ── Step 1: Build a profile-aware JSearch query ────────────────────────────
  const userRole    = cp?.current_role || '';
  const topSkills   = skills.slice(0, 3).join(' ');
  const searchRole  = role.trim() || userRole;

  // Query is: "<role/skills> at <company> India" so JSearch returns relevant roles
  const query = searchRole
    ? `${searchRole} ${topSkills} at ${company.trim()} India`
    : `${company.trim()} jobs India`;

  const rawJobs = await fetchRealJobs(query);

  if (!rawJobs || rawJobs.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No job listings found for "${company}" matching your profile right now. Try a different search or check back later.`,
    });
  }

  // ── Step 2: Normalise JSearch → our schema ─────────────────────────────────
  const companyDomain = company.toLowerCase().replace(/\s+/g, '') + '.com';
  const normalised = rawJobs.slice(0, 15).map(j => ({
    company_name:        j.employer_name || company,
    company_logo:        j.employer_logo || `https://logo.clearbit.com/${companyDomain}`,
    role_title:          j.job_title,
    location:            [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', ') || 'India',
    salary_range:        formatSalary(j),
    job_type:            normaliseJobType(j.job_employment_type),
    experience_required: null,
    apply_url:           j.job_apply_link || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(j.job_title + ' ' + company)}&location=India`,
    description_snippet: (j.job_description || '').slice(0, 400),
    required_skills:     j.job_required_skills || [],
    posted_at:           j.job_posted_at_datetime_utc || null,
    source:              'real',
  }));

  // ── Step 3: AI scores fit and filters by profile relevance ─────────────────
  const fitPrompt = `You are a career advisor. Score each job's fit for this candidate.

CANDIDATE:
- Experience: ${cp?.experience_years || 0} years
- Current role: ${userRole || 'Professional'}
- Skills: ${skills.join(', ') || 'general skills'}
- Industry: ${cp?.industry || 'Technology'}
- Target role searched: ${searchRole || company}

JOBS (${normalised.length} items):
${normalised.map((j, i) => `${i}. "${j.role_title}" at ${j.company_name}${j.description_snippet ? ' — ' + j.description_snippet.slice(0, 200) : ''}`).join('\n')}

Score each job STRICTLY against the candidate's background. A job with no relevance to their skills must score below 30.

Return ONLY a JSON array of ${normalised.length} objects in the SAME ORDER:
[{ "fit_score": 0-100, "fit_category": "high"|"medium"|"stretch", "match_reasons": ["..."], "missing_skills": ["..."], "experience_required": "X-Y years" }]`;

  let fitScores = [];
  try {
    fitScores = await callGeminiJSON(fitPrompt) || [];
  } catch { /* non-fatal — use defaults */ }

  const enriched = normalised.map((job, i) => {
    const fit = fitScores[i] || {};
    return {
      ...job,
      fit_score:           fit.fit_score           ?? 50,
      fit_category:        fit.fit_category        ?? 'medium',
      match_reasons:       fit.match_reasons        ?? [],
      missing_skills:      fit.missing_skills       ?? [],
      experience_required: fit.experience_required  ?? job.experience_required,
    };
  });

  // Sort by fit score, filter out irrelevant jobs (score < 30) unless fewer than 3 remain
  const sorted = enriched.sort((a, b) => b.fit_score - a.fit_score);
  const relevant = sorted.filter(j => j.fit_score >= 30);
  const result   = relevant.length >= 3 ? relevant : sorted.slice(0, 5);

  return res.json({ success: true, data: result, company, profile_matched: true });
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
