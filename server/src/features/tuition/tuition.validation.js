const { body } = require('express-validator');
const createTuitionValidation = [
  body('ad_type').notEmpty().isIn(['offering_tuition','seeking_tutor']).withMessage('Ad type required'),
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('subject').trim().notEmpty().isLength({ max: 100 }),
  body('class_range').optional().trim(),
  body('location').optional().trim(),
  body('is_online').optional().isBoolean(),
  body('budget_min').optional().isFloat({ min: 0 }),
  body('budget_max').optional().isFloat({ min: 0 }),
  body('budget_period').optional().isIn(['hourly','monthly','per_session']),
];
module.exports = { createTuitionValidation };
