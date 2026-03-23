const { body } = require('express-validator');
const reportValidation = [
  body('reason').notEmpty().isIn(['spam','harassment','inappropriate','hate_speech','bullying','self_harm','impersonation','misinformation','other']),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('reported_user_id').optional().isInt(),
  body('reported_post_id').optional().isInt(),
  body('reported_comment_id').optional().isInt(),
  body('reported_message_id').optional().isInt(),
];
module.exports = { reportValidation };
