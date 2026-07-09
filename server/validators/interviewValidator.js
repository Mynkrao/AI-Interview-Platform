// validators/interviewValidator.js
// express-validator chains for the Interview routes. Paired with
// middleware/validateRequest.js, which reads accumulated errors and
// returns the standard 400 error envelope.
//
// Phase 3: submitRules added for POST /api/interview/submit.
// generateRules is unchanged.
//
// Field rules trace to SRS FR-03-01 through FR-03-03 (shared config) and
// FR-03-08 (qaPairs submission shape).

const { body } = require('express-validator');

const generateRules = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Interview type is required')
    .isIn(['Technical', 'HR', 'Behavioral', 'Mixed'])
    .withMessage('Interview type must be one of: Technical, HR, Behavioral, Mixed'),
  body('domain').trim().notEmpty().withMessage('Domain is required'),
  body('count')
    .notEmpty()
    .withMessage('Question count is required')
    .isInt()
    .withMessage('Question count must be a number')
    .toInt()
    .isIn([5, 10, 15])
    .withMessage('Question count must be 5, 10, or 15'),
  body('difficulty')
    .trim()
    .notEmpty()
    .withMessage('Difficulty is required')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Difficulty must be one of: Beginner, Intermediate, Advanced'),
  body('mode')
    .trim()
    .notEmpty()
    .withMessage('Interview mode is required')
    .isIn(['Practice', 'Timed'])
    .withMessage('Interview mode must be one of: Practice, Timed'),
  body('company').optional({ checkFalsy: true }).trim().isString(),
];

// submitRules — POST /api/interview/submit (SRS FR-03-08)
// Validates session config (same enums as generate) plus the qaPairs array.
// answer is intentionally allowed to be empty so skipped questions are
// accepted and evaluated as score 0 by the AI service.
const submitRules = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Interview type is required')
    .isIn(['Technical', 'HR', 'Behavioral', 'Mixed'])
    .withMessage('Interview type must be one of: Technical, HR, Behavioral, Mixed'),

  body('domain')
    .trim()
    .notEmpty()
    .withMessage('Domain is required'),

  body('difficulty')
    .trim()
    .notEmpty()
    .withMessage('Difficulty is required')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Difficulty must be one of: Beginner, Intermediate, Advanced'),

  body('mode')
    .trim()
    .notEmpty()
    .withMessage('Interview mode is required')
    .isIn(['Practice', 'Timed'])
    .withMessage('Interview mode must be one of: Practice, Timed'),

  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isString(),

  body('qaPairs')
    .isArray({ min: 1, max: 15 })
    .withMessage('qaPairs must be an array of 1 to 15 items'),

  body('qaPairs.*.question')
    .isString()
    .withMessage('Each question must be a string')
    .trim()
    .notEmpty()
    .withMessage('Question text cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Question text must not exceed 2000 characters'),

  body('qaPairs.*.answer')
    .isString()
    .withMessage('Each answer must be a string')
    .isLength({ min: 0, max: 5000 })
    .withMessage('Answer must not exceed 5000 characters'),
];

module.exports = { generateRules, submitRules };

