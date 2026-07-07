// utils/apiResponse.js
// Standard response envelope helpers per SRS Section 10.4 / SAD Section 8.4:
//   Success: { success: true, data: {...} }
//   Error:   { success: false, message: "...", errors: [...] }
//
// The error shape is already produced by middleware/errorMiddleware.js for
// thrown/forwarded errors. sendSuccess exists so controllers (written in
// later modules) don't hand-roll the success envelope inconsistently.

function sendSuccess(res, statusCode = 200, data = {}) {
  return res.status(statusCode).json({ success: true, data });
}

// Convenience for controllers that want to throw a structured error and
// let errorMiddleware format it, rather than building the response here.
// errorMiddleware reads err.statusCode and err.errors.
function apiError(message, statusCode = 500, errors = []) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.errors = errors;
  return err;
}

module.exports = { sendSuccess, apiError };
