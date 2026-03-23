const ai = require('../../services/ai.service');
const { pool } = require('../../database/connection');

/**
 * 54 verified Indian news sources grouped by category
 */
const NEWS_SOURCES = {
  government: ['PIB (Press Information Bureau)', 'PRS Legislative Research', 'India.gov.in', 'Ministry of Finance', 'NITI Aayog', 'RBI', 'SEBI', 'ISRO', 'DRDO'],
  newspapers: ['The Hindu', 'Indian Express', 'Times of India', 'Hindustan Times', 'Economic Times', 'Business Standard', 'Livemint', 'The Wire', 'The Print', 'NDTV'],
  international: ['BBC India', 'Reuters India', 'Al Jazeera', 'The Guardian', 'AP News', 'AFP'],
  economy: ['RBI Bulletin', 'Economic Survey', 'World Bank India', 'IMF', 'NASSCOM', 'CII Reports'],
  science: ['NCERT Updates', 'DST India', 'Nature India', 'Indian Journal of Science', 'Science Daily India'],
  sports: ['ESPN Cricinfo', 'Olympics.com', 'SAI (Sports Authority of India)', 'Sportstar'],
  legal: ['Supreme Court Observer', 'Bar & Bench', 'Live Law', 'Law Commission Reports'],
  environment: ['MoEFCC', 'CPCB Reports', 'Down to Earth', 'CSE India'],
  education: ['UGC', 'AICTE', 'NTA', 'NCERT', 'Ministry of Education'],
};

const ALL_CATEGORIES = [
  'national', 'international', 'economy', 'science_tech',
  'sports', 'environment', 'defence', 'awards',
  'appointments', 'legal', 'art_culture', 'education',
];

/**
 * Generate a full newsroom edition for a date
 * Each article has: headline, summary, key_terms, mind_map_data, exam_relevance, source
 */
const generateNewsroomEdition = async (date, category) => {
  const dateStr = date || new Date().toISOString().slice(0, 10);
  const catFilter = category && category !== 'all' ? `Focus ONLY on ${category} category.` : 'Cover all major categories.';

  // Check if already generated for this date+category
  const cacheKey = `newsroom|${dateStr}|${category || 'all'}`;
  try {
    const [cached] = await pool.query(
      `SELECT content_json FROM ai_daily_digest WHERE digest_date = ? AND digest_type = 'news_summary' AND IFNULL(category,'all') = ? LIMIT 1`,
      [dateStr, category || 'all']
    );
    if (cached.length > 0) {
      return typeof cached[0].content_json === 'string' ? JSON.parse(cached[0].content_json) : cached[0].content_json;
    }
  } catch (e) { /* cache miss */ }

  const prompt = `You are the editor of Syllabrix Newsroom — India's smartest news digest for students preparing for competitive exams (UPSC, SSC, Banking, JEE, NEET, Board Exams).

Generate 10-15 important news articles for: ${dateStr}
${catFilter}

For EACH article return:
{
  "headline": "Clear, exam-style headline (under 15 words)",
  "category": "national|international|economy|science_tech|sports|environment|defence|awards|appointments|legal|art_culture|education",
  "summary": "2-3 sentence AI summary explaining what happened and why it matters",
  "key_terms": [
    { "term": "Important Term", "meaning": "1-line definition for quick revision" }
  ],
  "bullet_points": [
    "Key fact 1 — with specific numbers/names",
    "Key fact 2",
    "Key fact 3"
  ],
  "mind_map_hint": {
    "center": "Main Topic",
    "branches": ["Related Concept 1", "Related Concept 2", "Related Concept 3", "Related Concept 4"]
  },
  "exam_tags": ["UPSC Prelims", "SSC CGL", "Banking"],
  "importance": "critical|high|medium",
  "source_type": "Government|Newspaper|International",
  "one_liner": "One line to remember this for the exam (like a mnemonic)"
}

Return as JSON array. Rules:
- Use REAL, RECENT events from India and the world
- Every article must have at least 2 key_terms
- exam_tags should list which exams might ask about this
- importance: critical = likely exam question, high = important to know, medium = good to know
- mind_map_hint helps students visualize connections
- one_liner is a memory aid / quick revision hook
- Source from: ${Object.values(NEWS_SOURCES).flat().slice(0, 20).join(', ')}, etc.
- ONLY valid JSON array`;

  const articles = await ai.generateJSON(prompt, { temperature: 0.4, maxTokens: 6000 });

  // Cache in ai_daily_digest
  try {
    await pool.query(
      `INSERT INTO ai_daily_digest (digest_date, digest_type, category, title, content_json, generated_at) VALUES (?, 'news_summary', ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE content_json = VALUES(content_json), generated_at = NOW()`,
      [dateStr, category || 'all', `Syllabrix Newsroom — ${dateStr}`, JSON.stringify(articles)]
    );
  } catch (e) {
    console.log('[Newsroom] Cache save error:', e.message);
  }

  // Also save individual articles to current_affairs table for cross-feature access
  for (const article of articles) {
    try {
      const [existing] = await pool.query(
        'SELECT id FROM current_affairs WHERE title = ? AND date = ?',
        [article.headline, dateStr]
      );
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO current_affairs (title, category, importance_level, content_points, source_hint, exam_relevance, date, is_ai_generated, mind_map_data)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
          [
            article.headline,
            article.category,
            article.importance || 'medium',
            JSON.stringify(article.bullet_points || []),
            article.source_type || null,
            JSON.stringify(article.exam_tags || []),
            dateStr,
            JSON.stringify(article.mind_map_hint || null),
          ]
        );
      }
    } catch (e) { /* skip duplicates */ }
  }

  return articles;
};

/**
 * Get newsroom articles for a date range with pagination
 */
const getNewsroomArticles = async (options = {}) => {
  const { date, days = 1, category, importance, page = 1, limit = 20 } = options;
  const dateStr = date || new Date().toISOString().slice(0, 10);

  // First try to get from ai_daily_digest (richer data)
  const dates = [];
  for (let i = 0; i < days; i++) {
    dates.push(new Date(new Date(dateStr).getTime() - i * 86400000).toISOString().slice(0, 10));
  }

  let allArticles = [];
  for (const d of dates) {
    let articles;
    try {
      const [cached] = await pool.query(
        `SELECT content_json FROM ai_daily_digest WHERE digest_date = ? AND digest_type = 'news_summary' LIMIT 1`,
        [d]
      );
      if (cached.length > 0) {
        articles = typeof cached[0].content_json === 'string' ? JSON.parse(cached[0].content_json) : cached[0].content_json;
      }
    } catch (e) { /* miss */ }

    if (!articles) {
      // Auto-generate for this date
      try {
        articles = await generateNewsroomEdition(d);
      } catch (e) {
        console.log(`[Newsroom] Failed to generate for ${d}:`, e.message);
        articles = [];
      }
    }

    if (Array.isArray(articles)) {
      allArticles.push(...articles.map(a => ({ ...a, date: d })));
    }
  }

  // Apply filters
  if (category && category !== 'all') {
    allArticles = allArticles.filter(a => a.category === category);
  }
  if (importance) {
    allArticles = allArticles.filter(a => a.importance === importance);
  }

  // Paginate
  const total = allArticles.length;
  const offset = (page - 1) * limit;
  const paged = allArticles.slice(offset, offset + limit);

  return {
    articles: paged,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    date: dateStr,
    days,
  };
};

/**
 * Generate a detailed article expansion — deep dive into one news item
 */
const expandArticle = async (headline, category) => {
  const prompt = `Expand this news headline into a detailed study article for exam preparation:
"${headline}" (Category: ${category || 'general'})

Return JSON:
{
  "title": "${headline}",
  "detailed_summary": "5-8 sentence detailed explanation",
  "background": "Historical context — what led to this event",
  "key_facts": ["Fact 1 with specific data", "Fact 2", "Fact 3", "Fact 4", "Fact 5"],
  "key_terms": [
    { "term": "Term", "meaning": "Definition", "related_to": "Which subject/topic" }
  ],
  "mind_map": {
    "title": "Central Topic",
    "color": "#4F46E5",
    "children": [
      { "title": "Branch 1", "color": "#7C3AED", "children": [{ "title": "Detail", "color": "#EC4899" }] },
      { "title": "Branch 2", "color": "#10B981", "children": [{ "title": "Detail", "color": "#F59E0B" }] }
    ]
  },
  "exam_questions": [
    { "question": "Likely exam question 1?", "answer": "Concise answer", "exam": "UPSC" },
    { "question": "Likely exam question 2?", "answer": "Concise answer", "exam": "SSC" }
  ],
  "related_topics": ["Topic 1 to study next", "Topic 2"],
  "revision_one_liner": "One sentence to remember everything"
}

Be accurate, educational, India-focused. ONLY valid JSON.`;

  return ai.generateJSON(prompt, { temperature: 0.4 });
};

/**
 * Generate monthly compilation
 */
const generateMonthlyCompilation = async (year, month) => {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  const prompt = `Create a monthly current affairs compilation for: ${monthStr} (for Indian competitive exam preparation).

Return JSON:
{
  "month": "${monthStr}",
  "title": "Current Affairs Compilation — Month Year",
  "sections": [
    {
      "category": "National",
      "items": [
        { "headline": "...", "one_liner": "Quick revision line", "exam_relevance": "UPSC, SSC" }
      ]
    }
  ],
  "top_10_most_important": [
    { "rank": 1, "headline": "...", "why": "Why this is #1 most important" }
  ],
  "key_appointments": [{ "name": "Person", "position": "New Role", "organization": "Org" }],
  "key_numbers": [{ "number": "₹X crore", "context": "What this number means" }],
  "total_items": 0
}

Include 40-60 items across all categories. Be accurate with real events. ONLY valid JSON.`;

  const compilation = await ai.generateJSON(prompt, { temperature: 0.3, maxTokens: 6000 });

  // Cache
  try {
    await pool.query(
      `INSERT INTO ai_daily_digest (digest_date, digest_type, category, title, content_json) VALUES (?, 'monthly_compilation', 'all', ?, ?) ON DUPLICATE KEY UPDATE content_json = VALUES(content_json)`,
      [`${monthStr}-01`, `Monthly Compilation — ${monthStr}`, JSON.stringify(compilation)]
    );
  } catch (e) { /* skip */ }

  return compilation;
};

module.exports = {
  generateNewsroomEdition,
  getNewsroomArticles,
  expandArticle,
  generateMonthlyCompilation,
  NEWS_SOURCES,
  ALL_CATEGORIES,
};
