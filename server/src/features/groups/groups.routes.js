const express = require('express');
const router = express.Router();
const controller = require('./groups.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { sanitizeBody } = require('../../middleware/sanitize.middleware');
const { requireAgePermission } = require('../../middleware/age-gate.middleware');
const {
  createGroupValidation, updateGroupValidation,
  sendGroupMessageValidation, addMemberValidation, changeRoleValidation,
} = require('./groups.validation');

// POST /api/groups — Create group
router.post('/', authenticate, requireAgePermission('canJoinGroups'), sanitizeBody, createGroupValidation, validate, controller.create);

// GET /api/groups — My groups
router.get('/', authenticate, controller.getUserGroups);

// GET /api/groups/:groupId — Group details
router.get('/:groupId', authenticate, controller.getById);

// PUT /api/groups/:groupId — Update group
router.put('/:groupId', authenticate, sanitizeBody, updateGroupValidation, validate, controller.update);

// DELETE /api/groups/:groupId — Delete group
router.delete('/:groupId', authenticate, controller.remove);

// GET /api/groups/:groupId/members — List members
router.get('/:groupId/members', authenticate, controller.getMembers);

// POST /api/groups/:groupId/members — Add member
router.post('/:groupId/members', authenticate, addMemberValidation, validate, controller.addMember);

// DELETE /api/groups/:groupId/members/:userId — Remove member
router.delete('/:groupId/members/:userId', authenticate, controller.removeMember);

// PUT /api/groups/:groupId/members/:userId — Change role
router.put('/:groupId/members/:userId', authenticate, changeRoleValidation, validate, controller.changeMemberRole);

// POST /api/groups/:groupId/leave — Leave group
router.post('/:groupId/leave', authenticate, controller.leaveGroup);

// GET /api/groups/:groupId/messages — Get group messages
router.get('/:groupId/messages', authenticate, controller.getMessages);

// POST /api/groups/:groupId/messages — Send group message
router.post('/:groupId/messages', authenticate, sanitizeBody, sendGroupMessageValidation, validate, controller.sendMessage);

module.exports = router;
