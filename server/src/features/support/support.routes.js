const express = require('express');
const router = express.Router();
const TicketController = require('../admin/ticket.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// All support routes require standard user authentication
router.use(authenticate);

/**
 * 1. CREATE TICKET
 */
router.post('/tickets', TicketController.createTicket);

/**
 * 2. LIST MY TICKETS
 */
router.get('/tickets', TicketController.listTickets);

/**
 * 3. GET TICKET DETAILS
 */
router.get('/tickets/:id', TicketController.getTicketDetails);

/**
 * 4. ADD REPLY
 */
router.post('/tickets/:id/reply', TicketController.addReply);

module.exports = router;
