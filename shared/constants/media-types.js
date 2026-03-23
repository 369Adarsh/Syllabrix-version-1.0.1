const MEDIA_TYPES = {
  NONE: 'none', IMAGE: 'image', VIDEO: 'video', DOCUMENT: 'document', AUDIO: 'audio',
};
const MEDIA_TYPE_LIST = Object.values(MEDIA_TYPES);
const ALLOWED_EXTENSIONS = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  video: ['.mp4', '.mov', '.avi', '.webm'],
  document: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'],
  audio: ['.mp3', '.wav', '.ogg'],
};
const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, video: 50 * 1024 * 1024,
  document: 10 * 1024 * 1024, audio: 10 * 1024 * 1024,
};
module.exports = { MEDIA_TYPES, MEDIA_TYPE_LIST, ALLOWED_EXTENSIONS, MAX_FILE_SIZES };
