// middleware/errorMiddleware.js
// Global error handler. Formats all unhandled errors into the standard
// response envelope defined in SAD Section 8.4:
//   { success: false, message: "...", errors: [...] }
//
// This is infrastructure, not business logic — it doesn't know about
// auth, interviews, or AI. Module-specific error shaping (e.g. mapping
// a Mongoose ValidationError to field-level messages) belongs in later
// modules, not here.

const env = require('../config/env');

// 404 handler — must be mounted AFTER all routes, BEFORE errorHandler.
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  console.error(`[error] ${req.method} ${req.originalUrl} -> ${statusCode}: ${err.message}`);
  if (!env.isProduction) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
    // Stack traces only in non-production responses — never leak internals
    // to clients in prod (SRS NFR Security).
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
