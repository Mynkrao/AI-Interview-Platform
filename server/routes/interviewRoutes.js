// routes/interviewRoutes.js
// Mounts at /api/interview (app.js).
//
// PHASE 1 SCOPE: only POST /generate (SAD Section 8.2). The remaining
// routes SAD Section 8.2 documents for this file —
//   POST   /submit          Bearer JWT
//   GET    /history          Bearer JWT
//   GET    /history/:id      Bearer JWT
//   DELETE /history/:id      Bearer JWT
// — belong to later phases/modules and are not added here.

const express = require('express');
const interviewController = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const { generateRules } = require('../validators/interviewValidator');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/generate', protect, generateRules, validateRequest, asyncHandler(interviewController.generateQuestions));

module.exports = router;
