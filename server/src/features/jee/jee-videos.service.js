const axios = require('axios');

// In-memory cache: cacheKey → { data, expires }
const CACHE = new Map();
const CACHE_TTL = 48 * 60 * 60 * 1000; // 48 hours

// Channels/brands to block (competitors, commercial coaching)
const BLOCKED_CHANNELS = [
  'physics wallah', 'pw ', ' pw', 'byju', 'vedantu', 'unacademy',
  'allen', 'aakash', 'fiitjee', 'resonance', 'motion iit',
  'career point', 'etoos', 'gradeup', 'toppr',
];

// Search queries that naturally surface academic/safe content
function buildQueries(chapter, subject, classLevel) {
  return [
    `${chapter} ${subject} NPTEL lecture class ${classLevel}`,
    `${chapter} ${subject} Khan Academy`,
    `${chapter} ${subject} IIT lecture`,
    `${chapter} ${subject} class ${classLevel} concept explained`,
  ];
}

function isBlocked(channelName) {
  const lower = channelName.toLowerCase();
  return BLOCKED_CHANNELS.some(b => lower.includes(b));
}

async function getVideosForChapter(req, res) {
  try {
    const { chapter, subject, class: cls = 11 } = req.query;

    if (!chapter || !subject) {
      return res.status(400).json({ success: false, message: 'chapter and subject are required' });
    }

    const cacheKey = `${subject}_${chapter}_${cls}`.toLowerCase().replace(/\s+/g, '_');

    // Serve from cache if fresh
    if (CACHE.has(cacheKey)) {
      const entry = CACHE.get(cacheKey);
      if (Date.now() < entry.expires) {
        return res.json({ success: true, data: entry.data, cached: true });
      }
      CACHE.delete(cacheKey);
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return res.status(503).json({ success: false, message: 'YouTube API not configured' });
    }

    const queries = buildQueries(chapter, subject, cls);
    const seen = new Set();
    const videos = [];

    for (const query of queries) {
      if (videos.length >= 8) break;
      try {
        const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            key: process.env.YOUTUBE_API_KEY,
            q: query,
            part: 'snippet',
            type: 'video',
            maxResults: 6,
            relevanceLanguage: 'en',
            videoDuration: 'medium',
            order: 'relevance',
          },
          timeout: 6000,
        });

        for (const item of data.items || []) {
          const id = item.id?.videoId;
          if (!id || seen.has(id)) continue;
          if (isBlocked(item.snippet.channelTitle)) continue;
          seen.add(id);
          videos.push({
            videoId: id,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            publishedAt: item.snippet.publishedAt,
          });
        }
      } catch {
        // skip failed query, continue with next
      }
    }

    CACHE.set(cacheKey, { data: videos, expires: Date.now() + CACHE_TTL });
    return res.json({ success: true, data: videos });
  } catch (err) {
    console.error('[jee-videos] error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch videos' });
  }
}

module.exports = { getVideosForChapter };
