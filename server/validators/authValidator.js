// validators/authValidator.js
// express-validator chains for the Auth routes. Paired with
// middleware/validateRequest.js, which reads the accumulated errors and
// returns the standard 400 error envelope.
//
// Field rules trace directly to SRS FR-01:
// - FR-01-01: name, email, password required to register
// - FR-01-02: password minimum 8 characters
// - FR-01-05: profile update fields (name, targetRole, skills)

const { body } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'), // SRS FR-01-02
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('targetRole').optional().trim(),
  body('skills').optional().isArray().withMessage('Skills must be an array of strings'),
  body('skills.*').optional().isString().withMessage('Each skill must be a string'),
];

module.exports = { registerRules, loginRules, updateProfileRules };
