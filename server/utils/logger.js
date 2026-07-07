// utils/logger.js
// Minimal timestamped console logger.
//
// NOT mandated by SRS or SAD - the tech stack table (SRS Section 7.2 /
// SAD Section 13) names no logging library, and db.js / errorMiddleware.js
// from Module 1 already log directly via console.error/console.log/console.warn
// without this file. This exists only so later modules have one consistent
// place to log from instead of scattering raw console calls. It changes
// nothing in any Module 1 file - purely additive, safe to delete if you
// don't want it.

const env = require('../config/env');

function ts() {
  return new Date().toISOString();
}

const logger = {
  info: (...args) => console.log(`[${ts()}] [info]`, ...args),
  warn: (...args) => console.warn(`[${ts()}] [warn]`, ...args),
  error: (...args) => console.error(`[${ts()}] [error]`, ...args),
  debug: (...args) => {
    if (!env.isProduction) console.debug(`[${ts()}] [debug]`, ...args);
  },
};

module.exports = logger;
