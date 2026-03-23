const express = require('express');
const router = express.Router();
const ctrl = require('./ai.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// ─── Current Affairs (AI-powered) ────────────────────────────
router.get('/current-affairs', authenticate, ctrl.getAICurrentAffairs);
router.get('/current-affairs/range', authenticate, ctrl.getAICurrentAffairsRange);
router.post('/current-affairs/generate', authenticate, ctrl.generateAffairs);

// ─── Mind Map (REDESIGNED — goal-oriented, with notes) ───────
router.post('/mindmap', authenticate, ctrl.generateMindMap);
router.post('/mindmap/notes', authenticate, ctrl.getMindMapNotes);    // NEW: Study notes for any node

// ─── Career Guidance ─────────────────────────────────────────
router.post('/career/guidance', authenticate, ctrl.getStreamGuidance);
router.post('/career/compare', authenticate, ctrl.compareStreams);
router.post('/career/chat', authenticate, ctrl.careerChat);

// ─── Exam Details (AI-enhanced) ──────────────────────────────
router.get('/exam-details', authenticate, ctrl.getAIExamDetails);

// ─── Doubt Clearing ──────────────────────────────────────────
router.post('/doubt', authenticate, ctrl.clearDoubt);
router.post('/doubt/chat', authenticate, ctrl.doubtChat);

// ─── Experience Lab Task Resources (NEW) ─────────────────────
router.post('/experience/task-resources', authenticate, ctrl.getTaskResources);

module.exports = router;
