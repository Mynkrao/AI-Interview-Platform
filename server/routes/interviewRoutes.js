// routes/interviewRoutes.js
// Mounts at /api/interview (app.js).
//
// Module 4 Phase 1:  POST /generate
// Module 4 Phase 3:  POST /submit
// Module 5:          GET  /dashboard
//                    GET  /history
//                    GET  /:id
//                    DELETE /:id
//
// ORDERING NOTE: /dashboard and /history must be declared before /:id so
// Express does not greedily match the literal path segment as an ObjectId.

const express             = require('express');
const interviewController = require('../controllers/interviewController');
const { protect }         = require('../middleware/authMiddleware');
const {
  generateRules,
  submitRules,
  historyQueryRules,
  idParamRules,
} = require('../validators/interviewValidator');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler    = require('../utils/asyncHandler');

const router = express.Router();

// ── Module 4 ──────────────────────────────────────────────────────────────────
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

// ── Module 5 ──────────────────────────────────────────────────────────────────
router.get(
  '/dashboard',
  protect,
  asyncHandler(interviewController.getDashboard)
);

router.get(
  '/history',
  protect, historyQueryRules, validateRequest,
  asyncHandler(interviewController.getHistory)
);

router.get(
  '/:id',
  protect, idParamRules, validateRequest,
  asyncHandler(interviewController.getInterviewById)
);

router.delete(
  '/:id',
  protect, idParamRules, validateRequest,
  asyncHandler(interviewController.deleteInterview)
);

module.exports = router;
