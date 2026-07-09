// pages/InterviewDetailPage.jsx
// Route: /history/:id (Protected).
// Module 5: Fetches a completed interview from MongoDB and displays the
// full AI feedback. No re-evaluation happens — data is read-only from DB.
// Reuses FeedbackCard and SessionSummary from Module 4.

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInterview } from '../api/interviewAPI';
import FeedbackCard   from '../components/interview/FeedbackCard';
import SessionSummary from '../components/interview/SessionSummary';

function InterviewDetailPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const [interview,  setInterview]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      setNotFound(false);
      try {
        const data = await getInterview(id);
        if (alive) setInterview(data);
      } catch (err) {
        if (!alive) return;
        if (err?.response?.status === 404 || err?.response?.status === 403) {
          setNotFound(true);
        } else {
          setError(err?.response?.data?.message || 'Failed to load this interview. Please try again.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <svg className="w-7 h-7 animate-spin text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-label="Loading interview">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <p className="text-gray-600 mb-4">This interview doesn&apos;t exist or was deleted.</p>
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="text-indigo-600 hover:underline text-sm font-medium"
        >
          ← Back to History
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="text-indigo-600 hover:underline text-sm font-medium"
        >
          ← Back to History
        </button>
      </div>
    );
  }

  // ── Map DB fields to component prop shapes ─────────────────────────────────
  // DB sessionSummary: { strengths: string[], improvements: string[] }
  // SessionSummary props: { summary?, overallStrengths, overallWeaknesses, recommendation? }
  // Note: "summary" narrative and "recommendation" text are not stored in DB
  // (only generated transiently during submit). We show what we have.
  const ss = interview.sessionSummary || {};
  const summaryProps = {
    summary:           null,                // not persisted
    overallStrengths:  ss.strengths    || [],
    overallWeaknesses: ss.improvements || [],
    recommendation:    null,                // not persisted
  };

  const formattedDate = interview.createdAt
    ? new Date(interview.createdAt).toLocaleString(undefined, {
        dateStyle: 'medium', timeStyle: 'short',
      })
    : '—';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ── Back navigation ── */}
      <button
        type="button"
        id="btn-back-history"
        onClick={() => navigate('/history')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to History
      </button>

      {/* ── Title block ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {interview.interviewType} — {interview.domain}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {formattedDate}
          {' · '}{interview.difficulty}
          {' · '}{interview.mode}
          {interview.company ? ` · ${interview.company}` : ''}
          {' · '}{interview.questionCount} questions
        </p>

        {/* Overall score badge */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100">
          <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
            Overall Score
          </span>
          <span className="text-lg font-bold text-indigo-700">
            {interview.overallScore}/10
          </span>
        </div>
      </div>

      {/* ── Session summary (Module 4 component, reused) ── */}
      <SessionSummary
        summary={summaryProps.summary}
        overallStrengths={summaryProps.overallStrengths}
        overallWeaknesses={summaryProps.overallWeaknesses}
        recommendation={summaryProps.recommendation}
      />

      {/* ── Per-question feedback (Module 4 component, reused) ── */}
      <div className="mt-6 space-y-4">
        {interview.qaPairs && interview.qaPairs.length > 0 ? (
          interview.qaPairs.map((qa, idx) => (
            <FeedbackCard
              key={qa._id || idx}
              questionNumber={idx + 1}
              question={qa.question}
              answer={qa.answer}
              score={qa.score}
              feedback={qa.feedback}
              // strengths & improvements are not stored per-answer in DB schema.
              // Pass empty arrays so FeedbackCard renders gracefully.
              strengths={[]}
              improvements={[]}
            />
          ))
        ) : (
          <p className="text-sm text-gray-400">No question data for this session.</p>
        )}
      </div>
    </div>
  );
}

export default InterviewDetailPage;
