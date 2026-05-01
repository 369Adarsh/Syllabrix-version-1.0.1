const axios = require('axios');

const CACHE = new Map();
const CACHE_TTL = 48 * 60 * 60 * 1000; // 48 hours

const BLOCKED_CHANNELS = [
  'physics wallah', 'pw ', ' pw', 'byju', 'vedantu', 'unacademy',
  'allen', 'aakash', 'fiitjee', 'resonance', 'motion iit',
  'career point', 'etoos', 'gradeup', 'toppr', 'doubtnut',
];

const PREFERRED_CHANNELS = [
  'nptel', 'iit bombay', 'iit delhi', 'iit madras', 'iit kharagpur', 'iit ',
  'namo kaul', 'physics galaxy', 'arvind academy', 'examfear',
  'pradeep kshetrapal', 'vineet khatri', 'jh sir', 'maths by vijay',
  'nirmal sir', 'khan academy india', 'letstute', 'concept builder',
];

function isBlocked(channel) {
  const lower = channel.toLowerCase();
  return BLOCKED_CHANNELS.some(b => lower.includes(b));
}

function isPreferred(channel) {
  const lower = channel.toLowerCase();
  return PREFERRED_CHANNELS.some(t => lower.includes(t));
}

// When source is NCERT: queries are pinned to the exact book, class, chapter and topic.
// This ensures videos match exactly what the student has open in their NCERT book.
function buildNCERTTopicQueries(topic, chapterName, chapterNum, subject, classLevel) {
  const ref = `NCERT Class ${classLevel} ${subject}`;
  return [
    `${ref} Chapter ${chapterNum} ${chapterName} ${topic} lecture India`,
    `${topic} ${ref} NPTEL IIT explained India`,
    `${ref} ${topic} Namo Kaul India tutorial`,
    `${topic} ${chapterName} ${ref} ExamFear India`,
    `${topic} ${subject} NCERT India class ${classLevel} concept explained`,
  ];
}

function buildNCERTChapterQueries(chapterName, chapterNum, subject, classLevel) {
  const ref = `NCERT Class ${classLevel} ${subject}`;
  return [
    `${ref} Chapter ${chapterNum} ${chapterName} lecture India`,
    `${chapterName} ${ref} NPTEL IIT India`,
    `${chapterName} ${ref} Namo Kaul India`,
    `${chapterName} ${ref} ExamFear Arvind Academy India`,
  ];
}

// Generic fallback when no book source context is given
function buildTopicQueries(topic, chapter, subject, classLevel) {
  return [
    `${topic} ${subject} NPTEL IIT India lecture`,
    `${topic} ${chapter} ${subject} India class ${classLevel} explained`,
    `${topic} ${subject} Namo Kaul India tutorial`,
    `${topic} ${subject} Arvind Academy India lecture`,
    `${topic} ${subject} ExamFear India class ${classLevel}`,
  ];
}

function buildChapterQueries(chapter, subject, classLevel) {
  return [
    `${chapter} ${subject} NPTEL IIT India lecture class ${classLevel}`,
    `${chapter} ${subject} India class ${classLevel} explained tutorial`,
    `${chapter} ${subject} Namo Kaul India`,
    `${chapter} ${subject} Arvind Academy India`,
    `${chapter} ${subject} ExamFear India class ${classLevel}`,
  ];
}

async function getVideosForChapter(req, res) {
  try {
    const { chapter, subject, class: cls = 11, topic, chapter_num, source } = req.query;

    if (!chapter || !subject) {
      return res.status(400).json({ success: false, message: 'chapter and subject are required' });
    }

    const cacheKey = `${source || 'g'}_${subject}_${topic || chapter}_${cls}`.toLowerCase().replace(/\s+/g, '_');

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

    let queries;
    if (source === 'ncert' && topic) {
      queries = buildNCERTTopicQueries(topic, chapter, chapter_num || '', subject, cls);
    } else if (source === 'ncert') {
      queries = buildNCERTChapterQueries(chapter, chapter_num || '', subject, cls);
    } else if (topic) {
      queries = buildTopicQueries(topic, chapter, subject, cls);
    } else {
      queries = buildChapterQueries(chapter, subject, cls);
    }

    const seen = new Set();
    const preferred = [];
    const regular = [];

    for (const query of queries) {
      if (preferred.length + regular.length >= 12) break;
      try {
        const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            key: process.env.YOUTUBE_API_KEY,
            q: query,
            part: 'snippet',
            type: 'video',
            maxResults: 5,
            relevanceLanguage: 'en',
            videoDuration: 'medium', // 4–20 min: excludes all Shorts
            regionCode: 'IN',        // Prioritise Indian content
            order: 'relevance',
          },
          timeout: 6000,
        });

        for (const item of data.items || []) {
          const id = item.id?.videoId;
          if (!id || seen.has(id)) continue;
          if (isBlocked(item.snippet.channelTitle)) continue;
          seen.add(id);

          const video = {
            videoId: id,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            publishedAt: item.snippet.publishedAt,
            preferred: isPreferred(item.snippet.channelTitle),
          };

          if (video.preferred) preferred.push(video);
          else regular.push(video);
        }
      } catch {
        // skip failed query
      }
    }

    // NPTEL/IIT/known Indian teachers always shown first
    const videos = [...preferred, ...regular].slice(0, 8);

    CACHE.set(cacheKey, { data: videos, expires: Date.now() + CACHE_TTL });
    return res.json({ success: true, data: videos });
  } catch (err) {
    console.error('[jee-videos] error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch videos' });
  }
}

module.exports = { getVideosForChapter };
