// utils/asyncHandler.js
// Wraps an async Express route/controller function so any rejected
// promise is forwarded to next(err) automatically, instead of requiring
// try/catch in every controller or crashing the process on an unhandled
// rejection. Pure infrastructure - no business logic, no knowledge of
// auth/interview/analytics domains.
//
// Usage (in a later module):
//   router.post('/register', asyncHandler(authController.register));

function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
