// controllers/interviewController.js
// SAD Section 8.2.
// Module 4 Phase 1: generateQuestions (POST /generate)
// Module 4 Phase 3: submitSession   (POST /submit)
// Module 5:         getDashboard    (GET  /dashboard)
//                   getHistory      (GET  /history)
//                   getInterviewById(GET  /:id)
//                   deleteInterview (DELETE /:id)

const mongoose           = require('mongoose');
const interviewAIService = require('../services/interviewAIService');
const InterviewSession   = require('../models/InterviewSession');
const { sendSuccess, apiError } = require('../utils/apiResponse');

// ─── Module 4: generateQuestions ──────────────────────────────────────────────
// POST /api/interview/generate
async function generateQuestions(req, res) {
  const { type, domain, count, difficulty, mode, company } = req.body;
  const questions = await interviewAIService.generateQuestions(
    type, domain, count, difficulty, mode, company
  );
  return sendSuccess(res, 200, { questions });
}

// ─── Module 4: submitSession ──────────────────────────────────────────────────
// POST /api/interview/submit
async function submitSession(req, res) {
  const { type, domain, difficulty, mode, company, qaPairs } = req.body;
  const userId = req.userId;

  const evaluations = [];
  for (const pair of qaPairs) {
    const result = await interviewAIService.evaluateAnswer(pair.question, pair.answer);
    evaluations.push(result);
  }

  const enrichedQaPairs = qaPairs.map((pair, i) => ({
    question:     pair.question,
    answer:       pair.answer,
    score:        evaluations[i].score,
    feedback:     evaluations[i].feedback,
    strengths:    evaluations[i].strengths,
    improvements: evaluations[i].improvements,
    aiModel:      evaluations[i].aiModel,
  }));

  const rawAvg       = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
  const overallScore = Math.round(rawAvg * 10) / 10;

  const dbQaPairs = enrichedQaPairs.map(({ question, answer, score, feedback, aiModel }) => ({
    question, answer, score, feedback, aiModel,
  }));

  const summaryResult = await interviewAIService.generateSessionSummary(
    type, domain, difficulty, dbQaPairs
  );

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

// ─── Module 5: getDashboard ───────────────────────────────────────────────────
// GET /api/interview/dashboard
// Computes all stats from MongoDB — no dummy data.
async function getDashboard(req, res) {
  const userId = new mongoose.Types.ObjectId(req.userId);

  const now           = new Date();
  const weekStart     = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart    = new Date(now.getFullYear(), now.getMonth(), 1);

  // Single aggregation pass for totals, average, highest, and per-period counts.
  const [base] = await InterviewSession.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id:              null,
        totalInterviews:  { $sum: 1 },
        averageScore:     { $avg: '$overallScore' },
        highestScore:     { $max: '$overallScore' },
        interviewsThisWeek: {
          $sum: { $cond: [{ $gte: ['$createdAt', weekStart] }, 1, 0] },
        },
        interviewsThisMonth: {
          $sum: { $cond: [{ $gte: ['$createdAt', monthStart] }, 1, 0] },
        },
      },
    },
  ]);

  if (!base || base.totalInterviews === 0) {
    return sendSuccess(res, 200, {
      totalInterviews:      0,
      averageScore:         0,
      highestScore:         0,
      latestInterview:      null,
      interviewsThisWeek:   0,
      interviewsThisMonth:  0,
      scoreDistribution:    [],
      interviewTypeStats:   [],
      difficultyStats:      [],
    });
  }

  // Latest interview (separate sort query — cheapest option given the index).
  const latestInterview = await InterviewSession
    .findOne({ userId })
    .sort({ createdAt: -1 })
    .select('interviewType domain createdAt overallScore')
    .lean();

  // Score distribution buckets (0-20, 21-40, 41-60, 61-80, 81-100).
  // overallScore is 0-10 → map to 0-100 by *10 for the bucket labels
  // the front-end ScoreChart already expects.
  const scoreDistributionRaw = await InterviewSession.aggregate([
    { $match: { userId } },
    {
      $bucket: {
        groupBy: { $multiply: ['$overallScore', 10] },
        boundaries: [0, 21, 41, 61, 81, 101],
        default: 'unscored',
        output: { count: { $sum: 1 } },
      },
    },
    { $project: { _id: 0, range: '$_id', count: 1 } },
  ]);

  // Interview type distribution.
  const interviewTypeStats = await InterviewSession.aggregate([
    { $match: { userId } },
    { $group: { _id: '$interviewType', count: { $sum: 1 } } },
    { $project: { _id: 0, type: '$_id', count: 1 } },
  ]);

  // Difficulty distribution.
  const difficultyStats = await InterviewSession.aggregate([
    { $match: { userId } },
    { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    { $project: { _id: 0, difficulty: '$_id', count: 1 } },
  ]);

  return sendSuccess(res, 200, {
    totalInterviews:     base.totalInterviews,
    averageScore:        Math.round((base.averageScore ?? 0) * 10) / 10,
    highestScore:        base.highestScore ?? 0,
    latestInterview,
    interviewsThisWeek:  base.interviewsThisWeek,
    interviewsThisMonth: base.interviewsThisMonth,
    scoreDistribution:   scoreDistributionRaw,
    interviewTypeStats,
    difficultyStats,
  });
}

// ─── Module 5: getHistory ─────────────────────────────────────────────────────
// GET /api/interview/history
// ?page=1 &limit=10 &search=<text> &type= &difficulty= &mode= &sort=latest
async function getHistory(req, res) {
  const userId = new mongoose.Types.ObjectId(req.userId);

  const page   = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit  = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
  const skip   = (page - 1) * limit;

  // Build filter object.
  const filter = { userId };
  if (req.query.type)       filter.interviewType = req.query.type;
  if (req.query.difficulty) filter.difficulty    = req.query.difficulty;
  if (req.query.mode)       filter.mode          = req.query.mode;
  // Search matches domain (case-insensitive substring).
  if (req.query.search) {
    filter.domain = { $regex: req.query.search.trim(), $options: 'i' };
  }

  // Sort mapping.
  const sortMap = {
    'latest':        { createdAt: -1 },
    'oldest':        { createdAt:  1 },
    'highest-score': { overallScore: -1, createdAt: -1 },
    'lowest-score':  { overallScore:  1, createdAt: -1 },
  };
  const sortQuery = sortMap[req.query.sort] || sortMap['latest'];

  const [interviews, total] = await Promise.all([
    InterviewSession
      .find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .select('_id interviewType domain difficulty mode company overallScore questionCount status createdAt')
      .lean(),
    InterviewSession.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, {
    interviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext:    page * limit < total,
      hasPrev:    page > 1,
    },
  });
}

// ─── Module 5: getInterviewById ───────────────────────────────────────────────
// GET /api/interview/:id
async function getInterviewById(req, res) {
  const session = await InterviewSession.findById(req.params.id).lean();

  if (!session) {
    throw apiError('Interview not found', 404);
  }

  // Ownership check — never expose another user's interview.
  if (String(session.userId) !== String(req.userId)) {
    throw apiError('Not authorized to access this interview', 403);
  }

  return sendSuccess(res, 200, { interview: session });
}

// ─── Module 5: deleteInterview ────────────────────────────────────────────────
// DELETE /api/interview/:id
async function deleteInterview(req, res) {
  const session = await InterviewSession.findById(req.params.id).lean();

  if (!session) {
    throw apiError('Interview not found', 404);
  }

  if (String(session.userId) !== String(req.userId)) {
    throw apiError('Not authorized to delete this interview', 403);
  }

  await InterviewSession.findByIdAndDelete(req.params.id);

  return sendSuccess(res, 200, { message: 'Interview deleted successfully' });
}

module.exports = {
  generateQuestions,
  submitSession,
  getDashboard,
  getHistory,
  getInterviewById,
  deleteInterview,
};


