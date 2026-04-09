const { pool } = require('../../database/connection');
const successResponse = (data) => ({ success: true, data });
const { generateJSON } = require('../../services/ai.service');
const { extractTextFromPdfUrl } = require('../../utils/pdf-utils');

const callGeminiJSON = (prompt) => generateJSON(prompt, { task: 'json', temperature: 0.6, maxTokens: 4096 });

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapToCamelCase = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    skillsDetected: Array.isArray(row.skills_detected) ? row.skills_detected : JSON.parse(row.skills_detected || '[]'),
    skillsInDemand: Array.isArray(row.skills_in_demand) ? row.skills_in_demand : JSON.parse(row.skills_in_demand || '[]'),
    skillGaps: Array.isArray(row.skill_gaps) ? row.skill_gaps : JSON.parse(row.skill_gaps || '[]'),
    marketFitScore: row.market_fit_score || 0,
    marketPercentile: row.market_percentile || null,
    totalSkillsMatched: row.total_skills_matched || 0,
    totalSkillsDemanded: row.total_skills_demanded || 0,
    industry: row.industry || '',
    primaryDomain: row.primary_domain || '',
    lastAnalyzedAt: row.last_analyzed_at
  };
};

const normalizeSkillSignal = (data) => {
  // Ensure we have arrays and objects have expected keys
  const skills = Array.isArray(data.skills_detected) ? data.skills_detected : [];
  const gaps = Array.isArray(data.skill_gaps) ? data.skill_gaps : [];
  const trends = Array.isArray(data.skills_in_demand) ? data.skills_in_demand : [];

  return {
    skills_detected: skills.map(s => {
      const name = typeof s === 'string' ? s : s.name || s.skill;
      const level = s.level || 'intermediate';
      const type = s.type || 'secondary';
      return { name, level, type, source: s.source || 'resume' };
    }),
    skill_gaps: gaps.map(g => {
      const name = typeof g === 'string' ? g : g.name || g.skill;
      const gap_level = g.gap_level || 'missing';
      const demand_level = g.demand_level || 'medium';
      return { name, gap_level, demand_level };
    }),
    skills_in_demand: trends.map(t => {
      const name = typeof t === 'string' ? t : t.name || t.skill;
      const demand_growth = t.demand_growth || '+0%';
      const avg_salary_impact = t.avg_salary_impact || '+₹0 LPA';
      return { name, demand_growth, avg_salary_impact };
    }),
    industry: data.industry || 'Technology',
    primary_domain: data.primary_domain || '',
    market_fit_score: data.market_fit_score || 0,
    market_percentile: data.market_percentile || 50,
    total_skills_matched: data.total_skills_matched || 0,
    total_skills_demanded: data.total_skills_demanded || 0
  };
};

// ── Skill analysis ────────────────────────────────────────────────────────────

exports.analyzeSkills = async (req, res) => {
  const userId = req.user.id;
  let { resume_text, profile_data } = req.body;

  if (!resume_text && !profile_data) {
    return res.status(400).json({ success: false, message: 'Provide resume_text or profile_data' });
  }

  // Deep-dive: If it's a profile scan, try to pull the real PDF resume content
  if (profile_data && !resume_text) {
    const [[resume]] = await pool.query(
      'SELECT id, resume_url, resume_text FROM career_resumes WHERE user_id = ? AND is_primary = 1 LIMIT 1',
      [userId]
    );

    if (resume) {
      if (resume.resume_text) {
        resume_text = resume.resume_text;
      } else if (resume.resume_url) {
        try {
          console.log(`Extracting text from primary resume PDF: ${resume.resume_url}`);
          const extractedText = await extractTextFromPdfUrl(resume.resume_url);
          resume_text = extractedText;
          // Cache it for performance
          await pool.query('UPDATE career_resumes SET resume_text = ? WHERE id = ?', [extractedText, resume.id]);
        } catch (e) {
          console.error('PDF Deep-dive extraction failed:', e.message);
        }
      }
    }
  }

  const [[cp]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);

  // Step 1: Extract skills
  const extractPrompt = `Analyze this professional's skills.
${resume_text ? `PRIMARY SOURCE (Resume): ${resume_text.substring(0, 5000)}` : `PROFILE DATA: ${JSON.stringify(profile_data)}`}

Return ONLY valid JSON (no markdown):
{
  "skills_detected": [
    {"name": "Skill Name", "level": "expert/intermediate/beginner", "type": "primary/secondary", "source": "resume"}
  ],
  "industry": "Broad Industry Category",
  "primary_domain": "Specific Domain (e.g. Frontend, Data, SAP)",
  "experience_level": "entry/mid/senior"
}
Rules: 
- PRIMARY skills: Core technical competencies for the target domain (e.g. Java, SAP Security, Python).
- SECONDARY skills: Support tools, soft skills, or associated techs (e.g. Git, Docker, Communication).
- Include ALL technical skills, tools, frameworks, certs, and soft skills mentioned.`;

  const extractedRaw = await callGeminiJSON(extractPrompt);

  // Step 2: Market comparison
  const marketPrompt = `Given this professional's skills: ${JSON.stringify(extractedRaw.skills_detected)}
Industry: ${extractedRaw.industry}

Analyze current Indian job market demand for 2026.

Return ONLY valid JSON (no markdown):
{
  "skills_in_demand": [{"name": "High Demand Skill", "demand_growth": "+340%", "avg_salary_impact": "+₹3 LPA"}],
  "skill_gaps": [{"name": "Missing High-Value Skill", "gap_level": "missing/basic/beginner/needs_depth", "demand_level": "high/medium/low"}],
  "market_fit_score": 0-100,
  "market_percentile": 1-99,
  "total_skills_matched": number,
  "total_skills_demanded": number
}
Rules: Gaps should be specific skills they are MISSING based on industry standards for their domain.`;

  const marketRaw = await callGeminiJSON(marketPrompt);

  // Signal Normalization
  const clean = normalizeSkillSignal({ ...extractedRaw, ...marketRaw });

  // Save to DB
  await pool.query(
    `INSERT INTO career_skill_profiles
       (user_id, skills_detected, skills_in_demand, skill_gaps,
        market_fit_score, market_percentile, total_skills_matched, total_skills_demanded,
        industry, primary_domain, last_analyzed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       skills_detected = VALUES(skills_detected),
       skills_in_demand = VALUES(skills_in_demand),
       skill_gaps = VALUES(skill_gaps),
       market_fit_score = VALUES(market_fit_score),
       market_percentile = VALUES(market_percentile),
       total_skills_matched = VALUES(total_skills_matched),
       total_skills_demanded = VALUES(total_skills_demanded),
       industry = VALUES(industry),
       primary_domain = VALUES(primary_domain),
       last_analyzed_at = NOW()`,
    [
      userId,
      JSON.stringify(clean.skills_detected),
      JSON.stringify(clean.skills_in_demand),
      JSON.stringify(clean.skill_gaps),
      clean.market_fit_score,
      clean.market_percentile,
      clean.total_skills_matched,
      clean.total_skills_demanded,
      clean.industry || cp?.industry || '',
      clean.primary_domain || cp?.primary_domain || '',
    ]
  );

  // Update career profile with detected info
  if (clean.industry || clean.primary_domain) {
    await pool.query(
      `INSERT INTO career_profiles (user_id, industry, primary_domain)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         industry = COALESCE(NULLIF(VALUES(industry),''), industry),
         primary_domain = COALESCE(NULLIF(VALUES(primary_domain),''), primary_domain)`,
      [userId, clean.industry || '', clean.primary_domain || '']
    );
  }

  const [[saved]] = await pool.query('SELECT * FROM career_skill_profiles WHERE user_id = ?', [userId]);
  return res.json(successResponse(mapToCamelCase(saved)));
};

exports.updateSkills = async (req, res) => {
  const userId = req.user.id;
  const { skills } = req.body;
  
  if (!Array.isArray(skills)) {
    return res.status(400).json({ success: false, message: 'Skills must be an array' });
  }

  await pool.query(
    `INSERT INTO career_skill_profiles (user_id, skills_detected, last_analyzed_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE 
       skills_detected = VALUES(skills_detected),
       last_analyzed_at = NOW()`,
    [userId, JSON.stringify(skills)]
  );

  const [[row]] = await pool.query('SELECT * FROM career_skill_profiles WHERE user_id = ?', [userId]);
  return res.json(successResponse(mapToCamelCase(row)));
};

exports.scanResumeSkills = async (req, res) => {
  return exports.analyzeSkills(req, res);
};

// ── Simple reads ──────────────────────────────────────────────────────────────

exports.getSkillProfile = async (req, res) => {
  const [[row]] = await pool.query('SELECT * FROM career_skill_profiles WHERE user_id = ?', [req.user.id]);
  return res.json(successResponse(mapToCamelCase(row)));
};

exports.getSkillGaps = async (req, res) => {
  const [[row]] = await pool.query('SELECT skill_gaps FROM career_skill_profiles WHERE user_id = ?', [req.user.id]);
  const gaps = Array.isArray(row?.skill_gaps) ? row.skill_gaps : JSON.parse(row?.skill_gaps || '[]');
  return res.json(successResponse(gaps));
};

exports.getSkillTrends = async (req, res) => {
  const [[row]] = await pool.query('SELECT skills_in_demand FROM career_skill_profiles WHERE user_id = ?', [req.user.id]);
  const trends = Array.isArray(row?.skills_in_demand) ? row.skills_in_demand : JSON.parse(row?.skills_in_demand || '[]');
  return res.json(successResponse(trends));
};

exports.getMarketFit = async (req, res) => {
  const [[row]] = await pool.query(
    'SELECT market_fit_score, market_percentile, industry FROM career_skill_profiles WHERE user_id = ?',
    [req.user.id]
  );
  return res.json(successResponse({
    score: row?.market_fit_score || 0,
    percentile: row?.market_percentile || null,
    industry: row?.industry || null,
  }));
};

exports.getSkillMatch = async (req, res) => {
  const [[row]] = await pool.query(
    'SELECT total_skills_matched, total_skills_demanded FROM career_skill_profiles WHERE user_id = ?',
    [req.user.id]
  );
  const [[gapCount]] = await pool.query(
    "SELECT JSON_LENGTH(skill_gaps) AS n FROM career_skill_profiles WHERE user_id = ?",
    [req.user.id]
  );
  return res.json(successResponse({
    matched: row?.total_skills_matched || 0,
    demanded: row?.total_skills_demanded || 0,
    gaps: gapCount?.n || 0,
  }));
};
