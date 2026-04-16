const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler } = require('../../utils/async-handler');
const jobsService = require('./career-jobs.service');
const skillsService = require('./career-skills.service');
const resumeService = require('./career-resume.service');
const interviewService = require('./career-interview.service');
const learningService = require('./career-learning.service');
const onboardingService = require('./career-onboarding.service');
const certService = require('./career-certifications.service');

// All routes require authentication
router.use(authenticate);

// ── Onboarding ────────────────────────────────────────────────────────────────
router.get('/profile',               asyncHandler(onboardingService.getProfile));
router.post('/profile',              asyncHandler(onboardingService.saveProfile));
router.post('/onboarding/complete',  asyncHandler(onboardingService.completeOnboarding));

// ── Dashboard summary ─────────────────────────────────────────────────────────
router.get('/dashboard',             asyncHandler(onboardingService.getDashboardSummary));

// ── Market fit + skill match cards ───────────────────────────────────────────
router.get('/market-fit',            asyncHandler(skillsService.getMarketFit));
router.get('/skill-match',           asyncHandler(skillsService.getSkillMatch));

// ── Skills ────────────────────────────────────────────────────────────────────
router.get('/skills',                asyncHandler(skillsService.getSkillProfile));
router.get('/skills/gaps',           asyncHandler(skillsService.getSkillGaps));
router.get('/skills/trends',         asyncHandler(skillsService.getSkillTrends));
router.post('/skills',               asyncHandler(skillsService.updateSkills));
router.post('/skills/analyze',       asyncHandler(skillsService.analyzeSkills));
router.post('/skills/scan-resume',   asyncHandler(skillsService.scanResumeSkills));

// ── Jobs ─────────────────────────────────────────────────────────────────────
router.get('/jobs',                  asyncHandler(jobsService.listJobs));
router.get('/jobs/count',            asyncHandler(jobsService.getJobCount));
router.get('/jobs/:id',              asyncHandler(jobsService.getJob));
router.post('/jobs/refresh',         asyncHandler(jobsService.refreshJobMatches));
router.put('/jobs/:id/action',       asyncHandler(jobsService.updateJobAction));

// ── Resume ────────────────────────────────────────────────────────────────────
router.get('/resume/versions',       asyncHandler(resumeService.listVersions));
router.put('/resume/:id/set-primary', asyncHandler(resumeService.setPrimary));
router.get('/resume/ats-score',      asyncHandler(resumeService.getATSScore));
router.post('/resume/upload',        asyncHandler(resumeService.uploadResume));
router.post('/resume/calibrate',     asyncHandler(resumeService.calibrateResume));
router.post('/resume/analyze',       asyncHandler(resumeService.analyzeResume));
router.post('/resume/optimize',      asyncHandler(resumeService.optimizeResume));
router.post('/resume/cover-letter',  asyncHandler(resumeService.generateCoverLetter));

// ── Mock Interviews ────────────────────────────────────────────────────────────
router.get('/interview/history',     asyncHandler(interviewService.getHistory));
router.get('/interview/:id',         asyncHandler(interviewService.getInterview));
router.post('/interview/start',      asyncHandler(interviewService.startInterview));
router.post('/interview/answer',     asyncHandler(interviewService.submitAnswer));
router.post('/interview/evaluate',   asyncHandler(interviewService.evaluateInterview));

// ── Learning Paths ─────────────────────────────────────────────────────────────
router.get('/learning',              asyncHandler(learningService.listPaths));
router.get('/learning/:id',          asyncHandler(learningService.getPath));
router.post('/learning/generate',    asyncHandler(learningService.generatePath));
router.post('/learning/bridge-gap',  asyncHandler(learningService.bridgeGap));
router.put('/learning/:id/complete-day', asyncHandler(learningService.completeDay));
router.post('/learning/:id/generate-day', asyncHandler(learningService.generateDayContent));
router.post('/learning/clear',            asyncHandler(learningService.clearPaths));

// ── Certifications ────────────────────────────────────────────────────────────
router.get('/certifications',        asyncHandler(certService.list));
router.post('/certifications',       asyncHandler(certService.add));
router.put('/certifications/:id',    asyncHandler(certService.update));
router.delete('/certifications/:id', asyncHandler(certService.remove));

// ── Salary ────────────────────────────────────────────────────────────────────
router.get('/salary',                asyncHandler(async (req, res) => {
  // Placeholder — served by AI on demand in Phase E
  res.json({ success: true, data: null });
}));

module.exports = router;
