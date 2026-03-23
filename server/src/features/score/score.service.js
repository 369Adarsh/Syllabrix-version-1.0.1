const { ApiError } = require('../../utils/api-error');
const queries = require('./score.queries');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

// Score calculation weights (from Master Plan)
const WEIGHTS = {
  posts: 0.10,           // Content quality
  likes: 0.10,           // Engagement
  endorsements: 0.20,    // Skill endorsements
  classes: 0.15,         // Course completions
  followers: 0.10,       // Community
  comments: 0.05,        // Community contribution
  consistency: 0.10,     // Regular activity
  // Remaining 20% from verified achievements + competitions (Phase 3+)
};

const calculateScore = async (userId) => {
  const breakdown = await queries.getScoreBreakdown(userId);

  // Normalize each metric to 0-100 scale
  const postScore = Math.min(breakdown.posts_count * 2, 100);
  const likeScore = Math.min(breakdown.total_likes_received * 0.5, 100);
  const endorseScore = Math.min(breakdown.endorsements_count * 10, 100);
  const classScore = Math.min(breakdown.classes_attended * 5, 100);
  const followerScore = Math.min(breakdown.followers_count * 2, 100);
  const commentScore = Math.min(breakdown.comments_count * 1, 100);

  const rawScore =
    (postScore * WEIGHTS.posts) +
    (likeScore * WEIGHTS.likes) +
    (endorseScore * WEIGHTS.endorsements) +
    (classScore * WEIGHTS.classes) +
    (followerScore * WEIGHTS.followers) +
    (commentScore * WEIGHTS.comments);

  // Scale to 0-100
  const finalScore = Math.min(parseFloat(rawScore.toFixed(2)), 100);

  return { score: finalScore, breakdown, weights: WEIGHTS };
};

const getScore = async (userId) => {
  const current = await queries.getStudentScore(userId);
  if (!current) throw ApiError.notFound('Student profile not found.');

  const calculated = await calculateScore(userId);
  return {
    current_score: parseFloat(current.syllabrix_score),
    calculated_score: calculated.score,
    experience_xp: current.experience_xp,
    breakdown: calculated.breakdown,
    weights: calculated.weights,
  };
};

const recalculateAndSave = async (userId, reason) => {
  const current = await queries.getStudentScore(userId);
  if (!current) return;

  const calculated = await calculateScore(userId);
  const oldScore = parseFloat(current.syllabrix_score);
  const newScore = calculated.score;
  const change = parseFloat((newScore - oldScore).toFixed(2));

  if (change !== 0) {
    await queries.recordScoreChange(userId, newScore, change, reason);
  }

  return { old_score: oldScore, new_score: newScore, change };
};

const getHistory = async (userId) => {
  return queries.getScoreHistory(userId, 50);
};

const getLeaderboard = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const students = await queries.getLeaderboard(limit, offset);
  const total = await queries.getLeaderboardCount();

  // Add rank
  const ranked = students.map((s, i) => ({ ...s, rank: offset + i + 1 }));

  return { leaderboard: ranked, pagination: getPaginationMeta(total, page, limit) };
};

module.exports = { getScore, recalculateAndSave, getHistory, getLeaderboard, calculateScore };
