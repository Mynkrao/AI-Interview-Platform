// controllers/interviewController.js
// SAD Section 8.2 / SRS FR-03-04 (generate) and FR-03-08 (submit).
// Phase 3 addition: submitSession — the complete evaluation + save flow.
// generateQuestions is unchanged.

const interviewAIService = require('../services/interviewAIService');
const InterviewSession   = require('../models/InterviewSession');
const { sendSuccess }    = require('../utils/apiResponse');

// POST /api/interview/generate (SAD Section 8.2 / SRS FR-03-04)
// Body: {type, domain, count, difficulty, mode, company?} — validated by
// validators/interviewValidator.js before this handler runs.
async function generateQuestions(req, res) {
  const { type, domain, count, difficulty, mode, company } = req.body;

  const questions = await interviewAIService.generateQuestions(
    type, domain, count, difficulty, mode, company
  );

  return sendSuccess(res, 200, { questions });
}

// POST /api/interview/submit (SAD Section 8.2 / SRS FR-03-08)
// Body: {type, domain, difficulty, mode, company?, qaPairs[]}
// Validates → evaluates every answer → calculates overallScore →
// generates session summary → saves InterviewSession → returns 201.
async function submitSession(req, res) {
  console.log(req.user);
  const { type, domain, difficulty, mode, company, qaPairs } = req.body;
  const userId = req.userId;

  // --- Step 1: Evaluate every answer (sequential to avoid rate-limit spikes) ---
  const evaluations = [];
  for (const pair of qaPairs) {
    const result = await interviewAIService.evaluateAnswer(pair.question, pair.answer);
    evaluations.push(result);
  }

  // --- Step 2: Build enriched pairs (full data for client response) ---
  const enrichedQaPairs = qaPairs.map((pair, i) => ({
    question:     pair.question,
    answer:       pair.answer,
    score:        evaluations[i].score,
    feedback:     evaluations[i].feedback,
    strengths:    evaluations[i].strengths,
    improvements: evaluations[i].improvements,
    aiModel:      evaluations[i].aiModel,
  }));

  // --- Step 3: Compute overall score (mean, one decimal place) ---
  const rawAvg = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
  const overallScore = Math.round(rawAvg * 10) / 10;

  // --- Step 4: Build schema-compliant pairs for the DB ---
  // InterviewSession.qaPairSchema has: question, answer, score, feedback, aiModel.
  // strengths / improvements are not in the schema; Mongoose strict mode would
  // strip them silently, so we exclude them explicitly for clarity.
  const dbQaPairs = enrichedQaPairs.map(({ question, answer, score, feedback, aiModel }) => ({
    question, answer, score, feedback, aiModel,
  }));

  // --- Step 5: Generate session-level summary ---
  const summaryResult = await interviewAIService.generateSessionSummary(
    type, domain, difficulty, dbQaPairs
  );

  // --- Step 6: Persist the session ---
  // sessionSummary schema: { strengths[], improvements[] }
  // We map: overallStrengths → strengths, overallWeaknesses → improvements.
  const session = await InterviewSession.create({
    userId,
    interviewType:  type,
    domain,
    difficulty,
    mode,
    company:        company || '',
    questionCount:  qaPairs.length,
    overallScore,
    sessionSummary: {
      strengths:    summaryResult.overallStrengths,
      improvements: summaryResult.overallWeaknesses,
    },
    qaPairs:  dbQaPairs,
    status:   'completed',
  });

  // --- Step 7: Return enriched data for the feedback page ---
  return sendSuccess(res, 201, {
    sessionId:    session._id,
    overallScore,
    sessionSummary: {
      summary:           summaryResult.summary,
      overallStrengths:  summaryResult.overallStrengths,
      overallWeaknesses: summaryResult.overallWeaknesses,
      recommendation:    summaryResult.recommendation,
    },
    qaPairs: enrichedQaPairs,
  });
}

module.exports = { generateQuestions, submitSession };

