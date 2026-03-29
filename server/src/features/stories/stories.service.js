const {
  getActiveStoriesForFeed, createStory, markStoryViewed,
  getStoriesByUser, deleteStory, deleteExpiredStories,
} = require('./stories.queries');
const { uploadToCloudinary } = require('../../utils/cloudinary-upload');
const { ApiError } = require('../../utils/api-error');

// Group flat rows into per-user buckets for the feed
const groupStoriesForFeed = (rows) => {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.user_id)) {
      map.set(row.user_id, {
        user_id: row.user_id,
        username: row.username,
        full_name: row.full_name,
        profile_photo_url: row.profile_photo_url,
        stories: [],
        has_unviewed: false,
      });
    }
    const group = map.get(row.user_id);
    group.stories.push({
      id: row.id,
      media_url: row.media_url,
      media_type: row.media_type,
      caption: row.caption,
      created_at: row.created_at,
      expires_at: row.expires_at,
      viewed: !!row.viewed,
    });
    if (!row.viewed) group.has_unviewed = true;
  }
  return Array.from(map.values());
};

const getFeedStories = async (userId) => {
  const rows = await getActiveStoriesForFeed(userId);
  return groupStoriesForFeed(rows);
};

const createUserStory = async (userId, file, { caption } = {}) => {
  if (!file) throw ApiError.badRequest('Media file is required');

  const isVideo = file.mimetype.startsWith('video/');
  const mediaType = isVideo ? 'video' : 'image';

  const uploaded = await uploadToCloudinary(file.buffer, {
    folder: 'stories',
    resourceType: isVideo ? 'video' : 'image',
    transformation: isVideo
      ? [{ duration: 45, crop: 'limit' }]  // cap at 45 sec
      : [],
  });

  const storyId = await createStory(userId, uploaded.url, mediaType, caption || null);
  return { id: storyId, media_url: uploaded.url, media_type: mediaType, caption };
};

const viewStory = async (storyId, viewerId) => {
  await markStoryViewed(storyId, viewerId);
};

const removeStory = async (storyId, userId) => {
  const deleted = await deleteStory(storyId, userId);
  if (!deleted) throw ApiError.badRequest('Story not found or not yours');
};

const cleanExpired = async () => {
  return deleteExpiredStories();
};

module.exports = { getFeedStories, createUserStory, viewStory, removeStory, cleanExpired };
