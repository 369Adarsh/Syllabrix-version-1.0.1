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

  const [[cp]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
  const [[sp]] = await pool.query('SELECT * FROM career_skill_profiles WHERE user_id = ?', [userId]);

  const skills = Array.isArray(sp?.skills_detected)
    ? sp.skills_detected.slice(0, 15).map(s => s.name)
    : [];

  const roleHint = role.trim() ? `The user is specifically interested in "${role}" roles.` : '';

  const companyDomain = company.toLowerCase().replace(/\s+/g, '') + '.com';

  const prompt = `You are a career advisor for the Indian job market (2026).

Generate 8 realistic current job openings at "${company}" that match this professional's background.

CANDIDATE PROFILE:
- Experience: ${cp?.experience_years || 0} years
- Current role: ${cp?.current_role || 'Professional'}
- Skills: ${skills.join(', ') || 'General professional skills'}
- Industry: ${cp?.industry || 'Technology'}
- Location: ${cp?.preferred_location || 'India'}
${roleHint}

INSTRUCTIONS:
- All 8 jobs MUST be at "${company}" — no other companies.
- Generate a realistic mix of roles matching the candidate's profile: 3 high-fit, 3 medium-fit, 2 stretch.
- Use the company's REAL careers website for apply_url with the role as a search/query parameter.
- company_logo_url: use https://logo.clearbit.com/${companyDomain}

Return ONLY a valid JSON array, no markdown. Schema per object:
{
  "company_name": "${company}",
  "company_logo_url": "https://logo.clearbit.com/${companyDomain}",
  "role_title": "...",
  "location": "...",
  "salary_range": "₹X-Y LPA",
  "job_type": "full_time",
  "experience_required": "X-Y years",
  "fit_score": 0-100,
  "fit_category": "high" | "medium" | "stretch",
  "match_reasons": ["..."],
  "missing_skills": ["..."],
  "apply_url": "https://..."
}`;

  const jobs = await callGeminiJSON(prompt);
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return res.status(500).json({ success: false, message: 'Could not fetch jobs for this company. Try again.' });
  }

  return res.json({ success: true, data: jobs, company });
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
