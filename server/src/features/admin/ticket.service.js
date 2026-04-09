const { socialPool: pool } = require('../../database/connection');
const notificationService = require('../notifications/notifications.service');

class TicketService {
  /**
   * 1. CREATE TICKET (User Side)
   */
  async createTicket(userId, { subject, description, priority = 'medium', academic_doubt_id = null }) {
    const [result] = await pool.query(
      `INSERT INTO tickets (user_id, subject, description, priority, academic_doubt_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, subject, description, priority, academic_doubt_id]
    );
    
    const ticketId = result.insertId;

    // Optional: Log to activity_log if needed
    
    return { id: ticketId, message: 'Ticket raised successfully' };
  }

  /**
   * 2. LIST TICKETS (Admin Queue)
   */
  async listTickets(filters = {}, pagination = { page: 1, limit: 10 }) {
    const { status, priority, user_id } = filters;
    const offset = (pagination.page - 1) * pagination.limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      whereClause += ' AND t.status = ?';
      params.push(status);
    }
    if (priority && priority !== 'all') {
      whereClause += ' AND t.priority = ?';
      params.push(priority);
    }
    if (user_id) {
      whereClause += ' AND t.user_id = ?';
      params.push(user_id);
    }

    const query = `
      SELECT t.*, u.username, u.full_name, u.email
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const countQuery = `SELECT COUNT(*) as total FROM tickets t ${whereClause}`;

    const [rows] = await pool.query(query, [...params, pagination.limit, offset]);
    const [[{ total }]] = await pool.query(countQuery, params);

    return {
      tickets: rows,
      total,
      totalPages: Math.ceil(total / pagination.limit),
      currentPage: pagination.page
    };
  }

  /**
   * 3. GET TICKET DETAILS & HISTORY
   */
  async getTicketDetails(ticketId) {
    const [tickets] = await pool.query(
      `SELECT t.*, u.username, u.full_name, u.email 
       FROM tickets t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = ?`,
      [ticketId]
    );

    if (tickets.length === 0) throw new Error('Ticket not found');
    const ticket = tickets[0];

    const [replies] = await pool.query(
      `SELECT c.*, u.username as author_name 
       FROM ticket_conversations c 
       LEFT JOIN users u ON c.author_id = u.id 
       WHERE c.ticket_id = ? 
       ORDER BY c.created_at ASC`,
      [ticketId]
    );

    return { ...ticket, conversation: replies };
  }

  /**
   * 4. ADD REPLY & NOTIFY
   */
  async addReply(ticketId, authorId, authorType, message) {
    // 1. Insert Reply
    await pool.query(
      `INSERT INTO ticket_conversations (ticket_id, author_id, author_type, message) 
       VALUES (?, ?, ?, ?)`,
      [ticketId, authorId, authorType, message]
    );

    // 2. Mark ticket as 'in_progress' if an admin is replying to an 'open' ticket
    if (authorType === 'admin') {
      await pool.query(
        "UPDATE tickets SET status = 'in_progress', updated_at = NOW() WHERE id = ? AND status = 'open'",
        [ticketId]
      );
    } else {
      await pool.query("UPDATE tickets SET updated_at = NOW() WHERE id = ?", [ticketId]);
    }

    // 3. Notify User if Admin replied
    if (authorType === 'admin') {
      const [ticket] = await pool.query('SELECT user_id, subject FROM tickets WHERE id = ?', [ticketId]);
      if (ticket.length > 0) {
        await notificationService.createNotification({
          user_id: ticket[0].user_id,
          actor_id: authorId,
          action_type: 'ticket_reply',
          entity_type: 'ticket',
          entity_id: ticketId,
          content: `Admin replied to your ticket: "${ticket[0].subject}"`
        });
      }
    }

    return { success: true };
  }

  /**
   * 5. RESOLVE TICKET
   */
  async updateStatus(ticketId, status, adminId) {
    await pool.query(
      "UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, ticketId]
    );

    // Notify user of resolution
    if (status === 'resolved') {
      const [ticket] = await pool.query('SELECT user_id, subject FROM tickets WHERE id = ?', [ticketId]);
      if (ticket.length > 0) {
        await notificationService.createNotification({
          user_id: ticket[0].user_id,
          actor_id: adminId,
          action_type: 'ticket_resolved',
          entity_type: 'ticket',
          entity_id: ticketId,
          content: `Hurray! Your ticket "${ticket[0].subject}" has been marked as RESOLVED.`
        });
      }
    }

    return { success: true, status };
  }
}

module.exports = new TicketService();
