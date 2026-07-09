// server/controllers/interviewHistoryController.js
//
// Module 5 — Interview History & Analytics
// New controller. Does NOT modify interviewController.js (Module 4).
// Wire these handlers into interviewRoutes.js — see routes-snippet/interviewRoutes.additions.js
//
// ASSUMPTIONS (see "Assumptions Made" in final summary):
// - Model path: '../models/InterviewSession'
// - Auth middleware attaches req.userId (consistent with Module 1-3 session auth)
// - Standard API response shape: { success: boolean, data?: any, message?: string }
//   If your existing response format differs, adjust the res.json() calls only —
//   the query/aggregation logic underneath is format-agnostic.

const mongoose = require('mongoose');
const InterviewSession = require('../models/InterviewSession');

/**
 * GET /api/interview/dashboard
 * Returns aggregate statistics for the logged-in user's interview sessions.
 * All values computed live from MongoDB — no hardcoded/dummy data.
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Only completed sessions count toward score-based stats.
    const baseMatch = { userId, status: 'completed' };

    const [
      totalInterviews,
      scoreAgg,
      latestInterview,
      interviewsThisWeek,
      interviewsThisMonth,
      scoreDistribution,
      interviewTypeStats,
      difficultyStats,
    ] = await Promise.all([
      InterviewSession.countDocuments({ userId }),

      InterviewSession.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$overallScore' },
            highestScore: { $max: '$overallScore' },
          },
        },
      ]),

      InterviewSession.findOne({ userId })
        .sort({ createdAt: -1 })
        .select('_id interviewType domain difficulty overallScore status createdAt'),

      InterviewSession.countDocuments({ userId, createdAt: { $gte: startOfWeek } }),

      InterviewSession.countDocuments({ userId, createdAt: { $gte: startOfMonth } }),

      // Score buckets: 0-20, 21-40, 41-60, 61-80, 81-100
      InterviewSession.aggregate([
        { $match: baseMatch },
        {
          $bucket: {
            groupBy: '$overallScore',
            boundaries: [0, 21, 41, 61, 81, 101],
            default: 'unscored',
            output: { count: { $sum: 1 } },
          },
        },
      ]),

      InterviewSession.aggregate([
        { $match: { userId } },
        { $group: { _id: '$interviewType', count: { $sum: 1 } } },
      ]),

      InterviewSession.aggregate([
        { $match: { userId } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
    ]);

    const averageScore = scoreAgg[0]?.averageScore ?? 0;
    const highestScore = scoreAgg[0]?.highestScore ?? 0;

    return res.status(200).json({
      success: true,
      data: {
        totalInterviews,
        averageScore: Math.round(averageScore * 10) / 10,
        highestScore,
        latestInterview: latestInterview || null,
        interviewsThisWeek,
        interviewsThisMonth,
        scoreDistribution: scoreDistribution.map((b) => ({
          range: b._id,
          count: b.count,
        })),
        interviewTypeStats: interviewTypeStats.map((s) => ({
          type: s._id,
          count: s.count,
        })),
        difficultyStats: difficultyStats.map((s) => ({
          difficulty: s._id,
          count: s.count,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/interview/history
 * Query params: page, limit, search, type, difficulty, mode, sort
 */
exports.getInterviewHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const { search, type, difficulty, mode, sort } = req.query;

    const filter = { userId };
    if (type) filter.interviewType = type;
    if (difficulty) filter.difficulty = difficulty;
    if (mode) filter.mode = mode;
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ domain: regex }, { company: regex }];
    }

    const sortMap = {
      latest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'highest-score': { overallScore: -1 },
      'lowest-score': { overallScore: 1 },
    };
    const sortQuery = sortMap[sort] || sortMap.latest;

    const [interviews, total] = await Promise.all([
      InterviewSession.find(filter)
        .select(
          '_id interviewType domain difficulty mode company overallScore questionCount status createdAt'
        )
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit),
      InterviewSession.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        interviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit) || 1,
          totalItems: total,
          limit,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/interview/:id
 * Returns the complete session document. No AI evaluation happens here.
 */
exports.getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const interview = await InterviewSession.findOne({ _id: id, userId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found.',
      });
    }

    return res.status(200).json({ success: true, data: interview });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/interview/:id
 * Only the owning user may delete their own interview.
 */
exports.deleteInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const deleted = await InterviewSession.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or already deleted.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interview deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
