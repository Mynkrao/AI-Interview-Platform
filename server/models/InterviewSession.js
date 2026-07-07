// models/InterviewSession.js
// Mongoose schema for the `interviewsessions` collection.
// Fields per SRS Section 9.2. Indexes per SRS Section 9.3 (Table 10) plus
// one addition from SAD v2.0 (documented below).
//
// qaPairs and sessionSummary are embedded sub-documents, not separate
// collections/refs — SAD Section 7.1: "Embedded because Q&A pairs are
// always queried together with their parent session and never accessed
// independently."

const mongoose = require('mongoose');

const qaPairSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    feedback: {
      type: String,
      default: '',
    },
    aiModel: {
      type: String,
      default: 'gemini-1.5-flash', // SAD Section 2.2
    },
  },
  { _id: false } // qaPairs are never fetched/updated by their own id independently of the session
);

const sessionSummarySchema = new mongoose.Schema(
  {
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // SRS Table 10: interviewsessions.userId -> Regular index
    },
    interviewType: {
      type: String,
      required: true,
      enum: ['Technical', 'HR', 'Behavioral', 'Mixed'], // SRS FR-03-01
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced'], // SRS FR-03-03
    },
    mode: {
      type: String,
      required: true,
      enum: ['Practice', 'Timed'], // SRS FR-03-03
    },
    company: {
      type: String,
      default: '', // optional per SRS FR-03-03 ("If no company is selected...")
      trim: true,
    },
    questionCount: {
      type: Number,
      required: true,
      enum: [5, 10, 15], // SRS FR-03-03
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0, // set by interviewController as avg of qaPairs scores (Module 4 scope)
    },
    sessionSummary: {
      type: sessionSummarySchema,
      default: () => ({}),
    },
    qaPairs: {
      type: [qaPairSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['completed', 'abandoned'],
      default: 'completed',
      // NOTE: Neither SRS nor SAD specifies what sets a session to
      // "abandoned" (no partial-save/resume flow is documented anywhere
      // in the SRS user journeys or SAD sequence diagrams — sessions are
      // only persisted via POST /api/interview/submit). Defaulting to
      // 'completed' matches the only save path currently documented.
      // Flagging this as an open question for whoever designs the
      // Interview module: if abandoned sessions are meant to be created,
      // that write path doesn't exist yet anywhere in the architecture.
    },
  },
  { timestamps: true } // adds createdAt, updatedAt (SRS Section 9.2)
);

// SRS Table 10 indexes:
interviewSessionSchema.index({ userId: 1, createdAt: -1 }); // fast sorted history queries (SAD Section 3.4)
interviewSessionSchema.index({ userId: 1, domain: 1 }); // domain-level analytics aggregations

// SAD v2.0 addition (Section 7.3 / Section 14.9 gap #6): required to make
// GET /api/analytics/type-accuracy performant. This index is NOT in SRS
// Table 10 — it was added in the SAD's later gap-resolution pass to back
// an endpoint the SAD itself introduced. Implementing it here because the
// SAD (which the Document Control section says governs on conflict)
// explicitly lists it in its own Section 7.3 index table.
interviewSessionSchema.index({ userId: 1, interviewType: 1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
