// config/env.js
// Loads and validates required environment variables at startup.
// SAD Section 12.1: "Validates required env vars exist on startup. Throws if missing."
// SAD Section 5.2: defines the required variable set (MONGODB_URI, JWT_SECRET,
// GEMINI_API_KEY, PORT, NODE_ENV).

const dotenv = require('dotenv');
dotenv.config();

// Variables that MUST be present for the server to run correctly.
// Auth/AI logic isn't implemented yet (Module 1 scope), but the SAD's
// deployment topology (Section 5.2) requires these to exist from day one
// so later modules don't silently run against undefined config.
const REQUIRED_VARS = ['MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    // Fail fast and loud. A server that boots with missing secrets and
    // fails later (e.g. on first DB write or first AI call) is much
    // harder to debug than one that refuses to start at all.
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        `Check server/.env against server/.env.example.`
    );
  }
}

validateEnv();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
};

module.exports = env;
