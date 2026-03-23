const { body } = require('express-validator');

const sendMessageValidation = [
  body('content').trim().notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message max 2000 characters'),
  body('media_url').optional().trim(),
  body('media_type').optional().isIn(['none', 'image', 'video', 'document', 'voice']),
];

module.exports = { sendMessageValidation };
