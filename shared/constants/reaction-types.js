const REACTION_TYPES = {
  LIKE: 'like', AMAZING: 'amazing', KEEP_GOING: 'keep_going',
  CONGRATULATIONS: 'congratulations', SMART: 'smart', WELL_DONE: 'well_done',
  LOVE: 'love', GOING_PLACES: 'going_places', GREAT_LEARNING: 'great_learning',
};
const REACTION_TYPE_LIST = Object.values(REACTION_TYPES);
const REACTION_EMOJIS = {
  like: '\u{1F44D}', amazing: '\u{1F31F}', keep_going: '\u{1F4AA}',
  congratulations: '\u{1F389}', smart: '\u{1F9E0}', well_done: '\u{1F44F}',
  love: '\u{2764}\u{FE0F}', going_places: '\u{1F680}', great_learning: '\u{1F4DA}',
};
module.exports = { REACTION_TYPES, REACTION_TYPE_LIST, REACTION_EMOJIS };
