const { formatDate, formatDateForInput } = require('./format-date');
const { formatNumber } = require('./format-number');
const { formatCurrency } = require('./format-currency');
const { slugify } = require('./slugify');
const { truncate } = require('./truncate');
const { calculateAge } = require('./calculate-age');
const { calculateAgeGroup } = require('./calculate-age-group');
const { sanitizeInput, stripHtml } = require('./sanitize-input');
const { generateUsername } = require('./generate-username');
const { timeAgo } = require('./time-ago');
const { ERROR_MESSAGES } = require('./error-messages');
module.exports = {
  formatDate, formatDateForInput, formatNumber, formatCurrency, slugify,
  truncate, calculateAge, calculateAgeGroup, sanitizeInput, stripHtml,
  generateUsername, timeAgo, ERROR_MESSAGES,
};
