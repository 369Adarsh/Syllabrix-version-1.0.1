const TicketService = require('./ticket.service');

class TicketController {
  /**
   * 1. CREATE TICKET
   */
  async createTicket(req, res) {
    try {
      const result = await TicketService.createTicket(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * 2. LIST TICKETS
   */
  async listTickets(req, res) {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority
      };
      
      // Users can only see their own tickets, Admins see all
      if (req.user.user_type !== 'syllabrix_admin' && req.user.admin_role !== 'super_admin') {
        filters.user_id = req.user.id;
      }

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await TicketService.listTickets(filters, pagination);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 3. GET TICKET DETAILS
   */
  async getTicketDetails(req, res) {
    try {
      const { id } = req.params;
      const ticket = await TicketService.getTicketDetails(id);
      
      // Privacy check
      if (req.user.user_type !== 'syllabrix_admin' && 
          req.user.admin_role !== 'super_admin' && 
          ticket.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied to this ticket' });
      }

      res.json(ticket);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * 4. ADD REPLY
   */
  async addReply(req, res) {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const authorType = (req.user.user_type === 'syllabrix_admin' || req.user.admin_role === 'super_admin') ? 'admin' : 'user';

      const result = await TicketService.addReply(id, req.user.id, authorType, message);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * 5. UPDATE STATUS (Admin Only)
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await TicketService.updateStatus(id, status, req.user.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new TicketController();
