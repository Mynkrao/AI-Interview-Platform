// routes/interviewRoutes.js
// Mounts at /api/interview (app.js).
//
// Phase 3: POST /submit added (SAD Section 8.2 / SRS FR-03-08).
// Phase 1 routes unchanged.

const express = require('express');
const interviewController = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const { generateRules, submitRules } = require('../validators/interviewValidator');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post(
  '/generate',
  protect, generateRules, validateRequest,
  asyncHandler(interviewController.generateQuestions)
);

router.post(
  '/submit',
  protect, submitRules, validateRequest,
  asyncHandler(interviewController.submitSession)
);

module.exports = router;

