// app.js
// Express application setup: CORS, body parsing, and the error-handling
// middleware stack. This file builds the app object; server.js starts it.
//
// SAD Section 12.1: "Express app setup: CORS, JSON parser, Multer, route
// mounting, error middleware."
//
// MODULE 1 SCOPE NOTE:
// Route mounting (authRoutes, interviewRoutes, feedbackRoutes,
// analyticsRoutes) and Multer (tied to the resume-upload endpoint) are
// deliberately NOT wired here yet — they don't exist until the Auth and
// Interview modules are built. Wiring `app.use('/api/auth', authRoutes)`
// against a non-existent router would be dead code, not "base middleware."
// A single /api/health route is included as a deployment sanity check —
// this is plumbing, not a documented SRS feature.

const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');

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
// app.use('/api/interview', interviewRoutes); // Added in Interview module
// app.use('/api/analytics', analyticsRoutes); // Added in Analytics module

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
