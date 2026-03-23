const express = require('express');
const router = express.Router();
const ctrl = require('./notifications.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/', authenticate, ctrl.getNotifications);
router.get('/unread-count', authenticate, ctrl.getUnreadCount);
router.put('/read-all', authenticate, ctrl.markAllRead);
router.put('/:notifId/read', authenticate, ctrl.markRead);
router.delete('/:notifId', authenticate, ctrl.remove);

module.exports = router;
