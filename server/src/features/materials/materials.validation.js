const { body } = require('express-validator');
const createMaterialValidation = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('subject').optional().trim().isLength({ max: 100 }),
  body('material_type').notEmpty().isIn(['notes','question_paper','solution','textbook','presentation','worksheet','other']),
  body('file_url').trim().notEmpty().withMessage('File URL required'),
  body('target_class').optional().trim(),
  body('target_board').optional().trim(),
];
module.exports = { createMaterialValidation };
