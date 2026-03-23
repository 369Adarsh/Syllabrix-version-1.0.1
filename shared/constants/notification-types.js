const NOTIFICATION_TYPES = {
  LIKE: 'like', COMMENT: 'comment', FOLLOW: 'follow', MESSAGE: 'message',
  GROUP_INVITE: 'group_invite', GROUP_MESSAGE: 'group_message',
  JOB_APPLICATION: 'job_application', JOB_STATUS: 'job_status',
  MENTION: 'mention', REPOST: 'repost', BADGE_EARNED: 'badge_earned',
  CELEBRATION: 'celebration', ENDORSEMENT: 'endorsement',
  MENTORSHIP_REQUEST: 'mentorship_request', MENTORSHIP_ACCEPTED: 'mentorship_accepted',
  MENTORSHIP_SESSION: 'mentorship_session', LIVE_CLASS_REMINDER: 'live_class_reminder',
  PARENT_ALERT: 'parent_alert', SYSTEM: 'system',
};
const NOTIFICATION_TYPE_LIST = Object.values(NOTIFICATION_TYPES);
module.exports = { NOTIFICATION_TYPES, NOTIFICATION_TYPE_LIST };
