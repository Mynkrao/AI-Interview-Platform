// controllers/interviewController.js
// PHASE 1 SCOPE: only generateQuestions, backing POST /api/interview/generate
// (SAD Section 8.2, SRS FR-03-04). submitSession, getHistory,
// getSessionById, and deleteSession (SAD Section 12.1's full file
// responsibility list for this controller) belong to later phases/modules
// and are not implemented here.

const interviewAIService = require('../services/interviewAIService');
const { sendSuccess } = require('../utils/apiResponse');

// POST /api/interview/generate (SAD Section 8.2 / SRS FR-03-04)
// Body: {type, domain, count, difficulty, mode, company?} — validated by
// validators/interviewValidator.js before this handler runs.
async function generateQuestions(req, res, next) {
  const { type, domain, count, difficulty, mode, company } = req.body;

  const questions = await interviewAIService.generateQuestions(type, domain, count, difficulty, mode, company);

  return sendSuccess(res, 200, { questions });
}

module.exports = { generateQuestions };
