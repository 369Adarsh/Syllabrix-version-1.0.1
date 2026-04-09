const { pool } = require('../../database/connection');
const successResponse = (data) => ({ success: true, data });
const { generateJSON, generateText } = require('../../services/ai.service');
const { extractTextFromPdfUrl } = require('../../utils/pdf-utils');
const skillsService = require('./career-skills.service');
const jobsService = require('./career-jobs.service');

const callGeminiJSON = (prompt) => generateJSON(prompt, { task: 'json', temperature: 0.5, maxTokens: 4096 });

exports.setPrimary = async (req, res) => {
  const userId = req.user.id;
  const resumeId = req.params.id;
  const [[row]] = await pool.query('SELECT id FROM career_resumes WHERE id = ? AND user_id = ?', [resumeId, userId]);
  if (!row) return res.status(404).json({ success: false, message: 'Resume not found' });
  await pool.query('UPDATE career_resumes SET is_primary = 0 WHERE user_id = ?', [userId]);
  await pool.query('UPDATE career_resumes SET is_primary = 1 WHERE id = ?', [resumeId]);
  return res.json(successResponse({ set_primary: true, resume_id: resumeId }));
};

exports.listVersions = async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, version_name, ats_score, is_primary, created_at, resume_url FROM career_resumes WHERE user_id = ? ORDER BY is_primary DESC, created_at DESC',
    [req.user.id]
  );
  return res.json(successResponse(rows));
};

exports.getATSScore = async (req, res) => {
  const [[row]] = await pool.query(
    'SELECT ats_score, missing_keywords FROM career_resumes WHERE user_id = ? AND is_primary = 1 LIMIT 1',
    [req.user.id]
  );
  return res.json(successResponse({
    score: row?.ats_score || 0,
    missing_keywords: Array.isArray(row?.missing_keywords) ? row.missing_keywords : [],
  }));
};

exports.uploadResume = async (req, res) => {
  const userId = req.user.id;
  const { resume_url, resume_text, version_name = 'General' } = req.body;

  if (!resume_url && !resume_text) {
    return res.status(400).json({ success: false, message: 'Provide resume_url or resume_text' });
  }

  // If there's already a primary, demote it
  await pool.query('UPDATE career_resumes SET is_primary = 0 WHERE user_id = ?', [userId]);

  const [result] = await pool.query(
    'INSERT INTO career_resumes (user_id, version_name, resume_url, resume_text, is_primary) VALUES (?, ?, ?, ?, 1)',
    [userId, version_name, resume_url || null, resume_text || null]
  );

  return res.json(successResponse({ id: result.insertId, message: 'Resume uploaded. Call /resume/analyze to score it.' }));
};

exports.analyzeResume = async (req, res) => {
  const userId = req.user.id;
  const { resume_id } = req.body;

  let row;
  if (resume_id) {
    [[row]] = await pool.query('SELECT * FROM career_resumes WHERE id = ? AND user_id = ?', [resume_id, userId]);
  } else {
    [[row]] = await pool.query('SELECT * FROM career_resumes WHERE user_id = ? AND is_primary = 1 LIMIT 1', [userId]);
  }

  if (!row || !row.resume_text) {
    return res.status(400).json({ success: false, message: 'No resume text found. Upload a resume with text first.' });
  }

  const [[cp]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
  const [[sp]] = await pool.query('SELECT * FROM career_skill_profiles WHERE user_id = ?', [userId]);

  const skills = Array.isArray(sp?.skills_detected) ? sp.skills_detected.map(s => s.name) : [];
  const workHistory = Array.isArray(cp?.work_history) ? cp.work_history : [];

  const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume for the Indian job market.
  
PROFESSIONAL PROFILE:
- Target role/industry: ${cp?.target_role || cp?.industry || 'Technology professional'}
- Experience: ${cp?.experience_years || 0} years
- Verified Skills: ${skills.join(', ')}
- Work History: ${workHistory.map(w => `${w.role} at ${w.company}`).join('; ')}

Resume text:
${row.resume_text.substring(0, 4000)}

Return ONLY valid JSON (no markdown):
{
  "ats_score": 78,
  "missing_keywords": ["RAP Model", "Clean Core", "Integration Suite"],
  "keyword_suggestions": [
    {"keyword": "SAP Integration Suite", "section_to_add": "Skills", "reason": "High demand keyword missing from resume"}
  ],
  "ai_summary": "Experienced SAP professional with 3 years...",
  "strengths": ["Strong BTP experience", "Multiple SAP certifications"],
  "improvements": ["Add quantified achievements", "Include more cloud keywords"]
}`;

  const analysis = await callGeminiJSON(prompt);

  await pool.query(
    `UPDATE career_resumes SET
       ats_score = ?, missing_keywords = ?, keyword_suggestions = ?, ai_summary = ?
     WHERE id = ?`,
    [
      analysis.ats_score || 0,
      JSON.stringify(analysis.missing_keywords || []),
      JSON.stringify(analysis.keyword_suggestions || []),
      analysis.ai_summary || '',
      row.id,
    ]
  );

  return res.json(successResponse(analysis));
};

exports.calibrateResume = async (req, res) => {
  const userId = req.user.id;
  const { resume_url } = req.body;

  if (!resume_url) {
    return res.status(400).json({ success: false, message: 'resume_url is required' });
  }

  try {
    // 1. Extract text from PDF
    const resumeText = await extractTextFromPdfUrl(resume_url);

    // 2. Save/Update main resume entry
    const [[existing]] = await pool.query(
      'SELECT id FROM career_resumes WHERE user_id = ? AND is_primary = 1 LIMIT 1', 
      [userId]
    );

    let resumeId;
    if (existing) {
      resumeId = existing.id;
      await pool.query(
        'UPDATE career_resumes SET resume_url = ?, resume_text = ? WHERE id = ?',
        [resume_url, resumeText, resumeId]
      );
    } else {
      const [result] = await pool.query(
        'INSERT INTO career_resumes (user_id, version_name, resume_url, resume_text, is_primary) VALUES (?, "Primary", ?, ?, 1)',
        [userId, resume_url, resumeText]
      );
      resumeId = result.insertId;
    }

    // 3. Extract Work History & Market Pulse Insights
    const historyPrompt = `Extract professional info and generate market insights from this resume.
Resume:
${resumeText.substring(0, 4000)}

Return ONLY valid JSON (no markdown):
{
  "full_name": "Extracted Name",
  "work_history": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "period": "Jan 2020 - Present",
      "description": "Short summary",
      "current": true
    }
  ],
  "market_pulse": [
    { "title": "Industry Trends", "desc": "Dynamic trend insight based on resume context", "stat": "+15% YoY", "icon": "trends" },
    { "title": "Salary Benchmark", "desc": "Median rewards for this role domain", "stat": "Apex Tier", "icon": "salary" },
    { "title": "Network Liquidity", "desc": "Hiring momentum in this sector", "stat": "Networking", "icon": "network" }
  ],
  "elite_employers": [
    { 
      "name": "Google / Microsoft / SAP etc.", 
      "salary_range": "₹25–45 LPA", 
      "hiring_velocity": "High", 
      "insight": "Focus on distributed systems and cloud architecture for this tier.",
      "about": "Brief company mission and market position.",
      "tech_stack": ["Cloud", "AI", "Microservices"],
      "culture_vibe": "Innovation-driven, fast-paced",
      "top_benefits": ["RSUs", "Comprehensive Health", "Learning Budget"]
    }
  ]
}`;

    const extraction = await callGeminiJSON(historyPrompt);
    
    // 4. Update Professional ID if missing
    const [[user]] = await pool.query('SELECT professional_id FROM users WHERE id = ?', [userId]);
    const pId = user.professional_id || `P-${userId.toString().padStart(11, '0')}`;
    if (!user.professional_id) {
      await pool.query('UPDATE users SET professional_id = ? WHERE id = ?', [pId, userId]);
    }

    // 5. Update Career Profile with History, Pulse & Elite Employers
    await pool.query(
      `UPDATE career_profiles 
       SET work_history = ?, market_pulse = ?, elite_employers = ?, resume_url = ? 
       WHERE user_id = ?`,
      [
        JSON.stringify(extraction.work_history || []), 
        JSON.stringify(extraction.market_pulse || []),
        JSON.stringify(extraction.elite_employers || []),
        resume_url,
        userId
      ]
    );

    // 6. Trigger Skill Analysis (Sync with Career Profile)
    const mockReq = { user: req.user, body: { resume_text: resumeText } };
    const mockRes = { 
      json: (data) => data, 
      status: () => ({ json: (data) => data }) 
    };
    await skillsService.analyzeSkills(mockReq, mockRes);

    // 7. Trigger ATS Analysis on the new text
    const analysisReq = { user: req.user, body: { resume_id: resumeId } };
    const analysis = await exports.analyzeResume(analysisReq, mockRes);

    // 8. Force Job Market Refresh (Sync with new profile)
    await jobsService.refreshJobMatches(mockReq, mockRes).catch(err => console.error('Job refresh during calibration failed:', err));

    return res.json(successResponse({
      message: 'Systematic calibration complete',
      resume_id: resumeId,
      professional_id: user.professional_id || `P-${userId.toString().padStart(11, '0')}`,
      work_history: extraction.work_history || [],
      analysis: analysis.data || analysis
    }));

  } catch (error) {
    console.error('Calibration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.optimizeResume = async (req, res) => {
  const userId = req.user.id;
  const { job_id, resume_id } = req.body;

  const [[job]] = await pool.query('SELECT * FROM career_job_matches WHERE id = ? AND user_id = ?', [job_id, userId]);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  let resumeRow;
  if (resume_id) {
    [[resumeRow]] = await pool.query('SELECT * FROM career_resumes WHERE id = ? AND user_id = ?', [resume_id, userId]);
  } else {
    [[resumeRow]] = await pool.query('SELECT * FROM career_resumes WHERE user_id = ? AND is_primary = 1 LIMIT 1', [userId]);
  }

  if (!resumeRow?.resume_text) {
    return res.status(400).json({ success: false, message: 'No resume text available' });
  }

  const prompt = `Optimize this resume specifically for the job listing below.

Job: ${job.role_title} at ${job.company_name}
Missing skills for this role: ${JSON.stringify(Array.isArray(job.missing_skills) ? job.missing_skills : [])}
Match reasons: ${JSON.stringify(Array.isArray(job.match_reasons) ? job.match_reasons : [])}

Current resume text:
${resumeRow.resume_text.substring(0, 2000)}

Return ONLY valid JSON (no markdown):
{
  "ats_score": 91,
  "missing_keywords": ["keyword1", "keyword2"],
  "ai_summary": "Rewritten professional summary targeting this specific role...",
  "ai_bullet_points": [
    {"section": "Experience", "original": "Worked on SAP projects", "enhanced": "Led 3 SAP BTP implementation projects reducing deployment time by 40%"}
  ],
  "optimization_tips": ["Add Integration Suite experience", "Quantify your BTP project outcomes"]
}`;

  const optimized = await callGeminiJSON(prompt);

  // Save as new version
  await pool.query('UPDATE career_resumes SET is_primary = 0 WHERE user_id = ?', [userId]);
  const [newRow] = await pool.query(
    `INSERT INTO career_resumes
       (user_id, version_name, resume_text, ats_score, missing_keywords,
        keyword_suggestions, ai_summary, ai_bullet_points, target_job_id, is_primary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      userId,
      `${job.company_name} — ${job.role_title}`,
      resumeRow.resume_text,
      optimized.ats_score || 0,
      JSON.stringify(optimized.missing_keywords || []),
      JSON.stringify([]),
      optimized.ai_summary || '',
      JSON.stringify(optimized.ai_bullet_points || []),
      job_id,
    ]
  );

  return res.json(successResponse({ ...optimized, resume_id: newRow.insertId }));
};

exports.generateCoverLetter = async (req, res) => {
  const userId = req.user.id;
  const { job_id } = req.body;

  const [[job]] = await pool.query('SELECT * FROM career_job_matches WHERE id = ? AND user_id = ?', [job_id, userId]);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  const [[cp]] = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
  const [[sp]] = await pool.query('SELECT skills_detected FROM career_skill_profiles WHERE user_id = ?', [userId]);

  const skills = sp?.skills_detected ? JSON.parse(sp.skills_detected).slice(0, 10).map(s => s.name) : [];

  const prompt = `Write a professional cover letter for this job application.

Applicant:
- Current role: ${cp?.current_role || 'Professional'}
- Experience: ${cp?.experience_years || 0} years
- Top skills: ${skills.join(', ') || 'Technology professional'}

Target job: ${job.role_title} at ${job.company_name}, ${job.location}
Salary range: ${job.salary_range}
Match reasons: ${JSON.stringify(Array.isArray(job.match_reasons) ? job.match_reasons : [])}

Write a compelling, professional cover letter in 3 paragraphs:
1. Opening — why this role and company
2. Body — specific experience and skills matching the role
3. Closing — call to action

Return the cover letter as plain text (no JSON, no markdown headers). Keep it under 300 words.`;

  const coverLetter = (await generateText(prompt, { task: 'default', temperature: 0.7, maxTokens: 1024 })).trim();

  // Save to primary resume
  await pool.query(
    'UPDATE career_resumes SET ai_cover_letter = ?, target_job_id = ? WHERE user_id = ? AND is_primary = 1',
    [coverLetter, job_id, userId]
  );

  return res.json(successResponse({ cover_letter: coverLetter }));
};
