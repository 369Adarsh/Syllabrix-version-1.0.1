const q = require('./moderation.queries');

// Bad words filter (basic — production would use Perspective API)
const BAD_WORDS = ['abuse','hate','kill','stupid','idiot','dumb','ugly','loser','shut up','die'];

const checkContent = (text) => {
  if (!text) return { clean: true, flagged: [] };
  const lower = text.toLowerCase();
  const flagged = BAD_WORDS.filter(w => lower.includes(w));
  return { clean: flagged.length === 0, flagged };
};

const moderateContent = async (contentType, contentId, userId, text) => {
  const result = checkContent(text);
  if (!result.clean) {
    await q.logModeration({ content_type: contentType, content_id: contentId, user_id: userId, original_text: text, action_taken: 'flagged', reason: 'Contains inappropriate words', flagged_words: result.flagged });
    const strikes = await q.getUserStrikes(userId);
    if (strikes >= 5) {
      // Auto-ban after 5 strikes
      const { pool } = require('../../database/connection');
      await pool.query('UPDATE users SET is_banned = 1 WHERE id = ?', [userId]);
      await q.logModeration({ content_type: 'profile', content_id: userId, user_id: userId, action_taken: 'user_banned', reason: 'Exceeded strike limit' });
    }
  }
  return result;
};

const getLogs = async (filters, limit, offset) => q.getLogs(filters, limit, offset);
const getUserStrikes = async (userId) => q.getUserStrikes(userId);
const logActivity = async (userId, action, entity, entityId, meta, ip) => q.logActivity(userId, action, entity, entityId, meta, ip);
const getActivityLog = async (userId, limit) => q.getActivityLog(userId, limit || 50);
const updateStreak = async (userId) => q.updateStreak(userId);
const getStreak = async (userId) => q.getStreak(userId);

module.exports = { checkContent, moderateContent, getLogs, getUserStrikes, logActivity, getActivityLog, updateStreak, getStreak };
