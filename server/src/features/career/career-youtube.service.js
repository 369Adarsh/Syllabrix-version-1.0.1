const axios = require('axios');
const config = require('../../config/env');

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Search YouTube for a relevant tutorial video.
 * Returns the top video ID, title, channel, and thumbnail.
 */
async function searchVideo(req, res) {
  const { query } = req.query;
  if (!query) return res.status(400).json({ success: false, message: 'query is required' });

  const apiKey = config.YOUTUBE_API_KEY;
  if (!apiKey) return res.status(503).json({ success: false, message: 'YouTube API not configured' });

  const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
    params: {
      key: apiKey,
      q: query,
      part: 'snippet',
      type: 'video',
      maxResults: 5,
      videoEmbeddable: 'true',
      relevanceLanguage: 'en',
      safeSearch: 'strict',
    },
  });

  const items = response.data.items || [];
  if (!items.length) return res.json({ success: true, data: null });

  const videos = items.map(item => ({
    videoId:   item.id.videoId,
    title:     item.snippet.title,
    channel:   item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url || '',
    embedUrl:  `https://www.youtube.com/embed/${item.id.videoId}?rel=0&modestbranding=1`,
  }));

  res.json({ success: true, data: videos });
}

module.exports = { searchVideo };
