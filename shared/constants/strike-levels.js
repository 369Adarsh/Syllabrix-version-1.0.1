const STRIKE_LEVELS = {
  WARNING: { strikes: 1, action: 'warning', durationHours: null },
  TEMPORARY_RESTRICTION: { strikes: 2, action: 'restrict', durationHours: 48 },
  PERMANENT_BAN: { strikes: 3, action: 'ban', durationHours: null },
};
const MAX_STRIKES = 3;
module.exports = { STRIKE_LEVELS, MAX_STRIKES };
