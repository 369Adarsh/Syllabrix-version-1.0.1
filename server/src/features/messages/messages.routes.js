const express = require('express');
const router = express.Router();
const controller = require('./messages.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { sanitizeBody } = require('../../middleware/sanitize.middleware');
const { sendMessageValidation } = require('./messages.validation');

// GET /api/messages/conversations — List all conversations
router.get('/conversations', authenticate, controller.getConversations);

// GET /api/messages/unread-count — Total unread count
router.get('/unread-count', authenticate, controller.getUnreadCount);

// GET /api/messages/:userId — Get conversation with user
router.get('/:userId', authenticate, controller.getConversation);

// POST /api/messages/:userId — Send message to user
router.post('/:userId', authenticate, sanitizeBody, sendMessageValidation, validate, controller.send);

// PUT /api/messages/:messageId/read — Mark as read
router.put('/:messageId/read', authenticate, controller.markRead);

// DELETE /api/messages/:messageId — Delete message (own side)
router.delete('/:messageId', authenticate, controller.remove);

module.exports = router;
