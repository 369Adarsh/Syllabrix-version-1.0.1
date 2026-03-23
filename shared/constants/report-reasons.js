const REPORT_REASONS = {
  SPAM: 'spam', HARASSMENT: 'harassment', INAPPROPRIATE: 'inappropriate',
  BULLYING: 'bullying', MISINFORMATION: 'misinformation', IMPERSONATION: 'impersonation',
  SELF_HARM: 'self_harm', VIOLENCE: 'violence', HATE_SPEECH: 'hate_speech', OTHER: 'other',
};
const REPORT_REASON_LIST = Object.values(REPORT_REASONS);
const REPORT_STATUSES = {
  PENDING: 'pending', REVIEWING: 'reviewing', RESOLVED: 'resolved', DISMISSED: 'dismissed',
};
const REPORT_STATUS_LIST = Object.values(REPORT_STATUSES);
module.exports = { REPORT_REASONS, REPORT_REASON_LIST, REPORT_STATUSES, REPORT_STATUS_LIST };
