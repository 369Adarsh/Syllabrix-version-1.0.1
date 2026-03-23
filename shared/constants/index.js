const USER_TYPES = require('./user-types');
const AGE_GROUPS = require('./age-groups');
const AGE_PERMISSIONS = require('./age-permissions');
const POST_TYPES = require('./post-types');
const REACTION_TYPES = require('./reaction-types');
const NOTIFICATION_TYPES = require('./notification-types');
const JOB_TYPES = require('./job-types');
const VERIFICATION_STATUSES = require('./verification-statuses');
const MENTORSHIP_STAGES = require('./mentorship-stages');
const BADGE_TYPES = require('./badge-types');
const REPORT_REASONS = require('./report-reasons');
const MEDIA_TYPES = require('./media-types');
const STRIKE_LEVELS = require('./strike-levels');
const CELEBRATION_TYPES = require('./celebration-types');
const PROFESSION_SECTORS = require('./profession-sectors');
const BOARD_TYPES = require('./board-types');
const INSTITUTE_TYPES = require('./institute-types');
const APP_CONFIG = require('./app-config');
module.exports = {
  ...USER_TYPES, ...AGE_GROUPS, ...AGE_PERMISSIONS, ...POST_TYPES,
  ...REACTION_TYPES, ...NOTIFICATION_TYPES, ...JOB_TYPES,
  ...VERIFICATION_STATUSES, ...MENTORSHIP_STAGES, ...BADGE_TYPES,
  ...REPORT_REASONS, ...MEDIA_TYPES, ...STRIKE_LEVELS, ...CELEBRATION_TYPES,
  ...PROFESSION_SECTORS, ...BOARD_TYPES, ...INSTITUTE_TYPES, ...APP_CONFIG,
};
