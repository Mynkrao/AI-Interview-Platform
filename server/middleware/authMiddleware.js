// middleware/authMiddleware.js
// Sole authentication mechanism for protected routes (SAD Section 9.4):
// reads the Authorization header, verifies it is a well-formed
// "Bearer <token>" value, verifies the JWT signature and expiry against
// JWT_SECRET, and attaches req.userId on success. Missing, malformed, or
// invalid/expired tokens all return 401 immediately - there is no
// secondary cookie check, since none exists in this architecture.

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { apiError } = require('../utils/apiResponse');

function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(apiError('Not authorized: missing or malformed Authorization header', 401));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(apiError('Not authorized: missing token', 401));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.userId = decoded.userId;
    return next();
  } catch (err) {
    // Covers both JsonWebTokenError (malformed/invalid signature) and
    // TokenExpiredError (SAD Section 9.1: 7-day expiry) - SAD does not
    // distinguish these cases to the client, both are just 401.
    return next(apiError('Not authorized: invalid or expired token', 401));
  }
}

module.exports = { protect };
