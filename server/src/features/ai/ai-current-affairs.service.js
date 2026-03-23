const gemini = require('../../services/gemini.service');
const { pool } = require('../../database/connection');

/**
 * Auto-generate current affairs for a given date using AI
 */
const generateCurrentAffairs = async (date) => {
  const dateStr = date || new Date().toISOString().slice(0, 10);

  const prompt = `You are a current affairs expert for Indian competitive exam preparation (UPSC, SSC, Banking, etc.).

Generate 8-10 important current affairs items for the date: ${dateStr}

For each item provide:
- title: A clear headline
- category: One of: national, international, economy, science_tech, sports, environment, awards, appointments
- importance_level: One of: critical, high, medium
- content_points: Array of 3-5 key bullet points explaining the news
- source_hint: Which type of source this relates to (e.g. "PIB", "The Hindu", "Economic Times")
- exam_relevance: Which exams this is relevant for (e.g. "UPSC Prelims, SSC CGL")

Return as JSON array. Include REAL recent events and developments from India and the world.`;

  try {
    const affairs = await gemini.generateJSON(prompt, { temperature: 0.5 });

    // Save to database
    for (const item of affairs) {
      const [existing] = await pool.query(
        'SELECT id FROM current_affairs WHERE title = ? AND date = ?',
        [item.title, dateStr]
      );
      if (existing.length > 0) continue;

      await pool.query(
        'INSERT INTO current_affairs (title, category, importance_level, content_points, source_hint, exam_relevance, date, is_ai_generated) VALUES (?,?,?,?,?,?,?,1)',
        [item.title, item.category, item.importance_level, JSON.stringify(item.content_points), item.source_hint || null, item.exam_relevance || null, dateStr]
      );
    }

    return { count: affairs.length, date: dateStr, affairs };
  } catch (e) {
    console.error('AI Current Affairs Error:', e.message);
    throw e;
  }
};

/**
 * Get affairs with AI fallback
 */
const getAffairsWithAI = async (date) => {
  const dateStr = date || new Date().toISOString().slice(0, 10);
  let [rows] = await pool.query('SELECT * FROM current_affairs WHERE date = ? ORDER BY importance_level DESC', [dateStr]);

  if (rows.length === 0) {
    // Auto-generate
    await generateCurrentAffairs(dateStr);
    [rows] = await pool.query('SELECT * FROM current_affairs WHERE date = ? ORDER BY importance_level DESC', [dateStr]);
  }

  return rows.map(r => ({
    ...r,
    content_points: typeof r.content_points === 'string' ? JSON.parse(r.content_points) : r.content_points,
  }));
};

/**
 * Get affairs for a range
 */
const getAffairsForRange = async (days) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    dates.push(d);
  }
  const placeholders = dates.map(() => '?').join(',');
  const [rows] = await pool.query(`SELECT * FROM current_affairs WHERE date IN (${placeholders}) ORDER BY date DESC, importance_level DESC`, dates);

  // Check which dates have no data and generate
  const existingDates = [...new Set(rows.map(r => new Date(r.date).toISOString().slice(0, 10)))];
  for (const d of dates) {
    if (!existingDates.includes(d)) {
      try { await generateCurrentAffairs(d); } catch(e) {}
    }
  }

  if (existingDates.length < dates.length) {
    const [updated] = await pool.query(`SELECT * FROM current_affairs WHERE date IN (${placeholders}) ORDER BY date DESC, importance_level DESC`, dates);
    return updated.map(r => ({ ...r, content_points: typeof r.content_points === 'string' ? JSON.parse(r.content_points) : r.content_points }));
  }

  return rows.map(r => ({ ...r, content_points: typeof r.content_points === 'string' ? JSON.parse(r.content_points) : r.content_points }));
};

module.exports = { generateCurrentAffairs, getAffairsWithAI, getAffairsForRange };
