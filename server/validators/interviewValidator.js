// validators/interviewValidator.js
// express-validator chains for the Interview routes. Paired with
// middleware/validateRequest.js, which reads accumulated errors and
// returns the standard 400 error envelope.
//
// PHASE 1 SCOPE: only generateRules, backing POST /api/interview/generate.
// Submit-rules (SRS FR-03-08, qaPairs[] shape) belong to Phase 3, when
// interviewController.submitSession is implemented.
//
// Field rules trace to SRS FR-03-01 through FR-03-03:
// - FR-03-01: interview type — Technical | HR | Behavioral | Mixed
// - FR-03-02: domain/role — required
// - FR-03-03: question count (5 | 10 | 15), difficulty, mode, optional company

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

module.exports = { generateRules };
