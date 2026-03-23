const { body } = require('express-validator');
const createClassValidation = [
  body('title').trim().notEmpty().withMessage('Title required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('subject').optional().trim().isLength({ max: 100 }),
  body('class_type').optional().isIn(['free', 'paid']),
  body('price').optional().isFloat({ min: 0 }),
  body('max_students').optional().isInt({ min: 1, max: 1000 }),
  body('scheduled_at').notEmpty().isISO8601().withMessage('Valid date required'),
  body('duration_minutes').optional().isInt({ min: 15, max: 180 }),
];
module.exports = { createClassValidation };
