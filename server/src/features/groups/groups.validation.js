const { body } = require('express-validator');

const createGroupValidation = [
  body('name').trim().notEmpty().withMessage('Group name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Group name must be 3-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('group_type').optional().isIn(['study', 'project', 'class', 'general']),
  body('photo_url').optional().trim(),
];

const updateGroupValidation = [
  body('name').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('group_type').optional().isIn(['study', 'project', 'class', 'general']),
];

const sendGroupMessageValidation = [
  body('content').trim().notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message max 2000 characters'),
  body('media_url').optional().trim(),
  body('media_type').optional().isIn(['none', 'image', 'video', 'document', 'voice']),
];

const addMemberValidation = [
  body('user_id').notEmpty().isInt().withMessage('User ID is required'),
];

const changeRoleValidation = [
  body('role').notEmpty().isIn(['admin', 'moderator', 'member']).withMessage('Invalid role'),
];

module.exports = {
  createGroupValidation, updateGroupValidation,
  sendGroupMessageValidation, addMemberValidation, changeRoleValidation,
};
