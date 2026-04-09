const q = require('./moderation.queries');
const aiService = require('../../services/ai.service');

const checkContent = async (text) => {
  if (!text) return { clean: true, flagged: [], reason: '' };
  
  const prompt = `Analyze the following text strictly for severe platform violations.
You must protect this academic environment by blocking content related to:
1. Abuse, Profanity, or Hate Speech
2. Sexual content or Nudity references
3. Terrorism, Extremism, or Violence
4. Religious or Caste-based conflict/discrimination
5. Extreme Negativity, Bullying, or Self-Harm

Return ONLY a JSON response strictly in this exact format:
{"clean": boolean, "flagged": ["list", "of", "triggering", "themes"], "reason": "brief explanation if clean is false"}

Input Text: "${text}"`;

  try {
     const data = await aiService.generateJSON(prompt);
     return { 
       clean: data.clean !== false, 
       flagged: data.flagged || [], 
       reason: data.reason || '' 
     };
  } catch (err) {
     console.error('[AI Moderation Error]', err);
     // Fail-safe open on API timeout so app doesn't break, but log
     return { clean: true, flagged: [], reason: 'AI timeout' };
  }
};

const moderateContent = async (contentType, contentId, userId, text) => {
  const result = await checkContent(text);
  if (!result.clean) {
    await q.logModeration({ 
      content_type: contentType, 
      content_id: contentId, 
      user_id: userId, 
      original_text: text, 
      action_taken: 'flagged', 
      reason: result.reason || 'AI Flagged', 
      flagged_words: result.flagged 
    });
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
