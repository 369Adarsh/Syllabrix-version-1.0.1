const express = require('express');
const router = express.Router();

// PHASE 1
router.use('/auth', require('../features/auth/auth.routes'));
router.use('/posts', require('../features/posts/posts.routes'));
router.use('/likes', require('../features/likes/likes.routes'));
router.use('/comments', require('../features/comments/comments.routes'));
router.use('/shares', require('../features/shares/shares.routes'));
router.use('/saves', require('../features/saves/saves.routes'));
router.use('/upload', require('../features/upload/upload.routes'));
router.use('/profile', require('../features/profile/profile.routes'));
router.use('/follow', require('../features/follow/follow.routes'));
router.use('/messages', require('../features/messages/messages.routes'));
router.use('/groups', require('../features/groups/groups.routes'));
router.use('/jobs', require('../features/jobs/jobs.routes'));
router.use('/tuition', require('../features/tuition/tuition.routes'));
router.use('/search', require('../features/search/search.routes'));
router.use('/notifications', require('../features/notifications/notifications.routes'));
router.use('/parent', require('../features/parent/parent.routes'));
router.use('/safety', require('../features/safety/safety.routes'));

// PHASE 2
router.use('/live-classes', require('../features/live-classes/live-classes.routes'));
router.use('/materials', require('../features/materials/materials.routes'));
router.use('/endorsements', require('../features/endorsements/endorsements.routes'));
router.use('/ratings', require('../features/ratings/ratings.routes'));
router.use('/score', require('../features/score/score.routes'));

// PHASE 2.5 — PREPSMART
router.use('/prep/categories', require('../features/prep-categories/prep-categories.routes'));
router.use('/prep/exams', require('../features/prep-exams/prep-exams.routes'));
router.use('/prep/syllabus', require('../features/prep-syllabus/prep-syllabus.routes'));
router.use('/prep/current-affairs', require('../features/prep-current-affairs/prep-current-affairs.routes'));
router.use('/prep/quizzes', require('../features/prep-quizzes/prep-quizzes.routes'));
router.use('/prep/bookmarks', require('../features/prep-bookmarks/prep-bookmarks.routes'));

// PHASE 3 — EXPERIENCE LAB
router.use('/experience', require('../features/experience-lab/experience.routes'));
router.use('/experience/teams', require('../features/experience-teams/experience-teams.routes'));
router.use('/badges', require('../features/badges/badges.routes'));
router.use('/celebrations', require('../features/celebrations/celebrations.routes'));

// PHASE 4 — MENTORSHIP & SAFETY
router.use('/mentorship', require('../features/mentorship/mentorship.routes'));
router.use('/moderation', require('../features/moderation/moderation.routes'));

// AI FEATURES — Gemini Powered
router.use('/ai', require('../features/ai/ai.routes'));

// MILESTONE 3 — REVENUE
router.use('/payments', require('../features/payments/payments.routes'));

module.exports = router;
