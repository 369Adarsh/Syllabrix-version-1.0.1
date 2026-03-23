const BADGE_TYPES = {
  ACHIEVEMENT: 'achievement', PROFESSION: 'profession', SOCIAL: 'social',
  STREAK: 'streak', MENTORSHIP: 'mentorship', SPECIAL: 'special',
};
const BADGE_TYPE_LIST = Object.values(BADGE_TYPES);
const BADGE_RARITIES = {
  COMMON: 'common', UNCOMMON: 'uncommon', RARE: 'rare', EPIC: 'epic', LEGENDARY: 'legendary',
};
const BADGE_RARITY_LIST = Object.values(BADGE_RARITIES);
module.exports = { BADGE_TYPES, BADGE_TYPE_LIST, BADGE_RARITIES, BADGE_RARITY_LIST };
