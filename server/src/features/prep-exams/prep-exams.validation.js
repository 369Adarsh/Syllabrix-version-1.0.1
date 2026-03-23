const { body } = require('express-validator');
const createExamValidation = [body('category_id').notEmpty().isInt(), body('name').trim().notEmpty().isLength({max:200}), body('frequency').optional().isIn(['yearly','half_yearly','quarterly','monthly','as_notified'])];
const addDateValidation = [body('event_type').notEmpty().isIn(['registration_start','registration_end','admit_card','exam_date','result_date','cutoff_release','counselling','other']), body('event_name').trim().notEmpty()];
module.exports = { createExamValidation, addDateValidation };
