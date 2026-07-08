// app.js
// Express application setup: CORS, body parsing, and the error-handling
// middleware stack. This file builds the app object; server.js starts it.
//
// SAD Section 12.1: "Express app setup: CORS, JSON parser, Multer, route
// mounting, error middleware."
//
// ROUTE MOUNTING STATUS:
// authRoutes (Module 3) and interviewRoutes (Module 4, Phase 1 —
// /generate only) are wired below. feedbackRoutes and analyticsRoutes
// remain unwired until their modules exist — wiring a router that
// doesn't exist yet would be dead code, not "base middleware." Multer is
// route-specific (see authRoutes.js) and is not configured here.
// A single /api/health route is included as a deployment sanity check —
// this is plumbing, not a documented SRS feature.

const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

const app = express();

// --- Core middleware ---
app.use(
  cors({
    origin: env.isProduction ? process.env.CLIENT_URL : true,
    credentials: false, // No cookies anywhere in this architecture (SAD Section 9)
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health check (infrastructure, not an SRS/SAD-documented API) ---
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// --- Route mounting ---
app.use('/api/auth', authRoutes); // Auth module (Module 3)
app.use('/api/interview', interviewRoutes); // Interview module (Module 4, Phase 1: /generate only)
// app.use('/api/analytics', analyticsRoutes); // Added in Analytics module

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
