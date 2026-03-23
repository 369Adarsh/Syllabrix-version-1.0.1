const express = require('express');
const router = express.Router();
const controller = require('./follow.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAgePermission } = require('../../middleware/age-gate.middleware');
const { checkNotBlocked } = require('../../middleware/block-check.middleware');

// POST /api/follow/:userId — Toggle follow/unfollow (age-gated: 5-7 cannot follow)
router.post('/:userId', authenticate, requireAgePermission('canFollow'), checkNotBlocked, controller.toggleFollow);

// GET /api/follow/:userId/followers — Get followers list
router.get('/:userId/followers', authenticate, controller.getFollowers);

// GET /api/follow/:userId/following — Get following list
router.get('/:userId/following', authenticate, controller.getFollowing);

// GET /api/follow/:userId/status — Am I following this user?
router.get('/:userId/status', authenticate, controller.checkStatus);

// GET /api/follow/:userId/mutual — Mutual follows
router.get('/:userId/mutual', authenticate, controller.getMutual);

module.exports = router;
