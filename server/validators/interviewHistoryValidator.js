// server/validators/interviewHistoryValidator.js
//
// Module 5 — validation rules, reusing the existing express-validator pattern
// established in interviewValidator.js (Module 4 Phase 1).

const { param, query, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateObjectId = [
  param('id').isMongoId().withMessage('Invalid interview id.'),
  handleValidation,
];

const validateHistoryQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be between 1 and 50.'),
  query('sort')
    .optional()
    .isIn(['latest', 'oldest', 'highest-score', 'lowest-score'])
    .withMessage('sort must be one of latest, oldest, highest-score, lowest-score.'),
  query('type').optional().isString().trim().escape(),
  query('difficulty')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('difficulty must be Beginner, Intermediate, or Advanced.'),
  query('mode').optional().isString().trim().escape(),
  query('search').optional().isString().trim().isLength({ max: 100 }),
  handleValidation,
];

module.exports = {
  validateObjectId,
  validateHistoryQuery,
};
