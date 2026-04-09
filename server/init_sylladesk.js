const { socialPool: pool } = require('./src/database/connection');

async function initSyllaDesk() {
  console.log('--- Initializing SyllaDesk Ticketing Schema ---');
  
  try {
    // 1. Tickets Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        academic_doubt_id INT UNSIGNED DEFAULT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ticket_user (user_id),
        INDEX idx_ticket_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tickets table ready');

    // 2. Ticket Conversations Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_conversations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT UNSIGNED NOT NULL,
        author_id INT UNSIGNED NOT NULL,
        author_type ENUM('user', 'admin') NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_conversation_ticket (ticket_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Ticket Conversations table ready');

    process.exit(0);
  } catch (error) {
    console.error('❌ Schema initialization failed:', error.message);
    process.exit(1);
  }
}

initSyllaDesk();
