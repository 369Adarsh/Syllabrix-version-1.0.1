// LD Knowledge Service — Tribal Knowledge Management
const { ldPool: pool } = require('../../../database/connection');
const config = require('../../../config/env');

class LDKnowledgeService {
  // 1. Submit Knowledge Item
  async createItem(orgId, userId, { title, body, item_type = 'tip', tags = [], skill_ids = [], media_urls = [] }) {
    const [result] = await pool.query(
      `INSERT INTO ld_knowledge_items (org_id, title, body, item_type, tags, skill_ids, contributor_id, media_urls, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'in_review')`,
      [orgId, title, body, item_type, JSON.stringify(tags), JSON.stringify(skill_ids), userId, JSON.stringify(media_urls)]
    );
    
    // Auto-create a review record
    await pool.query(
      `INSERT INTO ld_reviews (org_id, content_type, content_id, reviewer_id, status)
       VALUES (?, 'knowledge_item', ?, 0, 'pending')`, // 0 = generic queue for SMEs
      [orgId, result.insertId]
    );

    return result.insertId;
  }

  // 2. Get Knowledge Items (Feed/List)
  async getItems(orgId, { status = 'published', type, contributor_id, limit = 20, offset = 0 } = {}) {
    let where = 'org_id = ? AND status = ?';
    const params = [orgId, status];

    if (type) { where += ' AND item_type = ?'; params.push(type); }
    if (contributor_id) { where += ' AND contributor_id = ?'; params.push(contributor_id); }

    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(
      `SELECT k.*, u.username as contributor_name, u.profile_photo_url as avatar_url
       FROM ld_knowledge_items k
       JOIN ${config.DB_SOCIAL.NAME}.users u ON k.contributor_id = u.id
       WHERE ${where}
       ORDER BY k.published_at DESC, k.created_at DESC
       LIMIT ? OFFSET ?`,
      params
    );
    return rows;
  }

  // 3. Review Knowledge Item
  async reviewItem(orgId, itemId, reviewerId, { status, comments }) {
    // Start transaction
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Update item status
      await conn.query(
        `UPDATE ld_knowledge_items SET status = ?, published_at = ? WHERE id = ? AND org_id = ?`,
        [status, status === 'published' ? new Date() : null, itemId, orgId]
      );

      // Update review record
      await conn.query(
        `UPDATE ld_reviews SET status = ?, comments = ?, reviewed_at = NOW(), reviewer_id = ?
         WHERE content_type = 'knowledge_item' AND content_id = ? AND org_id = ?`,
        [status === 'published' ? 'approved' : 'revision_requested', comments, reviewerId, itemId, orgId]
      );

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  // 4. Semantic / Fulltext Search
  async search(orgId, query, limit = 10) {
    if (!query) return [];
    
    // Using MySQL Fulltext search (NATURAL LANGUAGE MODE)
    // Assuming idx_kb_search (title, body) exists
    const [rows] = await pool.query(
      `SELECT k.*, u.username as contributor_name, 
         MATCH(title, body) AGAINST(?) as relevance
       FROM ld_knowledge_items k
       JOIN ${config.DB_SOCIAL.NAME}.users u ON k.contributor_id = u.id
       WHERE k.org_id = ? AND k.status = 'published' AND MATCH(title, body) AGAINST(?)
       ORDER BY relevance DESC
       LIMIT ?`,
      [query, orgId, query, parseInt(limit)]
    );

    return rows;
  }

  // 5. Helpfulness tracking
  async markHelpful(orgId, itemId) {
    await pool.query(
      `UPDATE ld_knowledge_items SET helpful_count = helpful_count + 1 WHERE id = ? AND org_id = ?`,
      [itemId, orgId]
    );
  }
}

module.exports = new LDKnowledgeService();
