const CELEBRATION_TYPES = {
  FIRST_POST: 'first_post', FIRST_LIKE_RECEIVED: 'first_like_received',
  FIRST_COMMENT_RECEIVED: 'first_comment_received', FIRST_FOLLOWER: 'first_follower',
  TEN_FOLLOWERS: 'ten_followers', FIFTY_FOLLOWERS: 'fifty_followers',
  HUNDRED_FOLLOWERS: 'hundred_followers', FIRST_BADGE: 'first_badge',
  BADGE_EARNED: 'badge_earned', STREAK_7: 'streak_7', STREAK_30: 'streak_30',
  STREAK_100: 'streak_100', FIRST_EXPERIENCE_ACTIVITY: 'first_experience_activity',
  PROFESSION_EXPLORER: 'profession_explorer', PROFESSION_ENTHUSIAST: 'profession_enthusiast',
  PROFESSION_DEDICATED: 'profession_dedicated', MENTORSHIP_ACCEPTED: 'mentorship_accepted',
  MENTORSHIP_COMPLETED: 'mentorship_completed', FIRST_ENDORSEMENT: 'first_endorsement',
  PROFILE_COMPLETE: 'profile_complete', SCORE_MILESTONE_50: 'score_milestone_50',
  SCORE_MILESTONE_100: 'score_milestone_100',
};
const CELEBRATION_TYPE_LIST = Object.values(CELEBRATION_TYPES);
module.exports = { CELEBRATION_TYPES, CELEBRATION_TYPE_LIST };
