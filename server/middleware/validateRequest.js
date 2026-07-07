// middleware/validateRequest.js
// Generic middleware that runs AFTER a route's express-validator chain
// and converts any accumulated validation errors into the standard error
// envelope (SRS Section 10.4 / SAD Section 8.4).
//
// This file deliberately knows nothing about auth, interviews, or any
// specific field rules - it only reads express-validator's result object.
// The actual validation chains (e.g. "password must be >= 8 chars" per
// SRS FR-01-02) belong in validators/authValidator.js and
// validators/interviewValidator.js, which are feature-specific business
// logic for later modules, not backend foundation.
//
// Usage (in a later module):
//   router.post('/register', authValidator.registerRules, validateRequest, asyncHandler(authController.register));

const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return next();
}

module.exports = validateRequest;
